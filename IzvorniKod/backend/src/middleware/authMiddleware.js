import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Nedostaje token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Neispravan ili istekao token" });
  }
}

//funkcija koja provjerava je li korisnik smije pristupiti
export function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Zabranjen pristup – samo admin!" });
    }
    next();
  });
}
