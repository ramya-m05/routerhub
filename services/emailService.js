const { Resend } = require("resend");

exports.sendOtpEmail = async (email, otp) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: "RouterKart <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP - RouterKart",
      html: `<h1>${otp}</h1>`,
    });

    console.log("✅ EMAIL SENT:", response);
    return true;

  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    return false;
  }
};