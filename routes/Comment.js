const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const verifyToken = require("../middlewares/Token");
const Post = require("../models/Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");
const doesCommentExist = require("../middlewares/Comments");
const doesPostExists = require("../middlewares/Post");

// added post middleware because
// we need to increment the comments count
// in the post so we have to make database query
// anyways so adding middleware would add more
// protection to the route
router.post("/", verifyToken, doesPostExists, async (req, res) => {
    try {
        const { description, postId } = req.body;

        if (!description || !postId) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);
        const response = await createComment(
            userId,
            postId,
            description,
            req.post
        );

        return res.status(201).json({
            message: "Comment created successfully",
            id: response._id.toString(),
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// added comment middleware because
// we need to check if the comment is being
// deleted by the person who made the comment
router.delete("/", verifyToken, doesCommentExist, async (req, res) => {
    try {
        const cookes = req.cookies;
        const userIdFromToken = getUserIdFromToken(cookes.token);

        const { commentId } = req.body;
        const comment = req.comment;

        if (comment.userId.toString() !== userIdFromToken) {
            return res.status(400).json({ message: "Bad Request" });
        }

        await Promise.all([
            comment.deleteOne(),
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

function createComment(userId, postId, description, post) {
    return new Promise(async (res, rej) => {
        try {
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
