document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('register-form').addEventListener('submit', (event) => {
        event.preventDefault(); 

        let user = document.forms['register-form']['username'].value;
        let password = document.forms['register-form']['password'].value;
        let conf_password = document.forms['register-form']['confirm-password'].value;
        
        if (password !== conf_password) {
            alert('Passwords do not match');
            return;
        }
        console.log(user, password);

        fetch("/register_user", {
            method: "POST",
            body: JSON.stringify({ username: user, password: password }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        
        .then(data => {
            console.log(data);
            if (data.status === 'success') {
                window.location.href = '/login'
            }
        })

        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            window.location.href = '/register'
        });
    });
});
