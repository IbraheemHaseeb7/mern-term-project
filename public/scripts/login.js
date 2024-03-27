function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/api/token/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
        });
}
