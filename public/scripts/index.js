const description = document.getElementById("post-description");

function handleFormSubmit(e) {
    e.preventDefault();

    if (!description.value) {
        return alert("Type something to create a post");
    }

    fetch("http://localhost:3000/api/posts", {
        method: "POST",
        body: JSON.stringify({ description: description.value }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            description.value = "";
            alert("Successfully made a new post");
        })
        .catch((error) => {
            alert(error.message);
        });
}

// like button
const likeBtn = document.getElementById("like-btn");

function handleLike(e) {
    e.preventDefault();

    const postId = likeBtn.getAttribute("data-post-id");

    fetch("http://localhost:3000/api/likes", {
        method: "POST",
        body: JSON.stringify({ postId }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
}
