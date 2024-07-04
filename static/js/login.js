document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('login-form').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way
        console.log("Heeeeeeeeeeeeeey!")
        let user     = document.forms['login-form']['username'].value;
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
        
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
    })
})