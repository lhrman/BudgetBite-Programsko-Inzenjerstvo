import nodemailer from "nodemailer";

export const sendResetEmail = async (email, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "BudgetBite <no-reply@budgetbite>",
    to: email,
    subject: "Reset lozinke",
    html: `
      <p>Zatražen je reset lozinke.</p>
      <p>Klikni na link:</p>
      <a href="${link}">${link}</a>
    `,
  });
};
