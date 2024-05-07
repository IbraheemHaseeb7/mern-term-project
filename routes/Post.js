const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const verifyToken = require("../middlewares/Token");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");

// for getting 20 Posts
router.get("/", async (req, res) => {
    try {
        const lastId = req.query.lastId;
        const posts = await get20Posts(lastId);
        res.status(200).json(posts);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// for getting a single Post
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const post = await getPostById(id);
        res.status(200).json(post);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// for creating a new Post
router.post("/", verifyToken, async (req, res) => {
    try {
        let body = req.body;
        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);

        if (!body.description) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        body.userId = userId;

        await writePost(body);
        res.status(201).json({ message: "Post created successfully" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

async function get20Posts(lastId = null) {
    const LIMIT = 20;

    if (lastId) {
        return await Post.find({ _id: { $lt: lastId } })
            .sort({ timestamp: -1 })
            .populate("userId")
            .limit(LIMIT);
    } else {
        return await Post.find()
            .sort({ timestamp: -1 })
            .populate("userId")
            .limit(LIMIT);
    }
}

function getPostById(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const post = await Post.findById(id);
            resolve(post);
        } catch (e) {
            reject(e);
        }
    });
}

async function writePost(post) {
    return new Promise(async (resolve, reject) => {
        try {
            const newPost = new Post({
                description: post.description,
                likesCount: 0,
                commentsCount: 0,
                likes: [],
                comments: [],
                userId: post.userId,
            });

            const uploadedPost = await newPost.save();
            resolve(uploadedPost);
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = router;
module.exports.get20Posts = get20Posts;
