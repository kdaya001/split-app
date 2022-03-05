function renderSignupForm() {
    const page = document.getElementById('page');
    page.innerHTML = `
        <h2>Create an account with Split</h2>
        
    
        <form id="signup" action="/api/users" method="POST">
            <label lass="input-group-text" id="inputGroup-sizing-default">Name:</label>
            <input type="text" name="first_name" />
            <label>Username:</label>
            <input type="text" name="username" />
            <label>Email:</label>
            <input type="email" name="email" />
            <label>Password:</label>
            <input type="password" name="password" />

            <button id="signUpbutton"class="btn btn-white ml-2" type="submit">Sign up</button>
        </form>
        </div>

    `;

    const form = document.getElementById('signup');
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameField = document.querySelector('input[name=first_name]');
        const usernameField = document.querySelector('input[name=username]');
        const passwordField = document.querySelector('input[name=password]');
        const emailField = document.querySelector('input[name=email]');

        const body = {
            first_name: nameField.value,
            username: usernameField.value,
            password: passwordField.value,
            email: emailField.value,
        };

        let error = null;
        if (body.first_name === '') {
            error = 'Name is required';
        } else if (body.username === '') {
            error = 'Username is required';
        } else if (body.password === '') {
            error = 'Password is required';
        } else if (body.email === '') {
            error = 'Email is required';
        }

        if (!error) {
            axios
                .post('/api/users', body)
                .then((response) => {
                    renderLoginForm(); // TODO change to auto login
                })
                .catch((error) => {
                    clearErrors();
                    displayError(error.response.data.message);
                });
        } else {
            clearErrors();
            displayError(error);
        }
    });
}
