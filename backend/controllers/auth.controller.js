import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15m"});
  const refreshToken = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
  return {accessToken, refreshToken};
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7); //7 days
}

const setCookie = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent CSRF attacks
    maxAge: 15 * 60 * 1000, //15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 * 1000, //7 days
  });
}

export const signup = async (req, res) => {
  const {email, password, name } = req.body;
  try {
    const userExist = await User.findOne({email});
    if (userExist) {
      return res.status(400).json({message: "User already exists"});
    }
    const user = await User.create({email, password, name});

    //authenticate
    const {accessToken, refreshToken} = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookie(res, accessToken, refreshToken);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({message: "Internal server error", error: error.message});
  }
};

export const login = (req, res) => {
  res.send("Hello World Login");
};

export const logout = (req, res) => {
  res.send("Hello World Logout");
};