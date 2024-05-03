const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index.ejs");
});

router.get("/login", (req, res) => {
    res.render("auth.ejs", { title: "Login" });
});

router.get("/signup", (req, res) => {
    res.render("auth.ejs", { title: "Sign Up" });
});

module.exports = router;
