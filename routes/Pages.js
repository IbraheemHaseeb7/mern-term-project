const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
    axios
        .get("http://localhost:3000/api/posts")
        .then((response) => {
            res.render("index.ejs", { posts: response.data });
        })
        .catch((err) => {
            res.render("index.ejs", { posts: [] });
        });
});

router.get("/login", (req, res) => {
    res.render("auth.ejs", { title: "Login" });
});

router.get("/signup", (req, res) => {
    res.render("auth.ejs", { title: "Sign Up" });
});

module.exports = router;
