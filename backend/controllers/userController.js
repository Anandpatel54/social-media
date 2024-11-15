import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";

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
    if (user) {
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
        message: "Something is missing, please check",
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

    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        // Check if post exists and the author matches
        if (post && post.author.equals(user._id)) {
          return post; // Return post if author matches
        }
        return null; // Return null if post not found or author does not match
      })
    );

    // Filter out null posts
    const filteredPosts = populatedPosts.filter((post) => post !== null);

    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: filteredPosts,
    };

    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.error(error); // Logging the error for debugging
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.cookie("token", "", { maxage: 0 }).json({
      message: "Logout successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId).select("-password");
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
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
        success: false,
      });
    }
    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKaruga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
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
        success: true,
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
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
