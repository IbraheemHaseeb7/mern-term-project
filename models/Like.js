const { model, Schema, Types } = require("mongoose");

const likeSchema = new Schema({
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
        unique: true,
    },
    createdAt: {
        type: Schema.Types.Date,
    },
});

likeSchema.index({ userId: 1 }, { unique: true });
const Like = model("Like", likeSchema);
module.exports = Like;
