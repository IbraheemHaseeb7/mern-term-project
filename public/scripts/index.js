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
function handleLike(e) {
    e.preventDefault();

    const postId = e.target.getAttribute("data-post-id");
    const hasLiked = e.target.getAttribute("data-has-liked") === "true";

    try {
        if (hasLiked) {
            disLikePost(postId, e);
        } else {
            likePost(postId, e);
        }
    } catch (error) {
        alert(error);
    }
}

// handle comment button click on post
function handleComment(e) {
    e.preventDefault();

    const postId = e.target.getAttribute("data-post-id");
    openModal(postId);
}

function likePost(postId, e) {
    let likesCount = +e.target.children[0].innerHTML;

    fetch("http://localhost:3000/api/likes", {
        method: "POST",
        body: JSON.stringify({ postId }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => {
            if (res.status === 201) {
                e.target.classList.add("fa-solid");
                e.target.classList.remove("fa-regular");
                e.target.children[0].innerHTML = likesCount + 1;
            } else {
                alert("Could not like post");
            }
        })
        .catch((error) => alert("Error occurred"));
}

function disLikePost(postId, e) {
    let likesCount = +e.target.children[0].innerHTML;

    fetch("http://localhost:3000/api/likes", {
        method: "DELETE",
        body: JSON.stringify({ postId }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => {
            if (res.status === 200) {
                e.target.classList.add("fa-regular");
                e.target.classList.remove("fa-solid");
                e.target.children[0].innerHTML = likesCount - 1;
            } else {
                alert("Could not dislike post");
            }
        })
        .catch((error) => alert("Error occurred"));
}

function handleCommentSubmit(e) {
    e.preventDefault();

    const commentDescription = document.getElementById(
        "modal-comment-description"
    );
    const postId = e.target.getAttribute("data-post-id");

    fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            postId: postId,
            description: commentDescription.value,
        }),
    })
        .then((res) => {
            if (res.status === 201) {
                commentDescription.value = "";
            }
        })
        .catch((error) => {
            alert("Could not post comment! Try again later");
        });
}

const modalContainer = document.querySelector(".modal-container");

async function openModal(postId) {
    await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "GET",
    })
        .then((res) => res.json())
        .then((res) => {
            const post = res[0];
            const now = new Date();
            const date = new Date(post.timestamp);

            const diffInSeconds = Math.floor((now - date) / 1000);
            let timePassed;
            if (diffInSeconds < 60) {
                timePassed = `${diffInSeconds} seconds`;
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                timePassed = `${minutes} minutes`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                timePassed = `${hours} hours`;
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                timePassed = `${days}
                    days`;
            }

            let modalContent = `
                <div class="modal-centeral-container">
                    <div class="modal-post-container">
                        <div class="wrapper">
                            <ul class="cards__list">
                            <li class="card">
                                <div class="card__header">
                                <img class="card__profile-img" src="https://www.syfy.com/sites/syfy/files/styles/1200x680/public/syfywire_cover_media/2018/09/c-3po-see-threepio_68fe125c.jpg" alt="c3po"/>
                                <div class="card__meta">
                                    <div class="card__meta__displayname">
                                        ${post.user.name}
                                    </div>
                                    <div class="card__meta__username">
                                        <!-- <%= name %> -->
                                    </div>
                                    <div class="card__meta__timestamp">
                                        ${timePassed}
                                    </div>
                                </div>
                                <div class="card__menu">
                                    <i class="fas fa-ellipsis-h"></i>
                                </div>
                            </div>
                                <div class="card__body">
                                        ${post.description}
                                    </div>
                                    <div class="card__footer">
                                    <span class="card__footer__like">
                                        <i onclick="handleLike(event)" data-post-id="${postId}" data-has-liked="${postId}" class="${
                post.hasLiked ? `fa-solid red-like` : `fa-regular`
            } fa-heart like-btn">
                                        <p>${post.likesCount}</p></i> 
                                    </span>
                                    <span class="card__footer__comment">
                                        <i onclick="handleComment(event)" data-post-id="${postId}" class="far fa-comment comment-btn"><p>${
                post.commentsCount
            }</p></i>
                                    </span>
                                    <span class="card__footer__share">
                                        <i class="fas fa-share-alt"></i>
                                </div>
                                </li>
                            </ul>      
                        </div>
                    </div>
                    <form class="modal-comment-form">
                        <textarea id="modal-comment-description" placeholder="Starting typing from here..."></textarea>
                        <button type="submit" data-post-id=${postId} onclick="handleCommentSubmit(event)">
                            Comment
                        </button>
                    </form>
                    <div class="comments-container"></div>
                </div>
                <div class="shadow" onclick="closeModal(event)"></div>
            `;

            modalContainer.innerHTML = modalContent;
            modalContainer.setAttribute("style", "pointer-events: all;");
        })
        .catch((error) => {});
}

function closeModal() {
    modalContainer.removeAttribute("style");
    modalContainer.innerHTML = "";
}
