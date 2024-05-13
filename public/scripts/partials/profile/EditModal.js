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
    "Miss kitty",
    "Boots",
    "Scooter",
    "Rocky",
    "Bear",
    "Peanut",
    "Sadie",
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
                            <button onclick="" type="button">
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

function handleChangeCover(e) {
    e.preventDefault();

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.click();

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];

        const fileReader = new FileReader();

        fileReader.onload = function (e) {
            const fileData = e.target.result;
            const blob = new Blob([fileData], { type: file.type });

            console.log(blob);
        };

        fileReader.readAsArrayBuffer(file);
    });
}

function closeModal() {
    const profileEditContainer = document.querySelector(
        ".profile-edit-container"
    );
    profileEditContainer.removeAttribute("style");
    profileEditContainer.innerHTML = "";
}
