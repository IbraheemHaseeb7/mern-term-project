const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

router.get("/", async (req, res) => {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    try {
        let chat = await Chat.findOne({
            users: { $all: [user1, user2] },
        }).populate("users", "name joiningDate _id pictureUri");

        if (!chat) {
            chat = await Chat.create({ users: [user1, user2] });
            return res.status(201).json(chat);
        }
        return res.status(201).json(chat);
    } catch (error) {
        return res.status(500).json({ error: error.toString() });
    }
});

router.post("/", async (req, res) => {
    const { roomId, userId, message } = req.body;

    if (!roomId || !userId || !message) {
        return res.status(400).json({ error: "Invalid parameters" });
    }

    try {
        const chat = await Chat.findById(roomId);

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        chat.messages.push({ userId, message });
        await chat.save();

        return res.status(201).json(chat);
    } catch (error) {
        return res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;
