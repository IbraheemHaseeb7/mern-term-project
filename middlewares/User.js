const User = require("../models/User");

async function doesUserExist(req, res, next) {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "User id not provided" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = doesUserExist;
