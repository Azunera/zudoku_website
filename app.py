from flask import Flask, jsonify, render_template, request, redirect, url_for, flash
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
    

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm-password']

        if password != confirm_password:
            flash('Passwords do not match!')
            return redirect(url_for('register'))
        
        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    return render_template('register.html')


@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/login_user', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user is None or not user.check_password(password):
            flash('Invalid username or password!')
            return redirect(url_for('login'))
        flash('Login successful!')
        return redirect(url_for('zudoku'))
    return render_template('login.html')



if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
    
 
 
 
 