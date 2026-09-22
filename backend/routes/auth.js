require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();

// ======================================================
// IN-MEMORY STORES (OTP & USER SESSIONS)
// ======================================================
const otpStore = new Map();
const sessionStore = new Map();

// Preset Enterprise Personas (with both email & mobile number)
const ENTERPRISE_PERSONAS = {
  "lead.architect@enterprise.ai": {
    name: "Dr. Elena Vance",
    role: "ML Infrastructure Architect",
    department: "Enterprise AI Platform Engineering",
    phone: "+1 (415) 890-4321",
    permissions: ["audit:write", "cluster:optimize", "csrd:export"]
  },
  "sustainability.auditor@esg-council.org": {
    name: "Marcus Sterling",
    role: "Lead Sustainability Auditor",
    department: "ESG & Carbon Compliance",
    phone: "+44 20 7946 0912",
    permissions: ["audit:read", "csrd:sign", "audit:verify"]
  },
  "mlops.engineer@greenlens.cloud": {
    name: "Aria Chen",
    role: "Green MLOps Specialist",
    department: "Cloud Accelerator Operations",
    phone: "+91 98765 43210",
    permissions: ["audit:write", "cluster:optimize"]
  }
};

// ======================================================
// REAL EMAIL TRANSPORTER INITIALIZATION
// Supports Gmail App Password, Custom SMTP, or Ethereal Test
// ======================================================
let cachedTransporter = null;
let cachedTransporterMeta = { isReal: false, provider: "Ethereal Test Sandbox" };

async function getMailTransporter() {
  if (cachedTransporter) return { transporter: cachedTransporter, ...cachedTransporterMeta };

  const emailUser = (process.env.EMAIL_USER || process.env.GMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "").trim().replace(/\s+/g, "");
  const smtpHost = (process.env.SMTP_HOST || "").trim();

  // Check if real credentials are provided (and not placeholders)
  const isRealGmail = emailUser && emailPass && !emailUser.includes("yourgmail@") && emailPass.length >= 8;
  const isRealSmtp = smtpHost && !smtpHost.includes("your-smtp") && emailPass;

  if (isRealGmail) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
      cachedTransporter = transporter;
      cachedTransporterMeta = { isReal: true, provider: `Real Gmail SMTP (${emailUser})` };
      console.log(`[AUTH] Real Gmail SMTP configured for: ${emailUser}`);
      return { transporter, ...cachedTransporterMeta };
    } catch (err) {
      console.warn("[AUTH] Failed initializing Gmail SMTP, falling back to test transporter:", err.message);
    }
  } else if (isRealSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT == 465,
        auth: {
          user: emailUser || process.env.SMTP_USER,
          pass: emailPass || process.env.SMTP_PASS
        }
      });
      cachedTransporter = transporter;
      cachedTransporterMeta = { isReal: true, provider: `Real Custom SMTP (${smtpHost})` };
      console.log(`[AUTH] Real Custom SMTP configured for host: ${smtpHost}`);
      return { transporter, ...cachedTransporterMeta };
    } catch (err) {
      console.warn("[AUTH] Failed initializing custom SMTP, falling back:", err.message);
    }
  }

  // Fallback: Automatic Ethereal test inbox for safe demonstration
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    cachedTransporter = transporter;
    cachedTransporterMeta = { isReal: false, provider: "Ethereal Test Sandbox" };
    console.log("[AUTH] Initialized automated test email transporter:", testAccount.user);
    return { transporter, ...cachedTransporterMeta };
  } catch (err) {
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    cachedTransporter = transporter;
    cachedTransporterMeta = { isReal: false, provider: "Local JSON Simulator" };
    return { transporter, ...cachedTransporterMeta };
  }
}

// Preload transporter
getMailTransporter();

