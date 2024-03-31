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
        likes: [
            {
                userId: {
                    type: Schema.Types.String,
                    ref: "User",
                },
                _id: false,
                timestamp: {
                    type: Schema.Types.Date,
                    default: () => new Date(),
                },
            },
        ],
        comments: [
            {
                userId: {
                    type: Schema.Types.String,
                    ref: "User",
                },
                description: Schema.Types.String,
                timestamp: {
                    type: Schema.Types.Date,
                    default: () => new Date(),
                },
                likesCount: Schema.Types.Number,
                likes: [
                    {
                        userId: {
                            type: Schema.Types.String,
                            ref: "User",
                        },
                        timestamp: {
                            type: Schema.Types.Date,
                            default: () => new Date(),
                        },
                    },
                ],
            },
        ],
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
    },
    { collection: "Post" }
);

const Post = model("Post", postSchema);
module.exports = { Post };
