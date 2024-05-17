const postsContainer = document.querySelector(
    ".main-container .centeral-container .posts-container"
);

window.addEventListener(
    "scroll",
    () => {
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
            fetch(`/api/posts?limit=5&skip=${postsContainer.children.length}`, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((data) => {
                    data.forEach((post) => {
                        let postTimestamp = new Date(post.timestamp);
                        let timePassed = getTimeValue(postTimestamp);
                        let postId = post._id;

                        const wrapper = document.createElement("div");
                        wrapper.classList.add("wrapper");
                        wrapper.innerHTML = `
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
                                                    <p>${
                                                        post.likesCount
                                                    }</p></i> 
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
                                    </ul> `;

                        postsContainer.appendChild(wrapper);
                    });
                })
                .catch((e) => console.error(e));
        }
    },
    false
);
