import test from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";

import { createApp } from "./src/appFactory.js";
import { pool } from "./src/config/db.js";

dotenv.config();

function uniqueEmail(prefix = "test") {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
}

async function api(baseUrl, path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    json = await res.json();
  } else {
    json = await res.text();
  }
  return { res, data: json };
}

async function cleanupUserByEmail(email) {
  // appuser je parent za student/creator/admin (FK ON DELETE CASCADE),
  // pa je dovoljno obrisati iz appuser.
  await pool.query("DELETE FROM appuser WHERE email = $1", [email]);
}

async function promoteToAdmin(userId) {
  await pool.query("INSERT INTO admin (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [
    userId,
  ]);
}
async function setStudentRole(_baseUrl, token) {
  // Iz tokena izvuci user id (tvoj generateToken sprema "id")
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  const userId = payload.id;

  // Direktno postavi student ulogu u bazi
  await pool.query("INSERT INTO student (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [userId]);
  await pool.query("UPDATE appuser SET role_chosen_at = NOW() WHERE user_id = $1", [userId]);

  // Vrati isti token (testu je bitno samo da ima neki token nista drugo)
  return token;
}


async function setupStudentProfile(baseUrl, token, { budget, allergens = [], equipment = [], restrictions = [] }) {
  const { res } = await api(baseUrl, "/api/student/setup-profile", {
    method: "POST",
    token,
    body: {
      weekly_budget: budget,
      allergens,
      equipment,
      restrictions,
    },
  });
  assert.equal(res.status, 200);
}

// ============
// Start/stop server once
// ============

let baseUrl;
let server;

test.before(async () => {
  const app = createApp();
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});


// 1) testLoginNonExistentUser (redovni test + greška)

test("testLoginNonExistentUser", async () => {
  const email = "nonexistant@example.com";

  const { res, data } = await api(baseUrl, "/api/auth/login", {
    method: "POST",
    body: { email, password: "wrongPassword123" },
  });

  assert.equal(res.status, 404);
  assert.equal(data?.message, "Korisnik nije pronađen ili nema lozinku.");
});

// 2) testRegisterSuccessful (redovni test)

test("testRegisterSuccessful", async () => {
  const email = uniqueEmail("register");

  try {
    const { res, data } = await api(baseUrl, "/api/auth/register", {
      method: "POST",
      body: { email, name: "Test User", password: "securePassword123" },
    });

    assert.equal(res.status, 201);
    assert.ok(data?.token);
    assert.equal(data?.user?.email, email);
  } finally {
    await cleanupUserByEmail(email);
  }
});


// 3) testCallNonExistingEndpoint (nepostojeća funkcionalnost)

test("testCallNonExistingEndpoint", async () => {
  const { res } = await api(baseUrl, "/api/this-endpoint-does-not-exist=)");
  assert.equal(res.status, 404);
});

// 4) testAdminRoleChange (redovni + autorizacija)
test("testAdminRoleChange", async () => {
  const adminEmail = uniqueEmail("admin");
  const targetUserId = 1;

  let adminToken;
  let originalRole; // "student" | "creator" | "none"

  async function detectRole(userId) {
    const s = await pool.query("SELECT 1 FROM student WHERE user_id = $1", [userId]);
    if (s.rowCount > 0) return "student";

    const c = await pool.query("SELECT 1 FROM creator WHERE user_id = $1", [userId]);
    if (c.rowCount > 0) return "creator";

    return "none";
  }

  async function assertRole(userId, expected) { 
    const role = await detectRole(userId);
    assert.equal(role, expected);
  }

  try {
    // 1) Kreiraj admin user (privremeno)
    let r = await api(baseUrl, "/api/auth/register", {
      method: "POST",
      body: { email: adminEmail, name: "Admin", password: "AdminPass123" },
    });
    assert.equal(r.res.status, 201);

    const adminId = r.data.user.user_id;
    await promoteToAdmin(adminId);

    // 2) Login admina (da dobije admin token)
    r = await api(baseUrl, "/api/auth/login", {
      method: "POST",
      body: { email: adminEmail, password: "AdminPass123" },
    });
    assert.equal(r.res.status, 200);

    adminToken = r.data.token;
    assert.ok(adminToken);

    // 3) Detektiraj originalnu ulogu korisnika user_id=1
    originalRole = await detectRole(targetUserId);

    // Očekujemo da je ili student ili creator (ako nije, možeš odlučiti default)
    assert.ok(
      originalRole === "student" || originalRole === "creator",
      `Korisnik ${targetUserId} nije ni student ni creator (trenutno: ${originalRole})`
    );

    // 4) Toggle: student -> creator, creator -> student
    const newRole = originalRole === "student" ? "creator" : "student";

    r = await api(baseUrl, "/api/admin/change-role", {
      method: "PUT",
      token: adminToken,
      body: { user_id: targetUserId, newRole: newRole },
    });
    assert.equal(r.res.status, 200);
    assert.equal(r.data?.message, `Uloga korisnika promijenjena na '${newRole}'.`);

    // 5) Provjeri DB stanje nakon promjene
    await assertRole(targetUserId, newRole);
  } finally {
    // 6) Vrati ulogu natrag (da test ne ostavi bazu u promijenjenom stanju)
    if (adminToken && originalRole && (originalRole === "student" || originalRole === "creator")) {
      await api(baseUrl, "/api/admin/change-role", {
        method: "PUT",
        token: adminToken,
        body: { user_id: targetUserId, newRole: originalRole },
      });

      // Opcionalno: potvrdi povratak
      await assertRole(targetUserId, originalRole);
    }

    // obriši privremenog admin korisnika
    await cleanupUserByEmail(adminEmail);
  }
});

// 5) testSuccesfullyGeneratedMealPlan (redovni)
test("testSuccesfullyGeneratedMealPlan", async () => {
  const email = uniqueEmail("student");

  try {
    // register
    let r = await api(baseUrl, "/api/auth/register", {
      method: "POST",
      body: { email, name: "Student", password: "StudentPass123" },
    });
    assert.equal(r.res.status, 201);
    let token = r.data.token;

    // set role student
    token = await setStudentRole(baseUrl, token);

    // uzmi neke postojeće ID-eve opreme 
    const eq = await pool.query("SELECT equipment_id FROM equipment ORDER BY equipment_id ASC LIMIT 2");
    const equipment = eq.rows.map((x) => x.equipment_id);

    await setupStudentProfile(baseUrl, token, { budget: 105, equipment, allergens: [], restrictions: [] });

    // generate
    r = await api(baseUrl, "/api/student/mealplan/generate", {
      method: "POST",
      token,
      body: {},
    });

    assert.equal(r.res.status, 201);
    assert.equal(r.data?.items?.length, 7);
    assert.ok(Number(r.data?.total_cost) > 0);
    assert.ok(Number(r.data?.total_cost) <= 25);
  } finally {
    await cleanupUserByEmail(email);
  }
});

// 6) testMealPlanGenerationWithInsufficientBudget (rubni uvjet)
test("testMealPlanGenerationWithInsufficientBudget", async () => {
  const email = uniqueEmail("lowbudget");

  try {
    let r = await api(baseUrl, "/api/auth/register", {
      method: "POST",
      body: { email, name: "LowBudget", password: "LowBudgetPass123" },
    });
    assert.equal(r.res.status, 201);
    let token = await setStudentRole(baseUrl, r.data.token);


    // uzmi neke postojeće ID-eve opreme 
    const eq = await pool.query("SELECT equipment_id FROM equipment ORDER BY equipment_id ASC LIMIT 2");
    const equipment = eq.rows.map((x) => x.equipment_id);

    await setupStudentProfile(baseUrl, token, { budget:15, equipment, allergens: [], restrictions: [] });

    r = await api(baseUrl, "/api/student/mealplan/generate", {
      method: "POST",
      token,
      body: {},
    });

    assert.equal(r.res.status, 400);
    assert.equal(r.data?.message, "Molimo upišite veći budžet od 20€.");
  } finally {
    await cleanupUserByEmail(email);
  }
});

// 7) testFilterRecipesByUnavailableName (rubni uvjet)
//potrebno nadodati

test("testStudentCannotCreateRecipe", async () => {
  const email = uniqueEmail("student-create-recipe");

  try {
    // register
    let r = await api(baseUrl, "/api/auth/register", {
      method: "POST",
      body: { email, name: "Student", password: "StudentPass123" },
    });
    assert.equal(r.res.status, 201);

    // set role student (direktno u bazi)
    const token = await setStudentRole(baseUrl, r.data.token);

    // pokušaj dodavanja recepta kao student
    r = await api(baseUrl, "/api/recipes", {
      method: "POST",
      token,
      body: {
        recipe: {
          recipe_name: "Test recept (student)",
          description: "Student ne smije objaviti recept.",
          prep_time_min: 10,
          price_estimate: 2.5,
          calories: 200,
          protein: 10,
          carbs: 20,
          fats: 5,
          preparation_steps: "Korak 1...",
        },
        ingredients: [],
        equipment: [],
        allergens: [],
      },
    });

    assert.equal(r.res.status, 403);
    // Ako API vraća poruku, možeš i ovo (ako znaš točan tekst):
    // assert.equal(r.data?.message, "Samo kreatori mogu objavljivati recepte");
  } finally {
    await cleanupUserByEmail(email);
  }
});
