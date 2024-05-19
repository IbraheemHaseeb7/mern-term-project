function handleLogout(e) {
    e.preventDefault();

    fetch("/api/token/logout", { method: "POST" })
        .then((response) => {
            if (response.redirected) {
                window.location.href = response.url;
            }
        })
        .catch((error) => alert("Could not logout"));
}

function handleProfile(e) {
    e.preventDefault();

    const userId = e.target.getAttribute("data-user-id");
    window.location.href = "/profile/" + userId;
}

function handleHome(e) {
    e.preventDefault();
    window.location.href = "/";
}

function handleNetwork(e) {
    e.preventDefault();
    window.location.href = "/network";
}

function handleChat(e) {
    e.preventDefault();
    window.location.href = "/chats";
}
