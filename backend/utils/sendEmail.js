const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Email Verification ke liye OTP bhejne ka function
const sendOtpEmail = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: "CampusHub <no-reply@waleedimran.me>",
      to: email,
      subject: "Verify your CampusHub email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #1C2541; border-radius: 12px; background-color: #0B132B; color: #ffffff;">
          <h2 style="color: #48CAE4; text-align: center; font-size: 24px; margin-bottom: 10px;">
            Welcome to CampusHub!
          </h2>

          <p style="color: #cbd5e1; font-size: 15px;">
            Thank you for creating an account with us.
          </p>

          <p style="color: #94a3b8; font-size: 14px;">
            Use the 6-digit verification code below to verify your email address:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: rgba(72, 202, 228, 0.12); border: 2px dashed #48CAE4; color: #48CAE4; padding: 14px 32px; font-size: 26px; font-weight: bold; letter-spacing: 4px; border-radius: 10px;">
              ${otp}
            </div>
          </div>

          <p style="color: #64748b; font-size: 13px;">
            This OTP is valid for 10 minutes. If you did not create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("OTP Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("OTP Email sending error:", error);
    throw error;
  }
};

// 2. Forgot Password ke liye Reset Link bhejne ka function
const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/forgot-password?token=${resetToken}&email=${email}`;

    const data = await resend.emails.send({
      from: "CampusHub <no-reply@waleedimran.me>",
      to: email,
      subject: "Reset your CampusHub password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #1C2541; border-radius: 12px; background-color: #0B132B; color: #ffffff;">
          <h2 style="color: #48CAE4; text-align: center; font-size: 24px; margin-bottom: 10px;">
            Reset Your Password
          </h2>

          <p style="color: #cbd5e1; font-size: 15px;">
            We received a request to reset your CampusHub account password.
          </p>

          <p style="color: #94a3b8; font-size: 14px;">
            Click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #48CAE4; color: #0B132B; padding: 14px 28px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(72, 202, 228, 0.3);">
              Reset Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 13px; word-break: break-all;">
            If the button doesn't work, copy and paste this link in your browser:<br/>
            <a href="${resetUrl}" style="color: #48CAE4;">${resetUrl}</a>
          </p>

          <p style="color: #64748b; font-size: 13px;">
            If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Password Reset Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Reset Email sending error:", error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
  sendResetPasswordEmail,
};
