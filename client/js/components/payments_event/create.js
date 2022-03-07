const renderCreatePaymentEventList = (session) => {
    const page = document.getElementById('page');
    let userCount = 1;

    // get rid of all br tags after styling

    page.innerHTML = `
    <div class="background">
            <div class="shape"></div>
            <div class="shape"></div>
    </div>
    
    <div class="d-flex flex-lg-row flex-column-reverse">
    
    <form id="eventDetails">
    <h1>Add Payment Event</h1>
        <label for="eventName">Event Name:</label><br>
        <input type="text" id="eventName" name="eventName"><br>
        <label for="description">Description:</label><br>
        <input type="text" id="description" name="description"><br>    
        <label for="totalAmount">Total Amount:</label><br>
        <input type="number" id="totalAmount" name="totalAmount"><br>
        <label for="dueDate">Due Date:</label><br>
        <input type="text" id="dueDate" name="dueDate">  
        
        <h1>User Breakdown</h1>
        <span>Click to add user</span>
        <button id="add-user" class="addUser-${userCount}">+</button><br>
        <div id="add-user-section">
            <section class="user-section">
                <label for="user">User ${userCount}:</label><br>
                <input type="text" value="${session.username}" id="${userCount}" class="user" name="user" readonly> 
                <label for="percentage">Percentage: </label>
                <input type="number" id="percentage-${userCount}" class="percentage" name="percentage">   
                <span id="display-${userCount}"></span><br>
            </section>
        </div>

        <button class="btn-block btn-color" type="submit">Submit</button>
    </form>
    
    </div>`;

    new Pikaday({
        field: document.getElementById('dueDate'),
        format: 'DD MMMM YYYY',
    });

    // + button
    const addUserButton = document.querySelector('#add-user');
    addUserButton.addEventListener('click', (event) => {
        event.preventDefault();
        clearErrors();

        // get input of user
        let user = document.getElementById(`${userCount}`);

        // check valid user or not
        let valid = true;

        if (valid) {
            // no errors
            const error = document.getElementById('error');
            if (error) {
                error.innerHTML = '';
            }

            addUserForm();
        } else {
            userForm.innerHTML += `
                <span id="error">Invalid</span>
                `;
        }

        // add user count when clicked on
        userCount += 1;
    });

    const form = document.getElementById('eventDetails');
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const eventNameField = document.querySelector('input[name=eventName]');
        const totalAmountField = document.querySelector(
            'input[name=totalAmount]'
        );
        const descriptionField = document.querySelector(
            'input[name=description]'
        );
        const dueDateField = document.querySelector('input[name=dueDate]');

        const percentageData = [];

        let error = null;

        // gets each user data
        const allUserForm = document.querySelectorAll('.user-section');
        const userData = [];
        allUserForm.forEach((user) => {
            const data = {};
            data['user'] = user.querySelector('input[name=user]').value;
            data['percentage'] = parseInt(
                user.querySelector('input[name=percentage]').value
            );
            data['amount'] =
                (parseInt(user.querySelector('input[name=percentage]').value) /
                    100) *
                parseInt(totalAmount.value);

            if (data['user'] == '') {
                error = 'Please enter a valid username';
            }

            userData.push(data);

            percentageData.push(data['percentage']);
        });

        const validPercentage = validatePercentage(percentageData);

        const body = {
            event_name: eventNameField.value,
            total_amount: totalAmountField.value,
            event_creator_id: session.user_id,
            description: descriptionField.value,
            creation_date: new Date(),
            due_date: moment(dueDateField.value).toISOString(),
            payments: userData,
            // all payments in array
        };

        if (body.event_name === '') {
            error = 'Event Name is required';
        } else if (body.description === '') {
            error = 'Description is required';
        } else if (body.due_date === null) {
            error = 'Due Date is required';
        } else if (moment(body.due_date).isBefore(new Date())) {
            error = 'Due Date has to be in the future';
        } else if (body.total_amount === '') {
            error = 'Total Amount is required';
        }

        if (validPercentage) {
            clearPercentageError();
            // need to validate the payment user fields with percentage above
            if (!error) {
                axios
                    .post('/api/paymentsEvent', body)
                    .then((response) => {
                        const updateBody = {
                            user_id: session.user_id,
                            event_id: response.data.id,
                        }
                        axios
                            .patch('/api/payments/updateBothStatus', updateBody)
                            .then(response => {
                                mainPageElement(session);
                            })
                            .catch(error => {
                                clearErrors();
                                displayError(error.response.data.message);                                
                            })

                    })
                    .catch((error) => {
                        clearErrors();
                        displayError(error.response.data.message);
                    }); //update endpoint
            } else {
                clearErrors();
                displayError(error);
            }
        } else {
            clearErrors();
            clearPercentageError();

            const formDiv = document.querySelector('#add-user-section');
            const errorPercentage = document.createElement('p');
            errorPercentage.setAttribute('id', 'error-percentage');
            errorPercentage.innerHTML = 'Invalid percentage total'; // can fix text later.
            formDiv.appendChild(errorPercentage);
        }
    });
};

function addUserForm() {
    let userCount = document.getElementsByClassName('user').length + 1;
    const userForm = document.getElementById(`add-user-section`);

    // create a section for each
    let section = document.createElement('section');
    section.setAttribute('class', 'user-section');
    userForm.appendChild(section);

    let userLabel = document.createElement('label');
    userLabel.setAttribute('for', userCount);
    userLabel.innerHTML = `User ${userCount}:`;
    section.appendChild(userLabel);

    let breakTag = document.createElement('br');
    section.appendChild(breakTag);

    let userInput = document.createElement('input');
    userInput.setAttribute('type', 'text');
    userInput.setAttribute('id', userCount);
    userInput.setAttribute('class', 'user');
    userInput.setAttribute('name', 'user');
    section.appendChild(userInput);

    let percentageLabel = document.createElement('label');
    percentageLabel.setAttribute('for', `percentage-${userCount}`);
    percentageLabel.innerHTML = `Percentage: `;
    section.appendChild(percentageLabel);

    let percentageInput = document.createElement('input');
    percentageInput.setAttribute('type', 'number');
    percentageInput.setAttribute('id', `percentage-${userCount}`);
    percentageInput.setAttribute('class', 'percentage');
    percentageInput.setAttribute('name', 'percentage');
    section.appendChild(percentageInput);

    section.appendChild(breakTag);
}

function clearPercentageError() {
    const displayedErrorPercentage =
        document.getElementById('error-percentage');
    if (displayedErrorPercentage) {
        displayedErrorPercentage.remove();
    }
}
