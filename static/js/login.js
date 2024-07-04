document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form').addEventListener('submit', (event) => {
        event.preventDefault(); 

        let user = document.forms['login-form']['username'].value;
        let password = document.forms['login-form']['password'].value;
    
        console.log(user, password);

        fetch("/login_user", {
            method: "POST",
            body: JSON.stringify({ username: user, password: password }),
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }
        })

        .then (response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json()
        })
        .then(data => {
            console.log(data);
            if (data.status === 'success') {
                window.location.href('/zudoku')
            }
        })
        .catch(error => {
            console.error('There was a problem with the connection')
            window.location.href = '/login'
        })
    });
});
