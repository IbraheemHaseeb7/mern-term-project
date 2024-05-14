function handleFormSubmit(e) {
    e.preventDefault();
    const description = document.getElementById("post-description");

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
            const userName = document.querySelector(
                ".left-bar-container .profile-container p"
            ).innerHTML;
            const profileImage = document
                .querySelector(".left-bar-container .profile-container img")
                .getAttribute("src");
            const postsContainer = document.querySelector(".posts-container");
            const wrapper = document.createElement("div");
            wrapper.classList.add("wrapper");

            let postContent = `
                    <ul class="cards__list">
                        <li class="card">
                            <div class="card__header">
                                <img class="card__profile-img" src="${profileImage}" alt="c3po"/>
                                <div class="card__meta">
                                <div class="card__meta__displayname">
                                    ${userName}
                                </div>
                                <div class="card__meta__username">
                                </div>
                                <div class="card__meta__timestamp">
                                    2 seconds
                                </div>
                                </div>
                                <div class="card__menu">
                                    <i class="fas fa-ellipsis-h"></i>
                                </div>
                            </div>
                            <div class="card__body">
                                ${description.value}
                            </div>
                            <div class="card__footer">
                            <span class="card__footer__like">
                                <i onclick="handleLike(event)" data-post-id="${res._id}" data-has-liked="false" class="fa-regular fa-heart like-btn">
                                <p>0</p></i> 
                            </span>
                            <span class="card__footer__comment">
                                <i onclick="handleComment(event)" data-post-id="${res._id}" class="far fa-comment comment-btn"><p>0</p></i>
                            </span>
                            <span class="card__footer__share">
                                <i class="fas fa-share-alt"></i>
                            </div>
                        </li>
                    </ul>
            `;

            wrapper.innerHTML = postContent;
            postsContainer.insertBefore(wrapper, postsContainer.firstChild);
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
            e.target.setAttribute("data-has-liked", "false");
        } else {
            likePost(postId, e);
            e.target.setAttribute("data-has-liked", "true");
        }
    } catch (error) {
        alert(error);
    }
}

// handle comment button click on post
function handleComment(e) {
    e.preventDefault();

    const postId = e.target.getAttribute("data-post-id");
    openPostModal(postId);
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
                e.target.classList.add("red-like");
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
                e.target.classList.remove("red-like");
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
    const commentsNumbersElements = document.querySelectorAll(
        `.card__footer__comment [data-post-id="${postId}"] p`
    );
    const profileImage = document
        .querySelector(".left-bar-container .profile-container img")
        .getAttribute("src");

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
                const commentsContainer = document.querySelector(
                    ".comments-container"
                );
                const wrapper = document.createElement("div");
                wrapper.classList.add("wrapper");

                wrapper.innerHTML = `
                            <ul class="cards__list">
                                <li class="card">
                                    <div class="card__header">
                                        <img class="card__profile-img comment-img" src="${profileImage}" alt="c3po"/>
                                        <div class="card__meta">
                                            <div class="card__meta__displayname">
                                                John
                                            </div>
                                            <div class="card__meta__username">
                                                <!-- <%= name %> -->
                                            </div>
                                            <div class="card__meta__timestamp">
                                                2 seconds
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card__body comment-description">
                                        ${commentDescription.value}
                                    </div>
                                </li>
                            </ul>
                        `;
                commentDescription.value = "";

                for (let i = 0; i < commentsNumbersElements.length; i++) {
                    commentsNumbersElements[i].innerHTML =
                        +commentsNumbersElements[i].innerHTML + 1;
                }

                commentsContainer.insertBefore(
                    wrapper,
                    commentsContainer.firstChild
                );
            }
        })
        .catch((error) => {
            alert("Could not post comment! Try again later");
        });
}

async function openPostModal(postId) {
    const modalContainer = document.querySelector(".modal-container");
    await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "GET",
    })
        .then((res) => res.json())
        .then(async (res) => {
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
                                <img class="card__profile-img" src="${
                                    post.user.pictureUri
                                }"/>
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
                        <button type="submit" data-post-id="${postId}" onclick="handleCommentSubmit(event)">
                            Comment
                        </button>
                    </form>
                    <div class="comments-container">
                        
                    </div>
                </div>
                <div class="shadow" onclick="closePostModal(event)"></div>
            `;

            modalContainer.innerHTML = modalContent;
            modalContainer.setAttribute("style", "pointer-events: all;");

            fetch(`http://localhost:3000/api/comments?postId=${postId}`, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    const commentsContainer = document.querySelector(
                        ".comments-container"
                    );

                    res.forEach((comment) => {
                        const wrapper = document.createElement("div");
                        wrapper.classList.add("wrapper");

                        const now = new Date();
                        const date = new Date(comment.createdAt);

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

                        wrapper.innerHTML = `
                            <ul class="cards__list">
                                <li class="card">
                                    <div class="card__header">
                                        <img class="card__profile-img comment-img" src="${comment.user.pictureUri}" alt="c3po"/>
                                        <div class="card__meta">
                                            <div class="card__meta__displayname">
                                                ${comment.user.name}
                                            </div>
                                            <div class="card__meta__username">
                                                <!-- <%= name %> -->
                                            </div>
                                            <div class="card__meta__timestamp">
                                                ${timePassed}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card__body comment-description">
                                        ${comment.description}
                                    </div>
                                </li>
                            </ul>
                        `;

                        commentsContainer.appendChild(wrapper);
                    });
                })
                .catch((error) => {
                    alert("Could not fetch comments");
                });
        })
        .catch((error) => {});
}

function closePostModal() {
    const modalContainer = document.querySelector(".modal-container");
    modalContainer.removeAttribute("style");
    modalContainer.innerHTML = "";
}
