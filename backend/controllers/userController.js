import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "somthing is messing, please check",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (email) {
      return res.status(401).json({
        message: "This email already register",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "Account Created Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "somthing is messing, please check",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    };
    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1",
    });
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxage: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    return res.cookie("token", "", { maxage: 0 }).json({
      message: "Logout successfully",
      message: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (res, req) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId);
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (res, req) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "user not found!",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "profile updated",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (res, req) => {
  try {
    const suggestUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestUsers) {
      return res
        .status(400)
        .json({ message: "Currently do not have any user !", success: false });
    }
    return res.status(200).json({
      message: "Currently do not have any user !",
      success: true,
      users: suggestUsers,
    });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id;
    const jiskoFollowKaruga = req.params.id;
    if (followKrneWala == jiskoFollowKaruga) {
      return res.status(400).json({
        message: "you can’t folllow/unfollow yourself",
        message: false,
      });
    }
    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKaruga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        message: false,
      });
    }

    const isFollowing = user.following.includes(jiskoFollowKaruga);
    if (isFollowing) {
      // unfollow logic aaayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKaruga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKaruga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      return res.status(200).json({
        message: "Unfollowed  Successfully",
        message: true,
      });
    } else {
      //follow logic aayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKaruga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKaruga },
          { $push: { followers: followKrneWala } }
        ),
      ]);
      return res.status(200).json({
        message: "followed  Successfully",
        message: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
