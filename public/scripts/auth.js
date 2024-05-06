function handleLogin(e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

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
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
            window.location.href = "/";
        })
        .catch((err) => {
            document.getElementById("password").value = "";
        });
}

function handleSignup(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const name = document.getElementById("name").value;
    const age = parseInt(document.getElementById("age").value);

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (age < 0) {
        alert("Age cannot be negative");
        return;
    }

    fetch("/api/token/signup", {
        method: "POST",
        body: JSON.stringify({
            email: email,
            password: password,
            name: name,
            age: age,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
        });
}

function handleLogoClick(e) {
    e.preventDefault();

    window.location.href = "/";
}
