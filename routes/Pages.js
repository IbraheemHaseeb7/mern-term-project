const express = require("express");
const router = express.Router();
const authForPages = require("../middlewares/AuthForPages");
const { get20Posts, get20PostsById } = require("./Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");
const User = require("../models/User");

router.get("/", authForPages, async (req, res) => {
    try {
        const cookies = req.cookies;
        const userId = getUserIdFromToken(cookies.token);
        const posts = await get20Posts(userId);
        res.render("index.ejs", { title: "Home", posts: posts, error: null });
    } catch (error) {
        res.render("index.ejs", {
            title: "Home",
            posts: [],
            error: error.message,
        });
    }
});

router.get("/login", (req, res) => {
    res.render("auth.ejs", { title: "Login" });
});

router.get("/signup", (req, res) => {
    res.render("auth.ejs", { title: "Sign Up" });
});

router.get("/profile/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        if (userId === req.session.user?._id) {
            const posts = await get20PostsById(userId);

            res.render("profile.ejs", {
                title: "Welcome Back",
                currentUser: req.session.user,
                posts: posts,
            });
        } else {
            const user = await User.findById(userId);
            const posts = await get20PostsById(userId, req.session.user?._id);

            res.render("profile.ejs", {
                title: user.name,
                currentUser: user,
                posts: posts,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

module.exports = router;
