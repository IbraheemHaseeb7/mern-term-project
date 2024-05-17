const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const verifyToken = require("../middlewares/Token");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");
const { Types } = require("mongoose");

// for getting 20 Posts
router.get("/", verifyToken, async (req, res) => {
    try {
        const { limit, skip } = req.query;

        if (!limit || !skip) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        const userId = req.session.user?._id;
        const posts = await get20PostsById(null, userId, +limit, +skip);
        res.status(200).json(posts);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// for getting a single Post
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user?._id;
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
        const userId = req.session.user?._id;

        if (!body.description) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        body.userId = userId;

        const post = await writePost(body);
        res.status(201).json(post);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

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

async function get20PostsById(
    userId = null,
    likesUserId = null,
    limit = 20,
    skip = 0
) {
    if (!likesUserId) {
        likesUserId = userId;
    }

    const pipeline = [
        {
            $sort: { timestamp: -1 },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
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
    ];

    if (userId) {
        pipeline.unshift({
            $match: {
                userId: new Types.ObjectId(userId),
            },
        });
    }

    return await Post.aggregate(pipeline);
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
module.exports.get20PostsById = get20PostsById;
