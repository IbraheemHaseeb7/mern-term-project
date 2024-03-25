const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING, {
            family: 4,
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error(err);
    }
}

module.exports = { connectDB };
