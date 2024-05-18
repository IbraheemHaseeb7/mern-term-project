const options = [
    "Jasper",
    "Milo",
    "Lucy",
    "Bella",
    "Smokey",
    "Baby",
    "Bandit",
    "Sheba",
    "Chester",
    "Luna",
    "Samantha",
    "Shadow",
    "Cuddles",
    "Boots",
    "Scooter",
    "Rocky",
    "Bear",
    "Peanut",
    "Sadie",
    "Leo",
];

function handleEditClick(e) {
    e.preventDefault();

    const userId = e.target.getAttribute("data-user-id");

    openModal(userId);
}

async function openModal(userId) {
    const profileEditContainer = document.querySelector(
        ".profile-edit-container"
    );
    let optionsContent = "";
    options.forEach((option) => {
        optionsContent += `<img
        onclick="handleSelectOption(event)"
        class="picture-option"
        src="https://api.dicebear.com/8.x/adventurer/svg?seed=${option}"
        alt="${option}" />`;
    });

    await fetch(`http://localhost:3000/api/users?id=${userId}`, {
        method: "GET",
    })
        .then((res) => res.json())
        .then(async (user) => {
            let modalContent = `
                    <div class="edit-container">
                        <div class="picture-edit">
                            <div class="cover-display">
                                <img onclick="handleChangeCover(event)" src="${user.coverUri}" alt="cover" />
                            </div>
                            <div class="picture-display">
                                <img src="${user.pictureUri}" alt="profile-image" />
                            </div>
                            ${optionsContent}
                        </div>
                        <form class="edit-form">
                            <div>
                                <label for="edit-name">Name</label>
                                <input type="text" name="name" id="edit-name" value="${user.name}" />
                            </div>
                            <div>
                                <label for="edit-email">Email</label>
                                <input type="text" name="email" id="edit-email" value="${user.email}" />
                            </div>
                            <div>
                                <label for="edit-bio">Bio</label>
                                <textarea type="text" name="bio" id="edit-bio">${user.bio}</textarea>
                            </div>
                            <button data-user-id="${user._id}" data-cover="${user.coverUri}" onclick="handleSubmitEditForm(event)" type="button">
                                Save Changes
                            </button>
                        </form>
                    </div>
                    <div class="shadow" onclick="closeModal(event)"></div>
            `;
            profileEditContainer.innerHTML = modalContent;
            profileEditContainer.setAttribute("style", "pointer-events: all;");
        })
        .catch((error) => {});
}

function handleSelectOption(e) {
    e.preventDefault();

    const imgLink = e.target.getAttribute("src");
    const pictureDisplay = document.querySelector(
        ".edit-container .picture-edit .picture-display img"
    );
    pictureDisplay.setAttribute("src", imgLink);
}

let selectedCoverFile;
function handleChangeCover(e) {
    e.preventDefault();

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.click();

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        selectedCoverFile = file;
        const url = URL.createObjectURL(file);

        const coverImageDisplay = document.querySelector(
            ".edit-container .picture-edit .cover-display img"
        );
        coverImageDisplay.setAttribute("src", url);
    });
}

function closeModal() {
    const profileEditContainer = document.querySelector(
        ".profile-edit-container"
    );
    profileEditContainer.removeAttribute("style");
    profileEditContainer.innerHTML = "";
}

async function handleSubmitEditForm(e) {
    e.preventDefault();

    const pictureUri = document
        .querySelector(".edit-container .picture-edit .picture-display img")
        .getAttribute("src");
    const coverUri = document
        .querySelector(".edit-container .picture-edit .cover-display img")
        .getAttribute("src");
    const name = document.getElementById("edit-name").value;
    const email = document.getElementById("edit-email").value;
    const bio = document.getElementById("edit-bio").value;
    const originalCoverUri = e.target.getAttribute("data-cover");
    const userId = e.target.getAttribute("data-user-id");

    const data = { pictureUri, coverUri, name, email, bio };

    if (coverUri !== originalCoverUri) {
        await fetch(`http://localhost:3000/api/upload?userId=${userId}`)
            .then((res) => res.json())
            .then(async (uploadParams) => {
                const formData = new FormData();
                formData.append("file", selectedCoverFile);
                formData.append("api_key", uploadParams.api_key);
                formData.append("timestamp", uploadParams.timestamp);
                formData.append("signature", uploadParams.signature);
                formData.append("folder", uploadParams.folder);

                await fetch(
                    `https://api.cloudinary.com/v1_1/${uploadParams.cloud_name}/upload`,
                    { method: "POST", body: formData }
                )
                    .then((res) => res.json())
                    .then((res) => {
                        data.coverUri = res.url;
                    })
                    .catch((err) => alert("Could not upload cover picture..."));
            })
            .catch((err) => alert("Could not upload cover picture..."));
    }

    await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => closeModal())
        .catch((err) => alert("Could not update user data..."));
}

