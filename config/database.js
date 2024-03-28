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

async function closeConnectionToDB() {
    try {
        await mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

module.exports = { connectDB, closeConnectionToDB };
