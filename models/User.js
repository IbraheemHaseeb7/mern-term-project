const { Schema, model, Types } = require("mongoose");

const userSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId(),
        },
        name: String,
        email: String,
        password: String,
        joiningDate: Date,
        friendsCount: Number,
        bio: String,
        pictureUri: String,
        coverUri: String,
    },
    { collection: "User" }
);

const User = model("User", userSchema);
module.exports = User;
