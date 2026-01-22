# BACKEND_NOTIFIKACIJE.md

Ovaj dokument opisuje što backend treba implementirati da bi **trenutni frontend** (iz `IzvorniKod/frontend`) prikazivao in-app notifikacije.

## 0) Kontekst (što frontend trenutno očekuje)

Frontend koristi `src/context/NotificationContext.js` + `src/components/NotificationsBell.js` i zove sljedeće endpoint-e (preko `src/services/api.js`, `baseURL: http://localhost:3004/api`):

- `GET    /api/notifications?limit=50`
- `PATCH  /api/notifications/:id/read`
- `PATCH  /api/notifications/read-all`

Autentikacija: Axios interceptor šalje `Authorization: Bearer <token>` (token se čita iz `sessionStorage` ili `localStorage` pod ključem `token`).

Frontend očekuje da backend iz tokena može odrediti **trenutnog korisnika** (user_id).

---

## 1) Baza podataka (što je već dodano)

SQL je već izvršen (tablice + seed predložaka):

- `notification_templates` (50 generičkih predložaka s placeholderom `{{name}}`)
- `user_notifications` (konkretne, renderane notifikacije po korisniku)

### 1.1 notification_templates (predlošci)
Polja:
- `id BIGSERIAL PK`
- `key VARCHAR(80) UNIQUE`
- `category VARCHAR(40)` (npr. reminder/suggestion/challenge/gamification/system)
- `title_template TEXT` (sadrži `{{name}}`)
- `body_template TEXT`
- `severity VARCHAR(12)` (`info|success|warning|error`)
- `created_at TIMESTAMPTZ`

### 1.2 user_notifications (konkretne notifikacije)
Polja:
- `id UUID PK DEFAULT gen_random_uuid()`
- `user_id UUID NOT NULL`
- `template_id BIGINT NULL FK -> notification_templates(id)`
- `category VARCHAR(40)`
- `title TEXT` (renderano, bez `{{name}}`)
- `body TEXT`
- `meta JSONB` (opc.)
- `created_at TIMESTAMPTZ`
- `read_at TIMESTAMPTZ NULL`

Indeksi:
- `idx_user_notifications_user_created (user_id, created_at desc)`
- `idx_user_notifications_user_unread (user_id) WHERE read_at IS NULL`

---

## 2) JSON format koji frontend prikazuje

`NotificationsBell` čita ove ključeve:

- `id` (string/uuid)
- `title` (string)
- `body` (string) *(fallback: `message`)*
- `createdAt` (ISO string)  ✅ (frontend koristi `timeAgo(n.createdAt)`)
- `readAt` (ISO string | null) **ili** `read` (boolean)

Preporuka: vraćati `readAt` i `createdAt` u **camelCase**.

### 2.1 Preporučeni oblik jednog itema
```json
{
  "id": "7b1d8f4c-....",
  "title": "💧 Ana — vrijeme je za čašu vode",
  "body": "Mali podsjetnik: hidracija pomaže fokusu i energiji.",
  "category": "reminder",
  "severity": "info",
  "createdAt": "2026-01-22T12:34:56.789Z",
  "readAt": null,
  "meta": {}
}
```

> Napomena: `severity` se trenutno ne koristi u UI-u, ali je korisno vratiti.

---

## 3) Endpointi koje treba implementirati

### 3.1 GET /api/notifications?limit=50

**Opis:** vraća zadnjih N notifikacija za trenutnog korisnika (default 50), sortirano po `created_at desc`.

**Auth:** obavezno (Bearer token)

**Query param:**
- `limit` (int, opcionalno)

**Response (preporuka):**
- ili direktno array `[{...}, {...}]`
- ili objekt `{ "notifications": [...] }`

Frontend podržava oba.

