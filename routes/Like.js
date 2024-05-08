const express = require("express");
const router = express.Router();
const Like = require("../models/Like");
const verifyToken = require("../middlewares/Token");
const User = require("../models/User");
const Post = require("../models/Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");
const doesPostExists = require("../middlewares/Post");
const doesLikeExist = require("../middlewares/Like");

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

        console.log(response);

        res.status(201).json({
            message: "Like created",
            like: response._id.toString(),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
});

// we need to check if the user who made the like
// is disliking so we need to fetch the like first
// and verify it. That's why we are using doesLikeExist
// middleware
router.delete("/", verifyToken, doesLikeExist, async (req, res) => {
    try {
        const like = req.like;
        const cookes = req.cookies;
        const userIdFromToken = getUserIdFromToken(cookes.token);

        if (like.userId.toString() !== userIdFromToken) {
            return res.status(400).json({ message: "Bad Request" });
        }

        await Promise.allSettled([
            like.deleteOne(),
            Post.findByIdAndUpdate(like.postId, { $inc: { likesCount: -1 } }),
        ]);

        res.status(200).json({ message: "Like removed" });
    } catch (error) {
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