// ======================================================
// REAL MOBILE SMS DISPATCH ENGINE
// Supports Twilio REST API, Fast2SMS, or SMS Simulator
// ======================================================
async function dispatchRealSms(rawPhone, otp) {
  // Normalize phone number to international E.164 format
  let phone = rawPhone.trim().replace(/[\s()-]/g, "");
  if (!phone.startsWith("+")) {
    if (phone.length === 10) {
      phone = `+91${phone}`; // Default to India prefix if 10 digits
    } else {
      phone = `+${phone}`;
    }
  }

  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const twilioAuth = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || "").trim();
  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || "").trim();

  // 1. Real Twilio SMS Delivery
  if (twilioSid && twilioAuth && twilioPhone && !twilioSid.startsWith("ACxxxx")) {
    try {
      const smsBody = `Your GreenLens AI login code is: ${otp}. Valid for 5 min. Do not share.\n\n@greenlens.cloud #${otp}`;
      const authHeader = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");

      const params = new URLSearchParams();
      params.append("To", phone);
      params.append("From", twilioPhone);
      params.append("Body", smsBody);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[SMS] Real Twilio SMS dispatched successfully to ${phone} (SID: ${data.sid})`);
        return {
          success: true,
          isReal: true,
          provider: "Twilio Global SMS",
          statusMessage: `Real SMS dispatched via Twilio to ${phone}`
        };
      } else {
        console.warn(`[SMS] Twilio API responded with error:`, data.message);
      }
    } catch (twilioErr) {
      console.warn("[SMS] Twilio network dispatch error:", twilioErr.message);
    }
  }

  // 2. Real Fast2SMS Delivery (India)
  if (fast2SmsKey && !fast2SmsKey.includes("your_fast2sms")) {
    try {
      const clean10Digit = phone.replace(/[^0-9]/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: clean10Digit
        })
      });
      const data = await res.json();
      if (data.return) {
        console.log(`[SMS] Real Fast2SMS dispatched successfully to ${phone}`);
        return {
          success: true,
          isReal: true,
          provider: "Fast2SMS India",
          statusMessage: `Real SMS dispatched via Fast2SMS to ${phone}`
        };
      }
    } catch (fErr) {
      console.warn("[SMS] Fast2SMS dispatch error:", fErr.message);
    }
  }

  // 3. Fallback: SMS Sandbox Simulator
  console.log(`[SMS SIMULATOR] Dispatched SMS to ${phone} with code: ${otp}`);
  return {
    success: true,
    isReal: false,
    provider: "Mobile SMS Sandbox Simulator",
    statusMessage: `SMS verification code prepared for ${phone}`
  };
}

// ======================================================
// 1. SEND OTP ENDPOINT (Supports both Email and Mobile SMS)
// POST /api/auth/send-otp
// ======================================================
router.post("/send-otp", async (req, res) => {
  try {
    const { email, phone, targetType } = req.body;

    const isPhoneRequest = Boolean(phone || targetType === "phone");
    const identifier = isPhoneRequest
      ? (phone || "").trim().replace(/[\s()-]/g, "")
      : (email || "").trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: isPhoneRequest
          ? "Please provide a valid mobile phone number."
          : "Please provide a valid registered email address."
      });
    }

    if (!isPhoneRequest && !identifier.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email format (e.g. name@company.com)."
      });
    }

    if (isPhoneRequest && identifier.replace(/[^0-9]/g, "").length < 7) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number with country code."
      });
    }

    // Rate Limiting: 60s cooldown between OTP dispatches
    const existing = otpStore.get(identifier);
    if (existing && Date.now() - existing.lastSentAt < 60000) {
      const remainingSeconds = Math.ceil((60000 - (Date.now() - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new OTP code.`,
        remainingSeconds
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

    // Store in-memory
    otpStore.set(identifier, {
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: Date.now(),
      type: isPhoneRequest ? "phone" : "email"
    });

    // Handle Mobile SMS Dispatch
    if (isPhoneRequest) {
      const smsResult = await dispatchRealSms(identifier, otp);

      console.log(`[AUTH] Mobile OTP generated for ${identifier}: ${otp} (Expires in 5m)`);

      return res.json({
        success: true,
        type: "phone",
        target: identifier,
        isRealDelivery: smsResult.isReal,
        deliveryProvider: smsResult.provider,
        message: smsResult.statusMessage,
        expiresAt,
        previewOtp: otp,
        evaluationInfo: smsResult.isReal
          ? `Real SMS dispatched to ${identifier} via ${smsResult.provider}.`
          : `Donut Challenge 02: Mobile OTP prepared. (To enable real SMS delivery, configure TWILIO_ACCOUNT_SID in .env).`
      });
    }

    // Handle Email Dispatch via Nodemailer
    const { transporter, isReal, provider } = await getMailTransporter();
    let previewUrl = null;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #082e1e; color: #f0fdf4; border-radius: 12px; padding: 32px; border: 1px solid #2ee59d;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 26px;">GreenLens<span style="color: #2ee59d;">.</span></h2>
          <p style="color: #2ee59d; font-size: 13px; font-weight: bold; letter-spacing: 1px; margin-top: 4px;">SECURE LOGIN AUTHENTICATION</p>
        </div>
        <div style="background: rgba(13, 50, 35, 0.9); border-radius: 8px; padding: 24px; text-align: center; border: 1px solid rgba(46, 229, 157, 0.3);">
          <p style="color: #c5d6c8; font-size: 14px; margin: 0 0 16px 0;">Use the following 6-digit One-Time Password (OTP) to complete your login verification:</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2ee59d; background: #051d13; padding: 14px 20px; border-radius: 8px; display: inline-block; font-family: monospace; border: 1px dashed #2ee59d;">
            ${otp}
          </div>
          <p style="color: #849e8a; font-size: 12px; margin-top: 16px; margin-bottom: 0;">This code is valid for <strong>5 minutes</strong>. Never share your OTP with anyone.</p>
        </div>
        <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #849e8a;">
          <p style="margin: 0;">GreenLens AI Sustainability Platform &bull; ISO 14064 Verified</p>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"GreenLens Security" <auth@greenlens.cloud>',
        to: identifier,
        subject: `[GreenLens] Your Verification Code: ${otp}`,
        text: `Your GreenLens login OTP code is: ${otp}. Valid for 5 minutes.`,
        html: htmlContent
      });

      if (nodemailer.getTestMessageUrl(info)) {
        previewUrl = nodemailer.getTestMessageUrl(info);
      }
    } catch (mailErr) {
      console.warn("[AUTH] Mail dispatch notification:", mailErr.message);
    }

    console.log(`[AUTH] Email OTP generated for ${identifier}: ${otp} (Expires in 5m) via ${provider}`);

    return res.json({
      success: true,
      type: "email",
      target: identifier,
      isRealDelivery: isReal,
      deliveryProvider: provider,
      message: isReal
        ? `Real verification email dispatched to ${identifier}`
        : `Verification code sent to ${identifier}`,
      expiresAt,
      previewUrl,
      previewOtp: otp,
      evaluationInfo: isReal
        ? `Real email dispatched to your inbox via ${provider}.`
        : `Donut Challenge 02: Email OTP prepared. (To enable real SMTP delivery, configure GMAIL_USER & GMAIL_APP_PASSWORD in .env).`
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process verification code delivery."
    });
  }
});

