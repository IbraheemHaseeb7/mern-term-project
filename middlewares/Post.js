const Post = require("../models/Post");

async function doesPostExists(req, res, next) {
    const { postId } = req.body;

    if (!postId) {
        return res.status(400).json({ message: "Post id not provided" });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        req.post = post;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = doesPostExists;
