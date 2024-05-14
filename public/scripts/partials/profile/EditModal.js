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
