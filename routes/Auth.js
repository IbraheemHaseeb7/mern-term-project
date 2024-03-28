const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const jwt = require("jsonwebtoken");

router.post("/token/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ user: user.id }, process.env.SECRET_KEY);

        res.cookie("token", token, { httpOnly: true });
        return res.status(200).json({ message: "Successfully logged in" });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

router.post("/token/signup", async (req, res) => {
    try {
        const { email, password, age, name } = req.body;

        if (!email || !password || !age || !name) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        const user = await insertUser(email, password, age, name);
        const token = jwt.sign({ user: user.id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });

        res.cookie("token", token, { httpOnly: true });
        return res
            .status(201)
            .json({ message: "Successfully created new User" });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

module.exports = router;

function insertUser(
    email,
    password,
    age,
    name,
    bio = null,
    coverUri = null,
    pictureUri = null
) {
    return new Promise(async (resolve, reject) => {
        try {
            const foundUser = await User.findOne({ email });

            if (foundUser) {
                return reject({ message: "User already exists" });
            }

            const encryptedPassword = await encryptPassword(password);

            const user = new User({
                email,
                password: encryptedPassword,
                age,
                name,
                friendsCount: 0,
                friends: [],
                joiningDate: new Date(),
                bio,
                coverUri,
                pictureUri,
            });
            await user.save();
            return resolve("Successfully inserted user");
        } catch (e) {
            return reject(e);
        }
    });
}

async function encryptPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return await bcrypt.hash(password, salt);
}
