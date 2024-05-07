const description = document.getElementById("post-description");

async function handleFormSubmit(e) {
    e.preventDefault();

    let value = description.value;

    if (!value) {
        return alert("Type something to create a post");
    }

    await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        body: JSON.stringify({ description: value }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            value = "";
            console.log(res);
        })
        .catch((error) => {
            alert(error.message);
        });
}
