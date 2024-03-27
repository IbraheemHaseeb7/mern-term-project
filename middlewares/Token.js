const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const cookies = req.cookies;

    if (!cookies.token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(
            cookies.token,
            process.env.SECRET_KEY,
            (err, decoded) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        res.clearCookie("token");
                        return res.redirect("/login?message=tokenexpired", {
                            message: "Token expired",
                        });
                    }
                } else {
                    req.user = decoded;
                    next();
                }
            }
        );
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = verifyToken;
