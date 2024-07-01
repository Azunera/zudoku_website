from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Secret key for session management

# In-memory "database"
users = {}

@app.route('/')
def home():
    if 'username' in session:
        username = session['username']
        hashed_password = users.get(username)
        return render_template('index.html', username=username, hashed_password=hashed_password)
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users:
            flash('Username already exists')
        else:
            users[username] = generate_password_hash(password)
            flash('Registration successful')
            return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = users.get(username)
        if user and check_password_hash(user, password):
            session['username'] = username
            flash('Login successful')
            return redirect(url_for('home'))
        else:
            flash('Invalid credentials')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('Logged out successfully')
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