**SQL (PostgreSQL) primjer:**
```sql
SELECT
  un.id,
  un.title,
  un.body,
  un.category,
  COALESCE(nt.severity, 'info') AS severity,
  un.meta,
  un.created_at,
  un.read_at
FROM user_notifications un
LEFT JOIN notification_templates nt ON nt.id = un.template_id
WHERE un.user_id = $1
ORDER BY un.created_at DESC
LIMIT $2;
```

**Mapping u JSON (camelCase):**
- `created_at -> createdAt`
- `read_at -> readAt`

---

### 3.2 PATCH /api/notifications/:id/read

**Opis:** označi jednu notifikaciju kao pročitanu (postavi `read_at = now()`), ali samo ako pripada trenutnom korisniku.

**Auth:** obavezno

**Path param:**
- `id` (uuid)

**SQL primjer:**
```sql
UPDATE user_notifications
SET read_at = COALESCE(read_at, NOW())
WHERE id = $1
  AND user_id = $2
RETURNING id, read_at;
```

**Response (minimalno):**
```json
{ "id": "<uuid>", "readAt": "<iso>" }
```

---

### 3.3 PATCH /api/notifications/read-all

**Opis:** označi sve nepročitane notifikacije trenutnog korisnika kao pročitane.

**Auth:** obavezno

**SQL primjer:**
```sql
UPDATE user_notifications
SET read_at = NOW()
WHERE user_id = $1
  AND read_at IS NULL;
```

**Response (preporuka):**
```json
{ "ok": true }
```

---

## 4) Kako backend treba “generirati” notifikacije (iz templateova)

Frontend NE generira notifikacije iz templateova – backend treba povremeno ili na događaje kreirati zapise u `user_notifications`.

### 4.1 Render personalizacije (zamjena {{name}})
Primjer (pseudo):
- `title = title_template.replace('{{name}}', user.name)`
- `body  = body_template.replace('{{name}}', user.name)`

### 4.2 Minimalni SQL za kreiranje jedne notifikacije iz templatea
```sql
INSERT INTO user_notifications (user_id, template_id, category, title, body, meta)
SELECT
  $1::uuid AS user_id,
  t.id     AS template_id,
  t.category,
  replace(t.title_template, '{{name}}', $2) AS title,
  replace(t.body_template,  '{{name}}', $2) AS body,
  '{}'::jsonb
FROM notification_templates t
WHERE t.key = $3
RETURNING id;
```
Parametri:
- `$1 = user_id`
- `$2 = user_name` (npr. "Ana")
- `$3 = template key` (npr. `REMINDER_WATER_1`)

### 4.3 Kako birati template (primjer)
- random po kategoriji:
```sql
SELECT id FROM notification_templates
WHERE category = $1
ORDER BY random()
LIMIT 1;
```

---

## 5) Edge-caseovi i preporuke

1. **Idempotentnost seed-a**: `notification_templates` već koristi `ON CONFLICT (key) DO NOTHING`.
2. **Paginacija** (opcionalno): kasnije se može dodati `before` cursor (`created_at < ...`) bez promjene UI-a.
3. **Vraćanje `read` boolean-a** (opcionalno):
   - `read: Boolean(read_at)` može olakšati UI, ali `readAt` je dovoljno.
4. **Time zone**: vraćati ISO datume (UTC) – JS `new Date(iso)` radi ispravno.
5. **Sigurnost**: svi update-i moraju filtrirati `user_id = currentUserId`.

---

## 6) Brzi “contract test” (što frontend radi)

- Kod logina frontend sprema token u `localStorage`.
- `NotificationProvider` nakon što dobije `user` (iz `/auth/profile`) pozove `GET /notifications?limit=50`.
- Klik na stavku pozove `PATCH /notifications/:id/read`.
- Klik “Označi sve pročitano” pozove `PATCH /notifications/read-all`.
- Ako backend endpointi još ne postoje ili vrate grešku, frontend tiho ostaje na lokalnom fallbacku.

> U produkciji je preporuka ugasiti lokalni fallback kad backend bude spreman.

---
