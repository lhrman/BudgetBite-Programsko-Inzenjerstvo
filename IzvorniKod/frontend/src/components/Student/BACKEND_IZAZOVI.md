# 🎯 Gamification Feature - Backend Integration Guide

## 📋 Pregled

Ovaj dokument opisuje što backend tim treba implementirati za **Tjedni Izazovi** (Gamification) funkcionalnost, što je promijenjeno u bazi podataka, i kako frontend očekuje da API-ji rade.

---

## 🗄️ Promjene u Bazi Podataka

### Nova tablica: `student_challenges`

```sql
CREATE TABLE student_challenges (
    user_id INTEGER REFERENCES users(user_id),
    challenge_id INTEGER REFERENCES challenge(challenge_id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (user_id, challenge_id)
);
```

**Objašnjenje:**

- `user_id` - ID studenta
- `challenge_id` - ID izazova koji je dodijeljen studentu
- `assigned_at` - Kad je izazov dodijeljen (za računanje 7 dana)
- `completed_at` - Kad je izazov završen (`NULL` = nije završen, `TIMESTAMP` = završen)
- `PRIMARY KEY (user_id, challenge_id)` - Student može dobiti svaki izazov samo **JEDNOM**

**Postojeće tablice koje se koriste:**

- ✅ `challenge` - svi mogući izazovi
- ✅ `cilj_student` - koji cilj ima student
- ✅ `prehrambeni_cilj` - lista svih ciljeva

---

## 🔌 API Endpointi - Što Backend Mora Napraviti

### 1. **GET `/api/student/challenge/current`**

**Query parametar:**

- `userId` (integer) - ID studenta

**Logika:**

```javascript
1. Dohvati zadnji izazov studenta (zadnjih 7 dana):
   SELECT * FROM student_challenges
   WHERE user_id = userId
     AND assigned_at > NOW() - INTERVAL '7 days'
   ORDER BY assigned_at DESC
   LIMIT 1;

2. AKO NEMA izazova → Generiraj novi izazov (vidi funkciju ispod)

3. AKO IMA izazov:
   a) AKO je completed_at NULL → vrati status 'active'
   b) AKO je completed_at != NULL:
      - Izračunaj koliko je prošlo od assigned_at
      - AKO je prošlo < 7 dana → vrati status 'waiting' s countdown timerom
      - AKO je prošlo >= 7 dana → Generiraj novi izazov

4. AKO nema više izazova za generirati → vrati status 'all_completed'
```

**Funkcija: Generiraj novi izazov**

```sql
-- 1. Dohvati studentov cilj
SELECT cilj_id FROM cilj_student WHERE user_id = ${userId};

-- 2. Odaberi random izazov koji student JOŠ NIJE dobio
SELECT c.*
FROM challenge c
WHERE c.goal_id = ${studentGoalId}
  AND c.challenge_id NOT IN (
    SELECT challenge_id
    FROM student_challenges
    WHERE user_id = ${userId}
  )
ORDER BY RANDOM()
LIMIT 1;

-- 3. AKO NEMA više izazova → return null (sve završeno)

-- 4. AKO IMA → Insert u student_challenges
INSERT INTO student_challenges (user_id, challenge_id, assigned_at)
VALUES (${userId}, ${newChallengeId}, NOW());

-- 5. Return taj novi izazov
```

**Mogući Response-ovi:**

#### A) Aktivni izazov (student ima aktivan izazov)

```json
{
  "status": "active",
  "challenge": {
    "challenge_id": 5,
    "description": "Potroši manje od 50kn ovaj tjedan na hranu",
    "rule_summary": "Prati svoje troškove svaki dan",
    "badge_image_url": "/badges/budget_master.png",
    "assigned_at": "2025-01-20T10:00:00Z"
  }
}
```

#### B) Čekanje na novi izazov (završio, ali nije prošlo 7 dana)

```json
{
  "status": "waiting",
  "completed_challenge": {
    "challenge_id": 5,
    "description": "Potroši manje od 50kn ovaj tjedan",
    "badge_image_url": "/badges/budget_master.png",
    "completed_at": "2025-01-21T15:30:00Z"
  },
  "time_remaining": {
    "days": 5,
    "hours": 8,
    "minutes": 30
  }
}
```

**Kako izračunati `time_remaining`:**

```javascript
const assignedAt = new Date(challenge.assigned_at);
const sevenDaysLater = new Date(assignedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
const now = new Date();
const diff = sevenDaysLater - now;

const days = Math.floor(diff / (1000 * 60 * 60 * 24));
const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

return { days, hours, minutes };
```

#### C) Svi izazovi završeni

```json
{
  "status": "all_completed"
}
```

---

### 2. **POST `/api/student/challenge/complete`**

**Request Body:**

```json
{
  "userId": 29,
  "challengeId": 5
}
```

**Logika:**

```sql
-- Update completed_at na trenutno vrijeme
UPDATE student_challenges
SET completed_at = NOW()
WHERE user_id = ${userId}
  AND challenge_id = ${challengeId}
  AND completed_at IS NULL;  -- Samo ako nije već završeno
```

**Response:**

```json
{
  "success": true,
  "message": "Čestitamo! Osvojili ste badge!",
  "badge": {
    "challenge_id": 5,
    "badge_image_url": "/badges/budget_master.png",
    "completed_at": "2025-01-22T14:25:00Z"
  }
}
```

**Error Response (ako je već završeno):**

```json
{
  "success": false,
  "message": "Izazov je već završen"
}
```

---

### 3. **GET `/api/student/badges`**

