const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const verifyToken = require("../middlewares/Token");
const User = require("../models/User");
const Post = require("../models/Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");

router.post("/", verifyToken, async (req, res) => {
    try {
        const { description, postId } = req.body;

        if (!description || !postId) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);
        const response = await createComment(userId, postId, description);

        return res.status(201).json({
            message: "Comment created successfully",
            id: response._id.toString(),
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.delete("/", verifyToken, async (req, res) => {
    try {
        const cookes = req.cookies;
        const userIdFromToken = getUserIdFromToken(cookes.token);

        const { commentId } = req.body;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment Not Found" });
        }

        if (comment.userId.toString() !== userIdFromToken) {
            return res.status(400).json({ message: "Bad Request" });
        }

        await Promise.all([
            Comment.findByIdAndDelete(commentId),
            Post.findByIdAndUpdate(comment.postId, {
                $inc: { commentsCount: -1 },
            }),
        ]);

        return res
            .status(200)
            .json({ message: "Comment deleted successfully" });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

module.exports = router;

function createComment(userId, postId, description) {
    return new Promise(async (res, rej) => {
        try {
            if (User.findById(userId) === null) {
                rej("User not found");
            }

            const post = await Post.findById(postId);

            if (!post) {
                rej("Post not found");
            }

            const comment = new Comment({
                userId: userId,
                postId: postId,
                description: description,
                createdAt: new Date(),
            });

            post.commentsCount += 1;

            const response = await comment.save();
            await post.save();

            res(response);
        } catch (e) {
            rej(e);
        }
    });
}
