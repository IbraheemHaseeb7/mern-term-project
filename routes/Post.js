const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const verifyToken = require("../middlewares/Token");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");
const { Types } = require("mongoose");

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
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const cookies = req.cookies;
        const postId = req.params.id;
        const userId = getUserIdFromToken(cookies.token);
        const post = await getPostById(userId, postId);
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

async function get20Posts(userId, lastId = true) {
    const LIMIT = 20;

    if (lastId) {
        return await Post.aggregate([
            {
                $lookup: {
                    from: "likes",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$postId", "$$postId"] },
                                        {
                                            $eq: [
                                                "$userId",
                                                new Types.ObjectId(userId),
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "likes",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $addFields: {
                    hasLiked: {
                        $cond: {
                            if: { $gt: [{ $size: "$likes" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $limit: LIMIT,
            },
            {
                $project: {
                    _id: 1,
                    description: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    timestamp: 1,
                    hasLiked: 1,
                    user: {
                        _id: 1,
                        name: 1,
                        pictureUri: 1,
                    },
                },
            },
        ]);
    } else {
        return await Post.find()
            .sort({ timestamp: -1 })
            .populate("userId")
            .limit(LIMIT);
    }
}

async function getPostById(userId, postId) {
    return await Post.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(postId),
            },
        },
        {
            $lookup: {
                from: "likes",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$postId", "$$postId"] },
                                    {
                                        $eq: [
                                            "$userId",
                                            new Types.ObjectId(userId),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: "likes",
            },
        },
        {
            $lookup: {
                from: "User",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user",
        },
        {
            $addFields: {
                hasLiked: {
                    $cond: {
                        if: { $gt: [{ $size: "$likes" }, 0] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                description: 1,
                likesCount: 1,
                commentsCount: 1,
                timestamp: 1,
                hasLiked: 1,
                user: {
                    _id: 1,
                    name: 1,
                    pictureUri: 1,
                },
            },
        },
    ]);
}

async function get20PostsById(userId, likesUserId = null, lastId = true) {
    const LIMIT = 20;

    if (!likesUserId) {
        likesUserId = userId;
    }

    if (lastId) {
        return await Post.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "likes",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$postId", "$$postId"] },
                                        {
                                            $eq: [
                                                "$userId",
                                                new Types.ObjectId(likesUserId),
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "likes",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $addFields: {
                    hasLiked: {
                        $cond: {
                            if: { $gt: [{ $size: "$likes" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $limit: LIMIT,
            },
            {
                $project: {
                    _id: 1,
                    description: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    timestamp: 1,
                    hasLiked: 1,
                    user: {
                        _id: 1,
                        name: 1,
                        pictureUri: 1,
                    },
                },
            },
        ]);
    } else {
        return await Post.find()
            .sort({ timestamp: -1 })
            .populate("userId")
            .limit(LIMIT);
    }
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
module.exports.get20PostsById = get20PostsById;
