const express = require("express");
const router = express.Router();
const Like = require("../models/Like");
const verifyToken = require("../middlewares/Token");
const User = require("../models/User");
const Post = require("../models/Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");

// for liking a post
router.post("/", verifyToken, async (req, res) => {
    try {
        const { postId } = req.body;
        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);

        if (!postId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const response = await likePost(postId, userId);

        res.status(201).json({
            message: "Like created",
            like: response._id.toString(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// for deleting a like
router.delete("/", verifyToken, async (req, res) => {
    try {
        const { likeId } = req.body;

        const like = await Like.findById(likeId);

        if (!like) {
            return res.status(404).json({ message: "Like Not Found" });
        }

        if (!likeId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        await Promise.all([
            Like.findByIdAndDelete(likeId),
            Post.findByIdAndUpdate(like.postId, { $inc: { likesCount: -1 } }),
        ]);

        res.status(200).json({ message: "Like removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

function likePost(postId, userId) {
    return new Promise(async (res, rej) => {
        if (User.findById(userId) === null) {
            rej("User not found");
        }

        const post = await Post.findById(postId);

        if (!post) {
            rej("Post not found");
        }

        const like = new Like();
        like.postId = postId;
        like.userId = userId;
        like.createdAt = new Date();
        post.likesCount += 1;

        const response = await like.save();
        await post.save();

        res(response);
    });
}
