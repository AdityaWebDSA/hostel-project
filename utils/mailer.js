const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// ── Shared email wrapper ──
async function sendMail({ to, subject, html }) {
    await transporter.sendMail({
        from: `"UniNest" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
}

// ── Verification email ──
async function sendVerificationEmail(toEmail, username, verifyUrl) {
    await sendMail({
        to: toEmail,
        subject: "Verify your UniNest account",
        html: `
        <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7f8fa;">
            <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e4e8ef;">
                <div style="text-align:center;margin-bottom:24px;">
                    <h1 style="color:#0e2245;font-size:22px;margin:0;">Welcome to UniNest 🎓</h1>
                </div>
                <p style="color:#3d4f6b;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi <strong>${username}</strong>, please verify your email address to unlock all features — listings, bookings, and saved places.</p>
                <div style="text-align:center;margin:28px 0;">
                    <a href="${verifyUrl}" style="background:#0a5460;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color:#6b7a90;font-size:13px;margin:0;">Or copy this link: <a href="${verifyUrl}" style="color:#0a5460;">${verifyUrl}</a></p>
                <hr style="border:none;border-top:1px solid #e4e8ef;margin:24px 0;">
                <p style="color:#6b7a90;font-size:12px;margin:0;">This link expires in 24 hours. If you didn't create a UniNest account, you can safely ignore this email.</p>
            </div>
        </div>`,
    });
}

// ── Password reset email ──
async function sendPasswordResetEmail(toEmail, username, resetUrl) {
    await sendMail({
        to: toEmail,
        subject: "Reset your UniNest password",
        html: `
        <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7f8fa;">
            <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e4e8ef;">
                <div style="text-align:center;margin-bottom:24px;">
                    <h1 style="color:#0e2245;font-size:22px;margin:0;">Reset your password</h1>
                </div>
                <p style="color:#3d4f6b;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi <strong>${username}</strong>, we received a request to reset your UniNest password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
                <div style="text-align:center;margin:28px 0;">
                    <a href="${resetUrl}" style="background:#0a5460;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color:#6b7a90;font-size:13px;margin:0;">Or copy this link: <a href="${resetUrl}" style="color:#0a5460;">${resetUrl}</a></p>
                <hr style="border:none;border-top:1px solid #e4e8ef;margin:24px 0;">
                <p style="color:#6b7a90;font-size:12px;margin:0;">If you didn't request this, your account is safe — just ignore this email.</p>
            </div>
        </div>`,
    });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };