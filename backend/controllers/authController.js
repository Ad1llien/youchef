import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";
import transporter from '../config/nodemailer.js'




export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      if (existingUser.isAccountVerified) {
        // если аккаунт уже есть и верифицирован
        return res.json({ success: false, message: "User already exists" });
      } else {
        // если аккаунт есть, но не верифицирован — пересылаем новый OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        existingUser.verifyOtp = otp;
        existingUser.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await existingUser.save();

        await transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: existingUser.email,
          subject: "Verify your account",
          text: `Welcome back ${existingUser.name}! Your OTP for account verification is: ${otp}`,
        });

        return res.json({ success: true, userId: existingUser._id });
      }
    }

    // создаём нового пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      isAccountVerified: false,
    });
    await user.save();

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your account",
      text: `Welcome ${user.name}! Your OTP for account verification is: ${otp}`,
    });

    return res.json({ success: true, userId: user._id });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.isAccountVerified) {
      return res.json({ success: false, message: "Email not verified. Please check your email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, token });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body; // можно передать email прямо после регистрации
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isAccountVerified) return res.json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 часа
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your account",
      text: `Your OTP for account verification is ${otp}`
    });

    return res.json({ success: true, message: "OTP sent to your email", userId: user._id });
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

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async  (req, res) => {
    try{ 
        return res.json({success: true})

    }catch(error) {
        res.json({success: false, message: error.message})
    }
}

export const sendResetOtp = async (req, res) => {
    const {email} = req.body;
    if(!email) {
        return res.json({success: false, message: "Email is required"})
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            res.json({success: false, message: "User not found"})
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailOption ={ 
            from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Password Reset OTP',
        text: `Your OTP for resetting your password is ${otp}. Use this password to proceed with resetting your password.`
        }
        
        await transporter.sendMail(mailOption);
        return res.json({success: true , message: "Otp sent to your email."})

    }catch(error){
        return res.json({success: false, message: error.message})

    }
}

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  // Проверка данных
  if (!email || !newPassword) {
    return res.json({
      success: false,
      message: "Email and new password are required"
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.json({
        success: false,
        message: "New password cannot be the same as the old password"
      });
    }

    // хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // сохраняем
    user.password = hashedPassword;

    // очищаем OTP (на всякий случай)
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    return res.json({ success: true });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // из middleware
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // проверяем старый пароль
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Old password incorrect" });
    }

    // проверка на одинаковый пароль
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.json({
        success: false,
        message: "New password cannot be the same"
      });
    }

    // хешируем новый
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    // ✅ отправка email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password changed",
      text: `Hello ${user.name}, your password has been successfully changed. If it wasn't you, contact support immediately.`
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};