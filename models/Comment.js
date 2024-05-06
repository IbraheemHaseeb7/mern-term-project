const { model, Schema, Types } = require("mongoose");

const commentSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Schema.Types.Date,
    },
    description: { type: Schema.Types.String },
});

const Comment = model("Comment", commentSchema);
module.exports = Comment;
