const jwt = require("jsonwebtoken");

function authForPages(req, res, next) {
    const cookies = req.cookies;

    if (!cookies.token) {
        return res.redirect("/login");
    }

    try {
        jwt.verify(cookies.token, process.env.SECRET_KEY, (err, decoded) => {
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
        });
    } catch (error) {
        return res.redirect("/login");
    }
}

module.exports = authForPages;
