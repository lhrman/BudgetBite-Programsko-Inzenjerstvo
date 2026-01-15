import { UserModel } from "../models/User.js";

export const UserController = {
  async updateProfile(req, res) {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!userId) return res.status(401).json({ message: "Nedostaje user id." });
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Ime ne može biti prazno." });
    }

    try {
      const updated = await UserModel.updateName(userId, name.trim());
      if (!updated) return res.status(404).json({ message: "Korisnik nije pronađen." });

      return res.status(200).json({
        message: "Ime uspješno ažurirano.",
        user: updated,
      });
    } catch (err) {
      console.error("updateProfile error:", err);
      return res.status(500).json({ message: "Greška na serveru." });
    }
  },
};
