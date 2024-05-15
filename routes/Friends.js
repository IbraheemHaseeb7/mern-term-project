const express = require("express");
const Friends = require("../models/Friends");
const FriendRequest = require("../models/FriendsRequest");
const router = express.Router();
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
    const { user1, user2 } = req.body;

    if (!user1 || !user2) {
        return res.status(400).json({ message: "Invalid request!" });
    }

    const transaction = await mongoose.startSession();
    transaction.startTransaction();

    const newFriend = new Friends({
        user1,
        user2,
    });

    try {
        await newFriend.save();
        await FriendRequest.deleteOne({
            $or: [
                { from: user1, to: user2 },
                { from: user2, to: user1 },
            ],
        });

        await transaction.commitTransaction();
        transaction.endSession();
        res.status(201).json({ message: "Friend added!" });
    } catch (e) {
        transaction.abortTransaction();
        res.status(500).json({ message: "Could not add friend!" });
    }
});

router.delete("/", async (req, res) => {
    const { user1, user2 } = req.body;

    if (!user1 || !user2) {
        return res.status(400).json({ message: "Invalid request!" });
    }

    try {
        await Friends.deleteOne({ user1, user2 });
        res.status(202).json({ message: "Friend removed!" });
    } catch (e) {
        res.status(500).json({ message: "Could not remove friend!" });
    }
});

router.get("/", async (req, res) => {
    const { user } = req.query;

    try {
        const friends = await Friends.find({
            $or: [{ user1: user }, { user2: user }],
        }).populate("user1 user2", "name _id pictureUri joiningDate");
        res.status(200).json(friends);
    } catch (e) {
        res.status(500).json({ message: "Could not fetch friends!" });
    }
});

module.exports = router;
