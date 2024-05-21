const { Schema, model, Types } = require("mongoose");

const userSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId(),
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        joiningDate: {
            type: Date,
            default: () => new Date(),
        },
        friendsCount: {
            type: Number,
            default: 0,
        },
        bio: {
            type: String,
            default: "",
        },
        pictureUri: {
            type: String,
            default: "/assets/general/default-profile-image.jpg",
        },
        coverUri: {
            type: String,
            default: "/assets/general/default-cover-image.jpg",
        },
    },
    { collection: "User" }
);

const User = model("User", userSchema);
module.exports = User;
