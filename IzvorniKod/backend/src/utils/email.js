import nodemailer from "nodemailer";

export const sendResetEmail = async (email, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // uklanjamo http:// da Gmail ne prepozna URL
  const safeLink = link.replace(/^https?:\/\//, "");

  await transporter.sendMail({
    from: `"BudgetBite" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset lozinke – BudgetBite",
    text: `
      Zatražen je reset lozinke.

      KORACI:
      1. Kopiraj donji link
      2. Zalijepi ga u browser

        ${safeLink}
    `,
  });
};
