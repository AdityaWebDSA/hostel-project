const nodemailer = require("nodemailer");

function getMailCredentials() {
    const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

    if (!user || !pass) {
        throw new Error("Email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in your environment.");
    }

    return { user, pass };
}

function createTransporter() {
    const { user, pass } = getMailCredentials();

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
}

async function sendMail({ to, subject, html }) {
    const { user } = getMailCredentials();
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"UniNest" <${user}>`,
        to,
        subject,
        html,
    });
}

async function sendVerificationEmail(toEmail, username, verifyUrl) {
    await sendMail({
        to: toEmail,
        subject: "Verify your UniNest account",
        html: `
        <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7f8fa;">
            <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e4e8ef;">
                <div style="text-align:center;margin-bottom:24px;">
                    <h1 style="color:#0e2245;font-size:22px;margin:0;">Welcome to UniNest</h1>
                </div>
                <p style="color:#3d4f6b;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi <strong>${username}</strong>, please verify your email address to unlock all features: listings, bookings, and saved places.</p>
                <div style="text-align:center;margin:28px 0;">
                    <a href="${verifyUrl}" style="background:#0a5460;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color:#6b7a90;font-size:13px;margin:0;">Or copy this link: <a href="${verifyUrl}" style="color:#0a5460;">${verifyUrl}</a></p>
                <hr style="border:none;border-top:1px solid #e4e8ef;margin:24px 0;">
                <p style="color:#6b7a90;font-size:12px;margin:0;">This link expires in 24 hours. If you did not create a UniNest account, you can safely ignore this email.</p>
            </div>
        </div>`,
    });
}

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
                <p style="color:#3d4f6b;font-size:15px;line-height:1.6;margin:0 0 20px;">Hi <strong>${username}</strong>, we received a request to reset your UniNest password. Click the button below. This link expires in <strong>1 hour</strong>.</p>
                <div style="text-align:center;margin:28px 0;">
                    <a href="${resetUrl}" style="background:#0a5460;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:50px;font-weight:700;font-size:15px;display:inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color:#6b7a90;font-size:13px;margin:0;">Or copy this link: <a href="${resetUrl}" style="color:#0a5460;">${resetUrl}</a></p>
                <hr style="border:none;border-top:1px solid #e4e8ef;margin:24px 0;">
                <p style="color:#6b7a90;font-size:12px;margin:0;">If you did not request this, your account is safe. You can ignore this email.</p>
            </div>
        </div>`,
    });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