function handleFriendRequest(e) {
    e.preventDefault();

    fetch("http://localhost:3000/api/friendRequests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            to: e.target.getAttribute("data-to-user-id"),
            from: e.target.getAttribute("data-from-user-id"),
        }),
    })
        .then((res) => {
            if (res.status === 201) {
                alert("Friend Request Sent!");

                const parent = e.target.parentElement;
                parent.removeChild(e.target);

                const button = document.createElement("button");
                button.title = "Cancel Friend Request";
                button.onclick = handleCancelFriendRequest;
                button.setAttribute(
                    "data-to-user-id",
                    e.target.getAttribute("data-to-user-id")
                );
                button.setAttribute(
                    "data-from-user-id",
                    e.target.getAttribute("data-from-user-id")
                );

                button.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
                parent.appendChild(button);
            } else {
                throw new Error("Could not send friend request...");
            }
        })
        .catch((err) => alert(err.message));
}

function handleCancelFriendRequest(e) {
    e.preventDefault();

    fetch("http://localhost:3000/api/friendRequests", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            to: e.target.getAttribute("data-to-user-id"),
            from: e.target.getAttribute("data-from-user-id"),
        }),
    })
        .then((res) => {
            if (res.status === 202) {
                alert("Friend Request Cancelled!");

                const parent = e.target.parentElement;
                parent.removeChild(e.target);

                const button = document.createElement("button");
                button.title = "Send Friend Requet";
                button.onclick = handleFriendRequest;
                button.setAttribute(
                    "data-to-user-id",
                    e.target.getAttribute("data-to-user-id")
                );
                button.setAttribute(
                    "data-from-user-id",
                    e.target.getAttribute("data-from-user-id")
                );

                button.innerHTML = `<i class="fa-solid fa-plus"></i>`;
                parent.appendChild(button);
            } else {
                throw new Error("Could not Cancel friend request...");
            }
        })
        .catch((err) => alert(err.message));
}

function handleRejectFriendRequest(e) {
    e.preventDefault();

    fetch("http://localhost:3000/api/friendRequests", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            to: e.target.getAttribute("data-from-user-id"),
            from: e.target.getAttribute("data-to-user-id"),
        }),
    })
        .then((res) => {
            if (res.status === 202) {
                alert("Friend Request Rejected!");

                const parent = e.target.parentElement;
                const children = parent.children;
                const lastChild = children[children.length - 1];
                const secondLastChild = children[children.length - 2];

                parent.removeChild(lastChild);
                parent.removeChild(secondLastChild);

                const button = document.createElement("button");
                button.title = "Send Friend Requet";
                button.setAttribute(
                    "data-to-user-id",
                    e.target.getAttribute("data-to-user-id")
                );
                button.setAttribute(
                    "data-from-user-id",
                    e.target.getAttribute("data-from-user-id")
                );
                button.onclick = handleFriendRequest;

                button.innerHTML = `<i class="fa-solid fa-plus"></i>`;
                parent.appendChild(button);
            } else {
                throw new Error("Could not reject friend request...");
            }
        })
        .catch((err) => alert(err.message));
}

function handleRemoveFriend(e) {
    e.preventDefault();

    fetch("http://localhost:3000/api/friends", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user1: e.target.getAttribute("data-to-user-id"),
            user2: e.target.getAttribute("data-from-user-id"),
        }),
    })
        .then((res) => {
            if (res.status === 202) {
                alert("Friend Removed!");

                const parent = e.target.parentElement;
                parent.removeChild(e.target);

                const button = document.createElement("button");
                button.title = "Send Friend Requet";
                button.setAttribute(
                    "data-to-user-id",
                    e.target.getAttribute("data-to-user-id")
                );
                button.setAttribute(
                    "data-from-user-id",
                    e.target.getAttribute("data-from-user-id")
                );
                button.onclick = handleFriendRequest;

                button.innerHTML = `<i class="fa-solid fa-plus"></i>`;
                parent.appendChild(button);
            } else {
                throw new Error("Could not remove friend...");
            }
        })
        .catch((err) => alert(err.message));
}

function handleAcceptFriendRequest(e) {
    e.preventDefault();

    fetch("http://localhost:3000/api/friends", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user1: e.target.getAttribute("data-to-user-id"),
            user2: e.target.getAttribute("data-from-user-id"),
        }),
    })
        .then((res) => {
            if (res.status === 201) {
                alert("Friend Added!");

                const parent = e.target.parentElement;
                const children = parent.children;
                const lastChild = children[children.length - 1];
                const secondLastChild = children[children.length - 2];

                parent.removeChild(lastChild);
                parent.removeChild(secondLastChild);

                const button = document.createElement("button");
                button.title = "Remove Friend";
                button.setAttribute(
                    "data-to-user-id",
                    e.target.getAttribute("data-to-user-id")
                );
                button.setAttribute(
                    "data-from-user-id",
                    e.target.getAttribute("data-from-user-id")
                );
                button.onclick = handleRemoveFriend;

                button.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
                parent.appendChild(button);
            } else {
                throw new Error("Could not add friend...");
            }
        })
        .catch((err) => alert(err.message));
}
