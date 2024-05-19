const { Schema, Types, model } = require("mongoose");

const chatSchema = new Schema({
    users: [
        {
            type: Types.ObjectId,
            ref: "User",
        },
    ],
    messages: [
        {
            userId: { type: Types.ObjectId, ref: "User" },
            message: String,
            timestampe: {
                type: Date,
                default: () => new Date(),
            },
        },
    ],
    timestampe: {
        type: Date,
        default: () => new Date(),
    },
});

const Chat = model("Chat", chatSchema);
module.exports = Chat;
