const { v2 } = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();

function connectToCloud() {
    v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
    });
    console.log("Connected to Cloudinary");
}

module.exports = connectToCloud;
