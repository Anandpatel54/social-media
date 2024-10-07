import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import { Comment } from "../models/commentModel.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res
        .status(400)
        .json({ message: "Image required", success: false });
    }
    // image upload
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "auther", select: "-password" });

    return res.status(201).json({
      message: "New Post Added",
      success: true,
      post,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username, profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username, profilepicture",
        },
      });
    return res.status(200).json({
      message: "All posts",
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username, profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username, profilepicture",
        },
      });
    return res.status(200).json({
      message: "All posts",
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKrneValeUserkiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(400)
        .json({ message: "Post not found", success: false });
    }
    // like logic started
    await post.updateOne({ $addToSet: { likes: likeKrneValeUserkiId } });
    await post.save();

    // implement socket io for real time notification

    return res.status(200).json({
      message: "post liked",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const dislikePost = async (req, res) => {
  try {
    const dislikeKrneValeUserkiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(400)
        .json({ message: "Post not found", success: false });
    }
    // like logic started
    await post.updateOne({ $pull: { likes: dislikeKrneValeUserkiId } });
    await post.save();

    // implement socket io for real time notification

    return res.status(200).json({
      message: "post disliked",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneValeUserKiId = req.id;

    const { text } = req.body;
    const post = await Post.findById(postId);

    if (!text) {
      return res
        .status(400)
        .json({ message: "text is required", success: false });
    }
    const comment = Comment.create({
      text,
      author: commentKrneValeUserKiId,
      post: postId,
    }).populate({
      path: "author",
      select: "username, profilePicture",
    });
    post.comments.push(comment._id);
    await post.save();

    return res.status(200).json({
      message: "added Comment",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const { postId } = req.params.id;

    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username",
      "profilePicture"
    );
    if (!comments) {
      return res.status(404).json({
        message: "No comments found for this post",
        success: false,
      });
    }
    return res.status(200).json({
      comments,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "post not found !",
        success: false,
      });
    }
    // check if the logged-in user is the owner the post
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: "Unauthorized!",
        success: false,
      });
    }
    // delete post
    await Post.findByIdAndDelete(postId);

    // remove the post id from the user post
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    //delete associated comment
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      message: "post deleted",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "post not found !",
        success: false,
      });
    }

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      // already bookmark -> remove from the bookmark
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "post remove from bookmarks",
        success: true,
      });
    } else {
      // bookmarks karna padega
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "saved",
        message: "post bookmarked",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
