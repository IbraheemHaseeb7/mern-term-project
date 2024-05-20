let socket = null;

function handleChat(e) {
    e.preventDefault();

    const user1 = e.target.getAttribute("data-user1-id");
    const user2 = e.target.getAttribute("data-user2-id");

    fetch(`/api/chats?user1=${user1}&user2=${user2}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    }).then((res) => {
        if (res.status === 201) {
            res.json().then((data) => {
                const chatUser = data.users.find((user) => user._id !== user1);
                insertChat(chatUser, data.messages, data._id, user1);
                const socketConnection = io(
                    `http://localhost:3000?roomId=${data._id}`
                );
                socket = socketConnection;
                insertMessageInDom(socketConnection, data._id, user1);
            });
        } else {
            res.json().then((data) => {
                alert(data.error);
            });
        }
    });
}

function insertChat(chatUser, messages, roomId, userId) {
    const joiningDate = new Date(chatUser.joiningDate);
    const timepassed = getTimeValue(joiningDate);
    const chatRoomContainer = document.querySelector(".chat-room-container");

    const chatContent = `
                <div class="chat-header">
                <img
                    src="${chatUser.pictureUri}"
                    alt="profile"
                />
                <h3>${chatUser.name}</h3>
                <p>Member since: ${timepassed}</p>
            </div>
            <div class="chat-box">
                ${messages
                    .map((msg) => {
                        return `<div class="msg ${
                            msg.userId === userId ? "home" : "away"
                        }">
                            <p>${msg.message}</p>
                        </div>`;
                    })
                    .join("")}
            </div>
            <form class="chat-form">
                <textarea data-user-id="${userId}" data-room-id="${roomId}" onkeyup="handleChatChange(event)" placeholder="Start typing from here..."></textarea>
                <button data-user-id="${userId}" data-room-id="${roomId}" onclick="handleSendMessage(event)">Send</button>
            </form>    
                `;

    chatRoomContainer.innerHTML = chatContent;
}

function handleSendMessage(e) {
    e.preventDefault();

    const roomId = e.target.getAttribute("data-room-id");
    const userId = e.target.getAttribute("data-user-id");

    const text = e.target.previousElementSibling.value;
    const chatBox = e.target.parentElement.previousElementSibling;
    const msg = document.createElement("div");
    msg.classList.add("msg");
    msg.classList.add("home");
    msg.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(msg);

    socket.emit(roomId, {
        message: e.target.previousElementSibling.value,
        userId: userId,
        timestamp: new Date(),
    });
    storeMessageInDB(e.target.previousElementSibling.value, roomId, userId);
    e.target.previousElementSibling.value = "";
}

function handleChatChange(e) {
    const roomId = e.target.getAttribute("data-room-id");
    const userId = e.target.getAttribute("data-user-id");

    if (e.keyCode === 13) {
        e.preventDefault();
        const text = e.target.value;
        const chatBox = e.target.parentElement.previousElementSibling;
        const msg = document.createElement("div");
        msg.classList.add("msg");
        msg.classList.add("home");
        msg.innerHTML = `<p>${text}</p>`;
        chatBox.appendChild(msg);

        socket.emit(roomId, {
            message: e.target.value,
            userId: userId,
            timestamp: new Date(),
        });
        storeMessageInDB(e.target.value, roomId, userId);
        e.target.value = "";
    }
}

function insertMessageInDom(socket, roomId, userId) {
    socket.on(roomId, (data) => {
        if (data.userId !== userId) {
            const chatBox = document.querySelector(".chat-box");
            const msg = document.createElement("div");
            msg.classList.add("msg");
            msg.classList.add("away");
            msg.innerHTML = `<p>${data.message}</p>`;
            chatBox.appendChild(msg);
        }
    });
}

function storeMessageInDB(message, roomId, userId) {
    fetch(`/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, roomId, userId }),
    })
        .then((res) => {
            if (res.status === 201) {
                res.json().then((data) => {
                    console.log("Message stored in DB");
                });
            } else {
                throw new Error("Could not store message in DB");
            }
        })
        .catch((error) => {
            alert("Could not store message in DB");
        });
}
