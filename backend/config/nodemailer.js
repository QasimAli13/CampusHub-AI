const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"CampusFlow AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(
      "Email sent successfully to:",
      to,
      "MessageId:",
      info.messageId,
    );
    return true;
  } catch (error) {
    console.error("Nodemailer Error:", error.message);
    return false;
  }
};

module.exports = sendEmail;
