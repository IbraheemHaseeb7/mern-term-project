let mainio = null;
function socketHandler(io) {
    mainio = io;
    io.on("connection", (socket) => {
        const roomId = socket.handshake.query.roomId;

        socket.on("disconnect", () => {
            // for (let [key, value] of users) {
            //     if (value === socket.id) {
            //         users.delete(key);
            //         break;
            //     }
            // }
        });

        socket.on(roomId, (message) => {
            socket.broadcast.emit(roomId, message);
        });
    });
}

function sendMessage(userId, message) {
    const socketId = users.get(userId);
    if (socketId) {
        mainio.to(socketId).emit("message", message);
    }
}

module.exports = socketHandler;
module.exports.sendMessage = sendMessage;
