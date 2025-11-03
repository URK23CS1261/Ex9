import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendMail from "../utils/mailer.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const SALT_ROUNDS = 10;

function genToken(user) {
  const payload = { id: user._id, username: user.username, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, username, password, confirmPassword } = req.body;
    if (!full_name || !email || !username || !password || !confirmPassword)
      return res
        .status(400)
        .json({ message: "Please fill all required fields." });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail)
      return res.status(409).json({ message: "Email already in use." });

    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(409).json({ message: "Username already taken." });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const verifyToken = crypto.randomBytes(24).toString("hex");
    const verifyExpires = Date.now() + 1000 * 60 * 60 * 24;

    const user = new User({
      full_name,
      email: email.toLowerCase(),
      username,
      password: hash,
      verifyToken,
      verifyExpires,
    });
    const saved = await user.save();

    const verifyLink = `${
      process.env.FRONTEND_ORIGIN || "http://localhost:5173"
    }/verify?token=${verifyToken}&email=${encodeURIComponent(saved.email)}`;
    await sendMail({
      to: saved.email,
      subject: "Verify your RealEstate Portal account",
      html: `<p>Hi ${saved.full_name},</p><p>Please verify your account by clicking <a href="${verifyLink}">here</a>.</p>`,
    });

    const token = genToken(saved);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "User registered successfully. Verification email sent.",
      user: {
        id: saved._id,
        full_name: saved.full_name,
        email: saved.email,
        username: saved.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res
        .status(400)
        .json({ message: "Please provide username/email and password." });

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    });
    if (!user) return res.status(401).json({ message: "Invalid username." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password." });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email first." });

    const token = genToken(user);
    setAuthCookie(res, token);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/verify", async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email)
      return res.status(400).json({ message: "Missing token or email" });

    const user = await User.findOne({
      email: email.toLowerCase(),
      verifyToken: token,
    });
    if (!user) return res.status(400).json({ message: "Invalid token" });
    if (user.verifyExpires && user.verifyExpires < Date.now())
      return res.status(400).json({ message: "Token expired" });

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(404).json({
        success: false,
        message: "token not found",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const user = await User.findOne({ email: decoded.email.toLowerCase() });
      res.json({
        success: true,
        user,
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Provide email" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link was sent." });
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    const resetExpires = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetToken = resetToken;
    user.resetExpires = resetExpires;
    await user.save();

    const resetLink = `${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}/reset?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    await sendMail({
      to: user.email,
      subject: "Reset your RealEstate Portal password",
      html: `<p>Hi ${user.full_name},</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });

    res.json({ message: "If that email exists, a reset link was sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;
    if (!email || !token || !newPassword || !confirmPassword) 
      return res.status(400).json({ message: "Missing fields" });

    if (newPassword !== confirmPassword) 
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({ email: email.toLowerCase(), resetToken: token });
    if (!user) return res.status(400).json({ message: "Invalid token" });
    if (user.resetExpires && user.resetExpires < Date.now()) 
      return res.status(400).json({ message: "Token expired" });

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hash;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out successfully" });
});

export default router;
