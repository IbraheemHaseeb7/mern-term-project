const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    const { name, email, message } = req.body;
    console.log(name, email, message);

    res.status(200).json({
        message: "Contact Us API",
        data: { name, email, message },
    });
});

module.exports = router;
