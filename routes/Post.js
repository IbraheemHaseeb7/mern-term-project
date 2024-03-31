const express = require("express");
const router = express.Router();
const { Post } = require("../models/Post");

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
router.post("/", async (req, res) => {
    try {
        const body = req.body;

        if (!body.description || !body.userId || body.userId === "") {
            return res.status(400).json({ message: "Invalid Request" });
        }

        await writePost(body);
        res.status(201).json({ message: "Post created successfully" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// for Liking a Post
router.put("/", async (req, res) => {
    try {
        const body = req.body;

        if (!body.postId || !body.userId) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        await likePost(body.postId, body.userId);
        return res.status(201).json({ message: "Post liked successfully" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;

async function get20Posts(lastId = null) {
    const LIMIT = 20;

    if (lastId) {
        return await Post.find({ _id: { $lt: lastId } })
            .sort({ timestamp: -1 })
            .limit(LIMIT);
    } else {
        return await Post.find().sort({ timestamp: -1 }).limit(LIMIT);
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

function likePost(postId, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const post = await Post.findById(postId);

            if (!post) {
                return reject({ message: "Post not found" });
            }

            if (post.likes.some((like) => like.userId === userId)) {
                return reject({ message: "Post already liked" });
            }

            post.likes.addToSet({ userId: userId });
            post.likesCount += 1;
            await post.save();

            resolve(post);
        } catch (e) {
            reject(e);
        }
    });
}