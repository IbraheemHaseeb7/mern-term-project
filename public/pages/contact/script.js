$(document).ready(function () {
    // Select the form element
    var form = $(".contact-us-form");

    // Add submit event listener to the form
    form.submit(function (event) {
        // Prevent the form from submitting
        event.preventDefault();

        // Get the input values
        var name = $("#name").val();
        var email = $("#email").val();
        var message = $("#message").val();

        // Validate the input values
        if (name === "") {
            alert("Please enter your name");
            return;
        }

        if (email === "") {
            alert("Please enter your email");
            return;
        }

        if (message === "") {
            alert("Please enter your message");
            return;
        }

        $.ajax("/contactus", {
            method: "POST",
            data: JSON.stringify({ name, email, message }),
            headers: { "Content-Type": "application/json" },
        })
            .done(function (response) {
                alert("Your message has been sent successfully");
                $("#name").val("");
                $("#email").val("");
                $("#message").val("");
                console.log(response);
            })
            .fail(function (error) {
                alert("Something went wrong, please try again later");
                console.log(error);
            });
    });
});
