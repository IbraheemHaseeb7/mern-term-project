const { Schema, model, Types } = require("mongoose");

const postSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId(),
        },
        timestamp: {
            type: Schema.Types.Date,
            default: () => new Date(),
        },
        description: Schema.Types.String,
        likesCount: Schema.Types.Number,
        commentsCount: Schema.Types.Number,
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
    },
    { collection: "Post" }
);

const Post = model("Post", postSchema);
module.exports = Post;
