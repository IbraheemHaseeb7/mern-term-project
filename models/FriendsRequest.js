const { Schema, Types, model } = require("mongoose");

const friendRequestSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    timestamp: {
        type: Schema.Types.Date,
        default: () => new Date(),
    },
});

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
const FriendRequest = model("FriendRequest", friendRequestSchema);
module.exports = FriendRequest;
