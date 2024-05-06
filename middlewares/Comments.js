const Comment = require("../models/Comment");

async function doesCommentExist(req, res, next) {
    const { commentId } = req.body;

    if (!commentId) {
        return res.status(400).json({ message: "Comment id not provided" });
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        req.comment = comment;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = doesCommentExist;
