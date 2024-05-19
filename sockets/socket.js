const users = new Map();

function socketHandler(io) {
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        users.set(userId, socket.id);

        socket.on("disconnect", () => {
            for (let [key, value] of users) {
                if (value === socket.id) {
                    users.delete(key);
                    break;
                }
            }
        });
    });
}

function sendNotification(userId, notification, io) {
    const socketId = users.get(userId);
    if (socketId) {
        io.to(socketId).emit("notification", notification);
    }
}

module.exports = socketHandler;
