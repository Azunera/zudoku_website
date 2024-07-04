from flask import Flask, jsonify, make_response, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os

load_dotenv()  

app = Flask(__name__)  # Instancia de WSGI

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')  

db = SQLAlchemy(app)

# Defining user model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password): 
        return check_password_hash(self.password_hash, password)
    

class Zudoku(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sudoku = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.Text, nullable=False)
    status = db.Column(db.Text, nullable=True)
    solution = db.Column(db.Text, nullable=True)
    lives = db.Column(db.Integer, nullable=False)
    User = db.Column(db.Text, nullable=False)

# Route for main page
@app.route('/')
def index():
    return render_template('index.html')

# Route for online zudoku
@app.route('/zudoku')
def zudoku():
    return render_template('zudoku.html')

# 
@app.route('/save', methods=['POST'])
def save():
    data = request.json
    
    zudoku = Zudoku(
        sudoku=data['sudoku'],
        difficulty=data['difficulty'],
        status=data['status'],
        solution=data['solution'],
        lives=data['lives']
        
    )

    db.session.add(zudoku)
    db.session.commit()
    
    return jsonify({'message': 'Sudoku saved successfully'}), 201

# @app.route('/load', method=['GET']) 
# def load():
    

# REGISTER SYSTEM
@app.route('/register', methods=['GET'])
def register():
    return render_template('register.html')

@app.route('/register_user', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            flash('Invalid username or password!')
            return jsonify({'status': 'error', 'message': 'user or password are required'}), 400
        
        if User.query.filter_by(username=username).first() is not None:
            flash('User already exists!')
            return jsonify({'status': 'error', 'message': 'user already exists'}), 400

        new_user = User(username=username)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        flash('Registered succesfully')
        return jsonify({'status': 'success', 'message': 'User registered successfully'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# LOGGING SYSTEM
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/login_user', methods=['POST'])
def login_user():
    # try:
    credentials = request.get_json()
    username = credentials['username']
    password = credentials['password']

    user = User.query.filter_by(username=username).first()

    if user is None:
        flash('Invalid username!')
        return jsonify({'status': 'error', 'message': 'Invalid username!'}), 401
    elif not user.check_password(password):
        flash('Invalid password!')
        return jsonify({'status': 'error', 'message': 'Invalid password!'}), 401

    response = make_response(jsonify({'status': 'success', 'message': 'Logged in successfully'}))
    response.set_cookie('session_token', user.token, httponly=True, secure=True)  # setting a secure HttpOnly cookie
    flash('Logged in successfully!')
    return jsonify({'status': 'success', 'username': username})


# @app.route('/login_user', methods=['GET','POST'])
# def login():
#     if request.method == 'POST':
#         username = request.form['username']
#         password = request.form['password']
#         user = User.query.filter_by(username=username).first()
#         if user is None or not user.check_password(password):
#             flash('Invalid username or password!')
#             return redirect(url_for('login'))
#         flash('Login successful!')
#         return redirect(url_for('zudoku'))
#     return render_template('login.html')


# @app.route('/save', methods=['POST'])
# def save():
#     data = request.get_json()
#     # Handle saving the data
#     return jsonify({'status': 'success'})
 
if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
    
 
 
 
 