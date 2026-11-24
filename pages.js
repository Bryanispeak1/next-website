document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

    const setFieldError = (elementId, isInvalid) => {
        const group = document.getElementById(elementId);
        if (group) {
            isInvalid ? group.classList.add("invalid") : group.classList.remove("invalid");
        }
    };

    // --- Sign Up Request ---
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const fullname = document.getElementById("fullname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const agreeCheckbox = document.getElementById("agree").checked;

            let hasError = false;

            if (!fullname) { setFieldError("nameGroup", true); hasError = true; } else { setFieldError("nameGroup", false); }
            if (!isValidEmail(email)) { setFieldError("emailGroup", true); hasError = true; } else { setFieldError("emailGroup", false); }
            if (password.length < 8) { setFieldError("passwordGroup", true); hasError = true; } else { setFieldError("passwordGroup", false); }

            if (!agreeCheckbox) {
                alert("You must agree to the Terms and Conditions to proceed.");
                return;
            }

            if (hasError) return;

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email, password })
                });
                const data = await response.json();

                if (data.success) {
                    alert("Account created! Redirecting to Log In...");
                    window.location.href = "login.html";
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert("Error connecting to server.");
            }
        });
    }

    // --- Log In Request ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            let hasError = false;

            if (!isValidEmail(email)) { setFieldError("emailGroup", true); hasError = true; } else { setFieldError("emailGroup", false); }
            if (!password) { setFieldError("passwordGroup", true); hasError = true; } else { setFieldError("passwordGroup", false); }

            if (hasError) return;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (data.success) {
                    // Save user profile state securely to local session cache
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    window.location.href = "dashboard.html";
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert("Error connecting to server.");
            }
        });
    }
});
