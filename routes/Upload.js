const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/Token");
const { v2 } = require("cloudinary");

router.get("/", verifyToken, (req, res) => {
    const { userId } = req.query;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = v2.utils.api_sign_request(
        {
            timestamp: timestamp,
            folder: userId,
        },
        v2.config().api_secret
    );

    const uploadParams = {
        cloud_name: v2.config().cloud_name,
        api_key: v2.config().api_key,
        timestamp: timestamp,
        signature: signature,
        folder: userId,
    };

    res.json(uploadParams);
});

module.exports = router;
