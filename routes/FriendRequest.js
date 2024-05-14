const express = require("express");
const FriendRequest = require("../models/FriendsRequest");
const { Types } = require("mongoose");
const router = express.Router();
const verifyToken = require("../middlewares/Token");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");

router.get("/sent", verifyToken, async (req, res) => {
    try {
        let { skip } = req.query;

        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);

        if (!userId) {
            return res.status(400).json({ message: "User id is missing" });
        }

        if (!skip) {
            skip = 0;
        }

        const requests = await getMy20FriendRequests(userId, +skip);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

router.get("/received", verifyToken, async (req, res) => {
    try {
        let { skip } = req.query;

        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);

        if (!userId) {
            return res.status(400).json({ message: "User id is missing" });
        }

        if (!skip) {
            skip = 0;
        }

        const requests = await getReceived20FriendRequests(userId, +skip);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const { from, to } = req.body;
        if (!from || !to) {
            return res
                .status(400)
                .json({ message: "Incomplete Data sent in body" });
        }

        const request = new FriendRequest({ to: to, from: from });
        await request.save();

        res.status(201).json({ message: "Successfully sent request" });
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

router.delete("/", verifyToken, async (req, res) => {
    try {
        const { from, to } = req.body;
        if (!from || !to) {
            return res
                .status(400)
                .json({ message: "Incomplete Data sent in body" });
        }

        const response = await FriendRequest.deleteOne({ from, to });
        res.status(202).json({ message: "Successfully deleted request" });
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

function getMy20FriendRequests(userId, skip) {
    return new Promise(async (res, rej) => {
        try {
            const friendRequests = await FriendRequest.aggregate([
                { $match: { from: new Types.ObjectId(userId) } },
                { $sort: { timestamp: -1 } },
                { $skip: skip },
                { $limit: 20 },
                {
                    $lookup: {
                        from: "User",
                        localField: "to",
                        foreignField: "_id",
                        as: "toUser",
                    },
                },
                {
                    $lookup: {
                        from: "User",
                        localField: "from",
                        foreignField: "_id",
                        as: "fromUser",
                    },
                },
                { $unwind: "$toUser" },
                { $unwind: "$fromUser" },
                {
                    $addFields: {
                        to: "$toUser",
                        from: "$fromUser",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        from: 1,
                        to: { _id: 1, name: 1, pictureUri: 1, joiningDate: 1 },
                        from: {
                            _id: 1,
                            name: 1,
                            pictureUri: 1,
                            joiningDate: 1,
                        },
                        timestamp: 1,
                    },
                },
            ]);

            res(friendRequests);
        } catch (error) {
            rej(error);
        }
    });
}

function getReceived20FriendRequests(userId, skip) {
    return new Promise(async (res, rej) => {
        try {
            const friendRequests = await FriendRequest.aggregate([
                { $match: { to: new Types.ObjectId(userId) } },
                { $sort: { timestamp: -1 } },
                { $skip: skip },
                { $limit: 20 },
                {
                    $lookup: {
                        from: "User",
                        localField: "to",
                        foreignField: "_id",
                        as: "toUser",
                    },
                },
                {
                    $lookup: {
                        from: "User",
                        localField: "from",
                        foreignField: "_id",
                        as: "fromUser",
                    },
                },
                { $unwind: "$toUser" },
                { $unwind: "$fromUser" },
                {
                    $addFields: {
                        to: "$toUser",
                        from: "$fromUser",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        from: 1,
                        to: { _id: 1, name: 1, pictureUri: 1, joiningDate: 1 },
                        from: {
                            _id: 1,
                            name: 1,
                            pictureUri: 1,
                            joiningDate: 1,
                        },
                        timestamp: 1,
                    },
                },
            ]);

            res(friendRequests);
        } catch (error) {
            rej(error);
        }
    });
}

module.exports = router;
