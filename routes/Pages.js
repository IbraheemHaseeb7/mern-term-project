const express = require("express");
const router = express.Router();
const authForPages = require("../middlewares/AuthForPages");
const { get20Posts } = require("./Post");

router.get("/", authForPages, async (req, res) => {
    try {
        const posts = await get20Posts();
        res.render("index.ejs", { posts: posts, error: null });
    } catch (error) {
        res.render("index.ejs", { posts: [], error: error.message });
    }
});

router.get("/login", (req, res) => {
    res.render("auth.ejs", { title: "Login" });
});

router.get("/signup", (req, res) => {
    res.render("auth.ejs", { title: "Sign Up" });
});

module.exports = router;