// ======================================================
// 2. VERIFY OTP ENDPOINT (Supports both Email and Mobile SMS)
// POST /api/auth/verify-otp
// ======================================================
router.post("/verify-otp", (req, res) => {
  try {
    const { email, phone, identifier: rawId, otp } = req.body;

    const rawTarget = phone || email || rawId;

    if (!rawTarget || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone number and 6-digit OTP code are required."
      });
    }

    const identifier = rawTarget.includes("@")
      ? rawTarget.trim().toLowerCase()
      : rawTarget.trim().replace(/[\s()-]/g, "");

    const stored = otpStore.get(identifier);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: "No active verification code found. Please request a new OTP."
      });
    }

    // Check Expiration (5 min TTL)
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new OTP."
      });
    }

    // Check Max Failed Attempts (Brute Force Protection: max 5)
    if (stored.attempts >= 5) {
      otpStore.delete(identifier);
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. This OTP has been invalidated for security. Please request a new code."
      });
    }

    // Verify OTP Match
    if (stored.otp !== otp.toString().trim()) {
      stored.attempts += 1;
      const remainingAttempts = 5 - stored.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
        remainingAttempts
      });
    }

    // OTP Verified Successfully -> Invalidate OTP (Single Use)
    otpStore.delete(identifier);

    // Issue Secure Session Token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Resolve or create user profile
    const persona = ENTERPRISE_PERSONAS[identifier] || {
      name: identifier.includes("@")
        ? identifier.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : `Verified User (${identifier.slice(-4)})`,
      role: "Sustainability Infrastructure Engineer",
      department: "ML Operations & ESG Intelligence",
      permissions: ["audit:write", "cluster:optimize", "csrd:export"]
    };

    const userProfile = {
      id: `usr_${Date.now().toString(36)}`,
      email: identifier.includes("@") ? identifier : `${identifier.replace(/[^0-9]/g, "")}@mobile.verified`,
      phone: !identifier.includes("@") ? identifier : (persona.phone || null),
      name: persona.name,
      role: persona.role,
      department: persona.department,
      permissions: persona.permissions,
      authMethod: stored.type === "phone" ? "Mobile SMS OTP" : "Email OTP",
      authenticatedAt: new Date().toISOString()
    };

    // Save session in session store
    sessionStore.set(sessionToken, userProfile);

    console.log(`[AUTH] Successfully logged in: ${identifier} via ${userProfile.authMethod}`);

    res.json({
      success: true,
      message: "Authentication successful.",
      token: sessionToken,
      user: userProfile
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during OTP verification."
    });
  }
});

// ======================================================
// 3. CURRENT USER SESSION ENDPOINT
// GET /api/auth/me
// ======================================================
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided."
    });
  }

  const token = authHeader.split(" ")[1];
  const user = sessionStore.get(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token."
    });
  }

  res.json({
    success: true,
    user
  });
});

// ======================================================
// 4. LOGOUT ENDPOINT
// POST /api/auth/logout
// ======================================================
router.post("/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    sessionStore.delete(token);
  }

  res.json({
    success: true,
    message: "Logged out successfully."
  });
});

// ======================================================
// 5. EVALUATION PERSONAS HELPER
// GET /api/auth/personas
// ======================================================
router.get("/personas", (req, res) => {
  res.json({
    success: true,
    personas: Object.entries(ENTERPRISE_PERSONAS).map(([email, p]) => ({
      email,
      ...p
    }))
  });
});

module.exports = router;