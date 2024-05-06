const jwt = require("jsonwebtoken");

function getUserIdFromToken(token) {
    return jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return err;
        } else {
            return decoded.user;
        }
    });
}

module.exports = getUserIdFromToken;
