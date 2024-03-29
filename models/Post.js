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
        description: String,
        likesCount: Number,
        commentsCount: Number,

        likes: [
            {
                userId: String,
                timestamp: {
                    type: Schema.Types.Date,
                    default: () => new Date(),
                },
            },
        ],
        comments: [
            {
                userId: String,
                description: String,
                timestamp: {
                    type: Schema.Types.Date,
                    default: () => new Date(),
                },
                likesCount: Number,
                likes: [
                    {
                        userId: String,
                        timestamp: {
                            type: Schema.Types.Date,
                            default: () => new Date(),
                        },
                    },
                ],
            },
        ],
        userId: String,
    },
    { collection: "Post" }
);

const Post = model("Post", postSchema);
module.exports = { Post };