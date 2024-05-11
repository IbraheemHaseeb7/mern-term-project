const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const ejsLayouts = require("express-ejs-layouts");
const session = require("express-session");
const app = express();
const PORT = 3000;

// Creating Routes
const userRoutes = require("./routes/User");
const authRoutes = require("./routes/Auth");
const postRoutes = require("./routes/Post");
const pageRoutes = require("./routes/Pages");
const likeRoutes = require("./routes/Like");
const commentRoutes = require("./routes/Comment");
const passValuesToViews = require("./middlewares/passValuesToViews");

// Setting middlewares and view engine
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(ejsLayouts);
app.use(express.json());
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: false,
        // cookie: { secure: true },
    })
);
app.use(passValuesToViews);

// Using Routes
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/", pageRoutes);

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
