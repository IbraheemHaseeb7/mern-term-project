const express = require("express");
const router = express.Router();
const Like = require("../models/Like");
const verifyToken = require("../middlewares/Token");
const Post = require("../models/Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");
const doesPostExists = require("../middlewares/Post");
const mongoose = require("mongoose");

// added does post exist middleware because
// we need to increment the likes count
// for that we need to fetch post anyways
// this will add more protection to the route
router.post("/", verifyToken, doesPostExists, async (req, res) => {
    try {
        const { postId } = req.body;
        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);
        const response = await likePost(postId, userId, req.post);

        res.status(201).json({
            message: "Like created",
            like: response._id.toString(),
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// creating a batch request using transaction
// to maintain data entegerity
router.delete("/", verifyToken, async (req, res) => {
    const transaction = await mongoose.startSession();
    transaction.startTransaction();
    try {
        const cookes = req.cookies;
        const userIdFromToken = getUserIdFromToken(cookes.token);
        const { postId } = req.body;

        const like = await Like.findOne({
            userId: userIdFromToken,
            postId: postId,
        });

        if (like.userId.toString() !== userIdFromToken) {
            return res.status(400).json({ message: "Bad Request" });
        }

        await like.deleteOne();
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

        await transaction.commitTransaction();
        transaction.endSession();

        res.status(200).json({ message: "Like removed" });
    } catch (error) {
        console.log(error);

        transaction.abortTransaction();
        transaction.endSession();
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

function likePost(postId, userId, post) {
    return new Promise(async (res, rej) => {
        try {
            const like = new Like();
            like.postId = postId;
            like.userId = userId;
            like.createdAt = new Date();
            post.likesCount += 1;

            const likeResponse = await like.save();
            await post.save();

            res(likeResponse);
        } catch (error) {
            rej(error.message);
        }
    });
}
