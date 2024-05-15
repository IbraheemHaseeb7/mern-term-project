function handleOption(e) {
    e.preventDefault();

    const title = e.target.getAttribute("data-title");
    const userId = e.target.getAttribute("data-user-id");
    document.querySelector(".network-data-container h2").innerHTML = title;
    fetchData(title, userId);
}

function fetchData(title, userId) {
    title = title.toLowerCase();
    if (title === "friends") {
        fetch(`/api/friends?user=${userId}`, { method: "GET" })
            .then((res) => res.json())
            .then((res) => {
                const dataContainer = document.querySelector(
                    ".network-data-container .data-container"
                );

                let dataContent = "";
                res.forEach((data) => {
                    let friendDate;
                    if (data.user1._id === userId) {
                        friendDate = new Date(data.user2.joiningDate);
                    } else {
                        friendDate = new Date(data.user1.joiningDate);
                    }
                    const dataDate = new Date(data.timestamp);
                    const friendTimePassed = getTimeValue(friendDate);
                    const dataTimePassed = getTimeValue(dataDate);
                    dataContent += `
                            <div class="data-row">
                                <img class="profile-image" src="${
                                    data.user1._id === userId
                                        ? data.user2.pictureUri
                                        : data.user1.pictureUri
                                }" alt="profile" />
                                <h3 onclick="window.location.href='/profile/${
                                    data.user1._id === userId
                                        ? data.user2._id
                                        : data.user1._id
                                }'" class="user-name">${
                        data.user1._id === userId
                            ? data.user2.name
                            : data.user1.name
                    }</h3>
                                <span class="member-since"> Member Since: ${friendTimePassed}</span>
                                <p class="time-passed">${dataTimePassed}</p>
                                <button data-from-id="${
                                    data.user1._id === userId
                                        ? data.user2._id
                                        : data.user1._id
                                }" onclick="handleUnfriend(event)"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        `;
                });

                dataContainer.innerHTML = dataContent;
            })
            .catch((e) => {
                console.log(e);
                alert("Could not fetch records!");
            });
    } else {
        fetch(`/api/friendRequests/${title}`, { method: "GET" })
            .then((res) => res.json())
            .then((res) => {
                const dataContainer = document.querySelector(
                    ".network-data-container .data-container"
                );

                let dataContent = "";
                res.forEach((data) => {
                    const toDate = new Date(data.to.joiningDate);
                    const fromDate = new Date(data.from.joiningDate);
                    const dataDate = new Date(data.timestamp);
                    const toTimePassed = getTimeValue(toDate);
                    const fromTimePassed = getTimeValue(fromDate);
                    const dataTimePassed = getTimeValue(dataDate);

                    dataContent += `
                        <div class="data-row">
                            <img class="profile-image" src="${
                                title === "sent"
                                    ? data.to.pictureUri
                                    : data.from.pictureUri
                            }" alt="profile" />
                            <h3 onclick="window.location.href='/profile/${
                                title === "sent" ? data.to._id : data.from._id
                            }'" class="user-name">${
                        title === "sent" ? data.to.name : data.from.name
                    }</h3>
                            <span class="member-since"> Member Since: ${
                                title === "sent" ? toTimePassed : fromTimePassed
                            }</span>
                            <p class="time-passed">${dataTimePassed}</p>
                            ${
                                title === "sent"
                                    ? `<button data-from-id="${data.from._id}" data-to-id="${data.to._id}" onclick="handleCancelRequest(event)"><i class="fa-solid fa-xmark"></i></button>`
                                    : `<button data-from-id="${data.from._id}" data-to-id="${data.to._id}" onclick="handleAcceptRequest(event)"><i class="fa-solid fa-check"></i></button>`
                            }
                        </div>
                    `;
                });

                dataContainer.innerHTML = dataContent;
            })
            .catch((e) => alert("Could not fetch records!"));
    }
}

function handleCancelRequest(e) {
    e.preventDefault();

    const fromId = e.target.getAttribute("data-from-id");
    const toId = e.target.getAttribute("data-to-id");

    fetch("/api/friendRequests", {
        method: "DELETE",
        body: JSON.stringify({ from: fromId, to: toId }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => {
            if (res.status === 202) {
                e.target.parentElement.remove();
            } else {
                alert("Could not cancel request!");
            }
        })
        .catch((err) => {
            alert("Could not cancel request!");
        });
}

function handleAcceptRequest(e) {
    e.preventDefault();

    const fromId = e.target.getAttribute("data-from-id");
    const toId = e.target.getAttribute("data-to-id");

    fetch("/api/friends", {
        method: "POST",
        body: JSON.stringify({ user1: fromId, user2: toId }),
        headers: { "Content-Type": "application/json" },
    })
        .then((res) => {
            if (res.status === 201) {
                e.target.parentElement.remove();
            } else {
                alert("Could not accept request!");
            }
        })
        .catch((err) => {
            alert("Could not accept request!");
        });
}