**Query parametar:**

- `userId` (integer) - ID studenta

**Logika:**

```sql
-- Dohvati sve završene izazove studenta s badge slikama
SELECT
    sc.challenge_id,
    sc.completed_at,
    c.description,
    c.badge_image_url
FROM student_challenges sc
JOIN challenge c ON sc.challenge_id = c.challenge_id
WHERE sc.user_id = ${userId}
  AND sc.completed_at IS NOT NULL  -- Samo završeni
ORDER BY sc.completed_at DESC;
```

**Response:**

```json
{
  "badges": [
    {
      "challenge_id": 5,
      "description": "Potroši manje od 50kn ovaj tjedan",
      "badge_image_url": "/badges/budget_master.png",
      "completed_at": "2025-01-15T10:00:00Z"
    },
    {
      "challenge_id": 8,
      "description": "Kuhaj 5 obroka kod kuće",
      "badge_image_url": "/badges/home_chef.png",
      "completed_at": "2025-01-08T14:30:00Z"
    }
  ]
}
```

**Ako student nema badge-ova:**

```json
{
  "badges": []
}
```

---

## 🎨 Frontend - Što je Spremno

### Lokacija file-a:

- **Component:** `src/components/Student/GamificationPage.js`
- **CSS:** `src/styles/student.css` (dodan CSS za gamification na kraju)

### Frontend očekuje 3 API poziva:

```javascript
// 1. Dohvati trenutno stanje izazova
GET /api/student/challenge/current?userId=${user.user_id}

// 2. Završi izazov
POST /api/student/challenge/complete
Body: { userId, challengeId }

// 3. Dohvati sve badge-ove
GET /api/student/badges?userId=${user.user_id}
```

### Frontend automatskiHandlea:

✅ **Loading state** - Dok čeka API odgovor  
✅ **Error state** - Ako API poziv ne uspije  
✅ **3 različita stanja:**

- Aktivni izazov s gumbom "Završio sam izazov!"
- Waiting state s countdown timerom
- "Svi izazovi završeni" poruka

✅ **Badge kolekcija** - Prikazuje sve osvojene badge-ove na dnu stranice

---

## 🔧 Testiranje

### 1. **Testni scenariji:**

#### Scenarij A - Novi student (nema izazova)

```
1. Student se prvi put prijavi
2. Backend generira prvi random izazov prema njegovom cilju
3. Frontend prikazuje aktivni izazov
```

#### Scenarij B - Student završava izazov

```
1. Student klikne "Završio sam izazov!"
2. Backend update-a completed_at = NOW()
3. Frontend prikazuje "Čestitamo!" i countdown timer
4. Badge se pojavljuje u kolekciji
```

#### Scenarij C - Prošlo je 7+ dana

```
1. Student otvori stranicu
2. Backend vidi da je prošlo 7 dana od assigned_at
3. Backend generira novi random izazov
4. Frontend prikazuje novi aktivni izazov
```

#### Scenarij D - Svi izazovi završeni

```
1. Student je završio SVE izazove za svoj cilj
2. Backend vraća status: 'all_completed'
3. Frontend prikazuje zlatnu karticu "Svi izazovi riješeni! 🏆"
```

### 2. **Test podatci u bazi:**

```sql
-- Dodaj test izazove u challenge tablicu
INSERT INTO challenge (description, goal_id, rule_summary, badge_image_url)
VALUES
  ('Potroši manje od 50kn ovaj tjedan', 1, 'Prati troškove svaki dan', '/badges/budget.png'),
  ('Kuhaj 5 obroka kod kuće', 1, 'Koristi recepte s platforme', '/badges/chef.png'),
  ('Jedi 3 različita voća', 2, 'Kupi voće na akciji', '/badges/health.png');

-- Dodaj test studenta s ciljem
INSERT INTO cilj_student (user_id, cilj_id) VALUES (29, 1);
```

---

## 📝 Provjera - Da li je Backend Spreman?

Prije nego što spojite backend, provjerite:

- [ ] `student_challenges` tablica je kreirana
- [ ] Endpoint 1: `GET /api/student/challenge/current` radi
- [ ] Endpoint 2: `POST /api/student/challenge/complete` radi
- [ ] Endpoint 3: `GET /api/student/badges` radi
- [ ] Logika za generiranje novog izazova radi
- [ ] Logika za računanje `time_remaining` radi
- [ ] Test podatci su dodani u `challenge` tablicu
- [ ] Test student ima `goal_id` u `cilj_student` tablici

---

## 🐛 Moguće Greške i Rješenja

### Greška: "Greška pri dohvaćanju izazova"

**Uzrok:** API endpoint ne radi ili vraća pogrešan format  
**Rješenje:** Provjeri da backend vraća točan JSON format (vidi gore)

### Greška: Student nema cilj u `cilj_student`

**Uzrok:** Student nije prošao onboarding  
**Rješenje:** Backend mora prvo provjeriti ima li student `goal_id`, ako nema - vrati error ili default cilj

### Greška: Nema izazova za generirati

**Uzrok:** Nema izazova u `challenge` tablici za studentov `goal_id`  
**Rješenje:** Dodajte izazove u `challenge` tablicu

### Greška: completed_at se ne update-a

**Uzrok:** Provjeri da WHERE klauzula u UPDATE-u točno matchuje user_id i challenge_id  
**Rješenje:** Dodaj console.log ili SQL log da vidiš što se izvršava

---

## ✅ Kraj

Kad backend implementira ova 3 endpointa, frontend će automatski raditi! 🎉
