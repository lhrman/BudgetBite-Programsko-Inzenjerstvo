# Backend TODO - Settings Feature Integration

## 📍 Što frontend šalje:

Frontend ima **zakomentirane API callove** u componentama. Trebate napraviti 3 endpointa i odkomentirati pozive.

---

## 🔧 Endpointi za implementaciju:

### **1. Update User Name**

```
PUT /api/user/profile
```

**Frontend šalje:**

```json
{
  "name": "Novo Ime",
  "user_id": 30
}
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Backend treba:**

```sql
UPDATE users SET name = $1 WHERE user_id = $2;
```

**Response:**

```json
{ "success": true, "message": "Ime ažurirano" }
```

---

### **2. Export User Data (GDPR)**

```
GET /api/user/data/export?user_id={id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Backend treba vratiti JSON:**

```json
{
  "user_id": 30,
  "name": "Kreator Kreatović",
  "email": "random@creator.com",
  "role": "creator",
  "created_at": "2025-01-10T12:00:00Z",
  "exported_at": "2025-01-15T16:30:00Z"
}
```

**SQL:**

```sql
SELECT user_id, name, email, created_at
FROM users WHERE user_id = $1;
```

---

### **3. Delete User Account (GDPR)**

```
DELETE /api/user/account
```

**Headers:**

```
Authorization: Bearer {token}
```

**Backend treba:**

```sql
-- Obriši user i sve povezane podatke (cascade)
DELETE FROM users WHERE user_id = $1;
```

**Response:**

```json
{ "success": true, "message": "Račun obrisan" }
```

---

## 📂 Gdje odkomentirati API callove (frontend):

### **1. EditProfileCard.js** (linija ~24)

```javascript
// Odkomentiraj:
const response = await fetch("/api/user/profile", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: JSON.stringify({ name, user_id: user.user_id }),
});
```

### **2. ExportDataCard.js** (linija ~11)

```javascript
// Odkomentiraj:
const response = await fetch(`/api/user/data/export?user_id=${user.user_id}`, {
  method: "GET",
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const data = await response.json();
```

### **3. DeleteAccountModal.js** (linija ~18)

```javascript
// Odkomentiraj:
const response = await fetch("/api/user/account", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
```

---

## ✅ Checklist:

- [ ] Napraviti `PUT /api/user/profile`
- [ ] Napraviti `GET /api/user/data/export`
- [ ] Napraviti `DELETE /api/user/account`
- [ ] Dodati JWT autentikaciju
- [ ] Testirati s Postmanom
- [ ] **Javiti frontend timu da odkomentira API callove**

---

## 🧪 Test endpointi:

**Student:**

- email: random@student.com
- password: 1234
- user_id: 29

**Creator:**

- email: random@creator.com
- password: kreator
- user_id: 30

---
