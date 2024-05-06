const Like = require("../models/Like");

async function doesLikeExist(req, res, next) {
    const { likeId } = req.body;
    if (!likeId) {
        return res.status(400).json({ error: "Like id not provided" });
    }

    try {
        const like = await Like.findById(likeId);

        if (!like) {
            return res.status(404).json({ error: "Like not found" });
        }

        like.delete;

        req.like = like;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = doesLikeExist;
