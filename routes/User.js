const express = require("express");
const User = require("../models/User");
const router = express.Router();
const verifyToken = require("../middlewares/Token");

router.get("/", verifyToken, async (req, res) => {
    try {
        const id = req.query.id;
        if (id) {
            const user = await getUserById(id);
            res.status(200).json(user);
        } else {
            const users = await getUsers();
            res.status(200).json(users);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch("/:id", verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        await updateUser(id, req.body);
        res.status(200).json({ message: "Successfully updated one user" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/", verifyToken, async (req, res) => {
    try {
        if (!req.query.id)
            return res.status(400).json({ message: "Bad Request" });
        const id = req.query.id;
        await deleteUser(id);
        res.status(200).json({ message: "Successfully deleted one user" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

// Gets all users from the database
async function getUsers() {
    return await User.find();
}

// Gets a user by id from the database
async function getUserById(id) {
    return await User.findById(id);
}

// Update a user into the database
async function updateUser(id, user) {
    return await User.findByIdAndUpdate(id, user);
}

// Delete a user from the database
async function deleteUser(id) {
    return await User.findByIdAndDelete(id);
}
