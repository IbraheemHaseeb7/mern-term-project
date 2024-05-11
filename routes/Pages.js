const express = require("express");
const router = express.Router();
const authForPages = require("../middlewares/AuthForPages");
const { get20Posts, get20PostsById } = require("./Post");
const getUserIdFromToken = require("../utils/GetUserIdFromToken");

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

    if (userId === "1") {
        return res.render("error.ejs", { message: "User not found" });
    }

    try {
        const posts = await get20PostsById(userId);

        res.render("profile.ejs", {
            title: "Welcome Back",
            userId: userId,
            posts: posts,
        });
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
});

module.exports = router;
