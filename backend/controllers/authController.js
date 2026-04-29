import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import userModel from "../models/userModels.js";
import transporter from '../config/nodemailer.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const setCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────
// ─── Google OAuth ─────────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  const { credential, access_token } = req.body;

  try {
    let googleId, email, name, picture;

    if (credential) {
      // Старый способ — JWT токен (GoogleLogin компонент)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;

    } else if (access_token) {
      // Новый способ — access_token (useGoogleLogin хук)
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
      );
      if (!response.ok) {
        return res.json({ success: false, message: "Failed to get user info from Google" });
      }
      const data = await response.json();
      googleId = data.sub;
      email = data.email;
      name = data.name;
      picture = data.picture;

    } else {
      return res.json({ success: false, message: "No credential or access_token provided" });
    }

    // Ищем или создаём пользователя
    let user = await userModel.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = new userModel({
        name,
        email,
        googleId,
        password: "",
        isAccountVerified: true,
        avatar: picture || "",
      });
      await user.save();
    }

    const token = makeToken(user._id);
    setCookie(res, token);

    return res.json({
      success: true,
      token,
      needsPassword: !user.password || user.password === "",
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ─── Установить пароль (для Google пользователей) ─────────────────────────────
export const setPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.password && user.password !== "") {
      return res.json({ success: false, message: "Password already set" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      if (existingUser.isAccountVerified) {
        return res.json({ success: false, message: "User already exists" });
      } else {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        existingUser.verifyOtp = otp;
        existingUser.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await existingUser.save();
        await sendOtpEmail(existingUser.email, existingUser.name, otp);
        return res.json({ success: true, userId: existingUser._id });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword, isAccountVerified: false });
    await user.save();

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendOtpEmail(user.email, user.name, otp);
    return res.json({ success: true, userId: user._id });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.isAccountVerified) {
      return res.json({ success: false, message: "Email not verified. Please check your email." });
    }

    // Пользователь зарегался через Google и не установил пароль
    if (!user.password || user.password === "") {
      return res.json({ success: false, message: "This account uses Google login. Please sign in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = makeToken(user._id);
    setCookie(res, token);

    return res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ─── OTP helpers ──────────────────────────────────────────────────────────────
const sendOtpEmail = async (email, name, otp) => {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Verify your YouChef account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
        <div style="background:#242D96;padding:28px 24px;text-align:center;">
          <img src="https://youchef.kz/icons/logo-192.png" width="64" height="64" style="border-radius:14px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" alt="YouChef"/>
          <div style="color:white;font-size:22px;font-weight:600;">YouChef</div>
          <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px;">Account Verification</div>
        </div>
        <div style="padding:28px 24px;background:#ffffff;">
          <p style="color:#333;font-size:15px;margin:0 0 8px;">Hello, <strong>${name}</strong>!</p>
          <p style="color:#555;font-size:14px;margin:0 0 24px;">Use the code below to verify your account.</p>
          <div style="background:#f5f7ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#242D96;">${otp}</div>
          </div>
        </div>
        <div style="background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:12px;margin:0;">© ${new Date().getFullYear()} YouChef · <a href="https://youchef.kz" style="color:#aaa;text-decoration:none;">youchef.kz</a></p>
        </div>
      </div>
    `
  });
};

const sendWelcomeEmail = async (email, name) => {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Welcome to YouChef! 🍳",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
        
        <!-- Header -->
        <div style="background:#242D96;padding:32px 24px;text-align:center;">
          <img src="https://youchef.kz/icons/logo-192.png" width="72" height="72" style="border-radius:16px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" alt="YouChef"/>
          <div style="color:white;font-size:24px;font-weight:700;">Welcome to YouChef!</div>
          <div style="color:rgba(255,255,255,0.6);font-size:14px;margin-top:6px;">Your personal recipe platform 🍽</div>
        </div>

        <!-- Greeting -->
        <div style="padding:28px 24px 0;background:#ffffff;">
          <p style="color:#333;font-size:16px;margin:0 0 8px;">Hello, <strong>${name}</strong>! 👋</p>
          <p style="color:#555;font-size:14px;margin:0 0 24px;line-height:1.6;">
            We're thrilled to have you on board. YouChef is your personal cooking companion — 
            discover thousands of recipes, track nutrition, and plan your meals with AI.
          </p>
        </div>

        <!-- Features -->
        <div style="padding:0 24px;background:#ffffff;">
          <p style="color:#242D96;font-size:15px;font-weight:600;margin:0 0 16px;">What you can do with YouChef:</p>
          
          ${[
            { emoji: "🔍", title: "Discover Recipes", desc: "Browse thousands of dishes from around the world" },
            { emoji: "🤖", title: "AI Nutrition Analysis", desc: "Upload a food photo and get instant calorie breakdown" },
            { emoji: "📅", title: "Meal Planner", desc: "Generate a personalized weekly meal plan with AI" },
            { emoji: "🥘", title: "Create Own Meal", desc: "Find recipes based on ingredients you already have" },
            { emoji: "❤️", title: "Save Favorites", desc: "Build your personal recipe collection" },
            { emoji: "💎", title: "Premium Access", desc: "Unlock unlimited AI features and exclusive recipes" },
          ].map(f => `
            <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;">
              <div style="width:40px;height:40px;border-radius:10px;background:#EEF0FB;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${f.emoji}</div>
              <div>
                <div style="color:#242D96;font-size:14px;font-weight:600;margin-bottom:2px;">${f.title}</div>
                <div style="color:#788CA5;font-size:13px;">${f.desc}</div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Telegram Bot -->
        <div style="margin:24px 24px;background:#f0f4ff;border-radius:12px;padding:20px;border-left:4px solid #242D96;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:22px;">✈️</span>
            <span style="color:#242D96;font-size:15px;font-weight:600;">YouChef Telegram Bot</span>
          </div>
          <p style="color:#555;font-size:13px;margin:0 0 12px;line-height:1.6;">
            Get recipe recommendations, quick nutrition tips and updates directly in Telegram!
          </p>
          <a href="https://t.me/youchefBot" 
            style="display:inline-block;background:#242D96;color:white;text-decoration:none;padding:10px 20px;border-radius:30px;font-size:13px;font-weight:600;">
            Open @youchefBot →
          </a>
        </div>

        <!-- CTA Button -->
        <div style="padding:0 24px 28px;text-align:center;background:#ffffff;">
          <a href="https://youchef.kz" 
            style="display:inline-block;background:#242D96;color:white;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:15px;font-weight:600;">
            Start Cooking 🍳
          </a>
        </div>

        <!-- Footer -->
        <div style="background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} YouChef · 
            <a href="https://youchef.kz" style="color:#aaa;text-decoration:none;">youchef.kz</a> · 
            <a href="https://t.me/youchefBot" style="color:#aaa;text-decoration:none;">Telegram Bot</a>
          </p>
        </div>

      </div>
    `
  });
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isAccountVerified) return res.json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    await sendOtpEmail(user.email, user.name, otp);
    return res.json({ success: true, message: "OTP sent", userId: user._id });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.json({ success: false, message: "Missing details" });
  try {
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.verifyOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.verifyOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP expired" });
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    sendWelcomeEmail(user.email, user.name).catch(err =>
      console.warn("[Welcome email] Failed:", err.message)
    );
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try { return res.json({ success: true }); }
  catch (error) { res.json({ success: false, message: error.message }); }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email is required" });
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset your YouChef password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
          <div style="background:#242D96;padding:28px 24px;text-align:center;">
            <img src="https://youchef.kz/icons/logo-192.png" width="64" height="64" style="border-radius:14px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" alt="YouChef"/>
            <div style="color:white;font-size:22px;font-weight:600;">YouChef</div>
            <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px;">Password Reset</div>
          </div>
          <div style="padding:28px 24px;background:#ffffff;">
            <p style="color:#333;font-size:15px;margin:0 0 8px;">Hello, <strong>${user.name}</strong>!</p>
            <p style="color:#555;font-size:14px;margin:0 0 24px;">Use the code below to reset your password.</p>
            <div style="background:#f5f7ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#242D96;">${otp}</div>
            </div>
            <p style="color:#888;font-size:13px;margin:0;text-align:center;">This code expires in 24 hours.</p>
          </div>
          <div style="background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">© ${new Date().getFullYear()} YouChef · <a href="https://youchef.kz" style="color:#aaa;text-decoration:none;">youchef.kz</a></p>
          </div>
        </div>
      `
    });

    return res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.json({ success: false, message: "Email and new password are required" });
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.password) {
      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) return res.json({ success: false, message: "New password cannot be the same as the old password" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.json({ success: false, message: "Missing details" });
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.resetOtp === "" || user.resetOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.resetOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP expired" });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.json({ success: false, message: "Missing fields" });
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.json({ success: false, message: "Old password incorrect" });
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.json({ success: false, message: "New password cannot be the same" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL, to: user.email,
      subject: "Password changed",
      text: `Hello ${user.name}, your password has been successfully changed.`
    });
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};