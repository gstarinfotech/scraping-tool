const nodemailer = require('nodemailer');

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendOtpMail = async (email, otp, roleLabel) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"Gstar E-solution Pvt Ltd" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your OTP for ${roleLabel} Sign Up - Gstar E-solution Pvt Ltd`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="text-align: center; color: #0d6efd;">Gstar E-solution Pvt Ltd</h2>
        <p>Hello,</p>
        <p>Thank you for choosing Gstar E-solution Pvt Ltd. Please use the following One-Time Password (OTP) to complete your ${roleLabel} sign-up process:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #0d6efd;">${otp}</span>
        </div>
        <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone for security reasons.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Regards,<br><strong>Gstar E-solution Pvt Ltd Team</strong></p>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: gray; text-align: center;">Securing your data, empowering your business.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const sendWelcomeMail = async (name, email, password, roleLabel) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"Gstar E-Solution Pvt Ltd" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Gstar E-Solution Pvt Ltd',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden;">
        <div style="background-color:#004aad; padding:20px; color:white; text-align:center;">
          <h1>Welcome to Gstar E-Solution Pvt Ltd</h1>
        </div>
        <div style="padding:20px;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>We are excited to welcome you to <strong>Gstar E-Solution Pvt Ltd</strong> as an Order Management ${roleLabel}!</p>
          <p>Here are your login details:</p>
          <table style="width:100%; margin:20px 0;">
            <tr>
              <td style="padding:8px; background:#f4f4f4; font-weight:bold;">Username (Email):</td>
              <td style="padding:8px;">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px; background:#f4f4f4; font-weight:bold;">Password:</td>
              <td style="padding:8px;">${password}</td>
            </tr>
          </table>
          <p>Please keep this information safe and do not share it with anyone.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best Regards,<br><strong>Team Gstar</strong></p>
        </div>
        <div style="background-color:#f0f0f0; padding:10px; text-align:center; font-size:12px; color:#777;">
          © ${new Date().getFullYear()} Gstar E-Solution Pvt Ltd. All rights reserved.
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

module.exports = { sendOtpMail, sendWelcomeMail, generateOTP };
