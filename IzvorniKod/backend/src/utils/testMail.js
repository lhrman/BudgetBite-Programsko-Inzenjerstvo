import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: `"BudgetBite" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: "Test mail – BudgetBite",
  text: "Ako ovo vidiš, mail radi",
});

console.log("Test mail poslan");
