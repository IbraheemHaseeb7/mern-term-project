const express = require("express");
const router = express.Router();
const authForPages = require("../middlewares/AuthForPages");
const { get20PostsById } = require("./Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");
const User = require("../models/User");
const Friends = require("../models/Friends");
const { Types } = require("mongoose");
const path = require("path");

router.get("/", authForPages, async (req, res) => {
    res.locals.layout = true;
    try {
        const userId = req.session.user?._id;
        const posts = await get20PostsById(null, userId, 5);

        return res.render("index.ejs", {
            title: "Home",
            posts: posts,
            error: null,
        });
    } catch (error) {
        return res.render("index.ejs", {
            title: "Home",
            posts: [],
            error: error.message,
        });
    }
});

router.get("/login", (req, res) => {
    res.locals.layout = false;
    res.render("auth.ejs", { title: "Login" });
});

router.get("/signup", (req, res) => {
    res.locals.layout = false;
    res.render("auth.ejs", { title: "Sign Up" });
});

router.get("/profile/:userId", authForPages, async (req, res) => {
    const { userId } = req.params;
    res.locals.layout = true;

    try {
        if (userId === req.session.user?._id) {
            const posts = await get20PostsById(userId, userId, 5, 0);

            res.render("profile.ejs", {
                title: "Welcome Back",
                currentUser: {
                    ...req.session.user,
                    isFriend: true,
                    canAddFriend: false,
                    hasSentFriendRequest: false,
                },
                posts: posts,
            });
        } else {
            const otherUserId = req.session.user?._id;
            const user = await User.aggregate([
                {
                    $match: { _id: new Types.ObjectId(userId) },
                },
                {
                    $lookup: {
                        from: "friends",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$user1",
                                                            new Types.ObjectId(
                                                                userId
                                                            ),
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$user2",
                                                            new Types.ObjectId(
                                                                otherUserId
                                                            ),
                                                        ],
                                                    },
                                                ],
                                            },
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$user1",
                                                            new Types.ObjectId(
                                                                otherUserId
                                                            ),
                                                        ],
                                                    },
                                                    {
                                                        $eq: [
                                                            "$user2",
                                                            new Types.ObjectId(
                                                                userId
                                                            ),
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            { $limit: 1 },
                        ],
                        as: "friendship",
                    },
                },
                {
                    $lookup: {
                        from: "friendrequests",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$from",
                                                    new Types.ObjectId(
                                                        otherUserId
                                                    ),
                                                ],
                                            },
                                            {
                                                $eq: [
                                                    "$to",
                                                    new Types.ObjectId(userId),
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            { $limit: 1 },
                        ],
                        as: "friendRequestSent",
                    },
                },
                {
                    $lookup: {
                        from: "friendrequests",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$from",
                                                    new Types.ObjectId(userId),
                                                ],
                                            },
                                            {
                                                $eq: [
                                                    "$to",
                                                    new Types.ObjectId(
                                                        otherUserId
                                                    ),
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            { $limit: 1 },
                        ],
                        as: "friendRequestReceived",
                    },
                },
                {
                    $addFields: {
                        isFriend: { $gt: [{ $size: "$friendship" }, 0] },
                        hasSentFriendRequest: {
                            $gt: [{ $size: "$friendRequestSent" }, 0],
                        },
                        hasReceivedFriendRequest: {
                            $gt: [{ $size: "$friendRequestReceived" }, 0],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        isFriend: 1,
                        friendsCount: 1,
                        pictureUri: 1,
                        coverUri: 1,
                        bio: 1,
                        joiningDate: 1,
                        hasSentFriendRequest: 1,
                        hasReceivedFriendRequest: 1,
                    },
                },
            ]);
            const posts = await get20PostsById(
                userId,
                req.session.user?._id,
                5,
                0
            );

            res.render("profile.ejs", {
                title: user[0].name,
                currentUser: { ...user[0], canAddFriend: true },
                posts: posts,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

router.get("/chats", authForPages, async (req, res) => {
    res.locals.layout = true;
    const userId = req.session.user?._id;

    try {
        const friendsData = await Friends.find({
            $or: [
                { user1: new Types.ObjectId(userId) },
                { user2: new Types.ObjectId(userId) },
            ],
        })
            .populate("user1", "_id name pictureUri joiningDate")
            .populate("user2", "_id name pictureUri joiningDate");

        const friends = friendsData.map((friend) => {
            if (friend.user1._id.toString() === userId) {
                return friend.user2;
            }
            return friend.user1;
        });

        res.render("chats.ejs", {
            title: "Chats",
            friends: friends,
        });
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

router.get("/network", (req, res) => {
    res.locals.layout = true;
    res.render("network.ejs");
});

router.get("/landing", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/landing/index.html"));
});

router.get("/contactus", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/contact/index.html"));
});

module.exports = router;
