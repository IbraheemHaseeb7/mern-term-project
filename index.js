const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const PORT = 3000;

// Creating Routes
const userRoutes = require("./routes/User");
const authRoutes = require("./routes/Auth");

// Setting middlewares and view engine
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());

// Using Routes
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
