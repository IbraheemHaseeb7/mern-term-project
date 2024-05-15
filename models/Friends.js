const { model, Types, Schema } = require("mongoose");

const FriendsSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
    },
    user1: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    user2: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    timestamp: {
        type: Date,
        default: () => new Date(),
    },
});

FriendsSchema.index({ user1: 1, user2: 1 }, { unique: true });
const Friends = model("Friends", FriendsSchema);
module.exports = Friends;
