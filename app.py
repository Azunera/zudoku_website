from flask import Flask, jsonify, make_response, render_template, request, redirect, url_for, flash 
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime
import uuid
import os
import secrets

load_dotenv()  

app = Flask(__name__)  

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = secrets.token_hex()  

db = SQLAlchemy(app)

# <---- DEFINING CLASSES ---->
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    token = db.Column(db.String(36), unique=True, nullable=True)  

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password): 
        return check_password_hash(self.password_hash, password)  

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    token = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(db.TIMESTAMP, default=datetime.now)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.now, onupdate=datetime.now)


class Zudoku(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sudoku = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.Text, nullable=False)
    status = db.Column(db.Text, nullable=True)
    solution = db.Column(db.Text, nullable=True)
    lives = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)  
    
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
    zudoku = Zudoku.query.filter_by(user_id=data['user_id']).first()

    if zudoku:
        zudoku.sudoku     = data['sudoku']
        zudoku.difficulty = data['difficulty']
        zudoku.status     = data['status']
        zudoku.solution   = data['solution']
        zudoku.lives      = data['lives']
    else:
        zudoku = Zudoku(
            sudoku=data['sudoku'],
            difficulty=data['difficulty'],
            status=data['status'],
            solution=data['solution'],
            lives=data['lives'],
            user_id=data['user_id']
        )
    db.session.add(zudoku)
    db.session.commit()
    
    return jsonify({'message': 'Sudoku saved successfully'}), 201

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
    credentials = request.get_json()
    username = credentials['username']
    password = credentials['password']

    user = User.query.filter_by(username=username).first()

    if user is None:
        return jsonify({'status': 'error', 'message': 'Invalid username!'}), 401
    elif not user.check_password(password):
        return jsonify({'status': 'error', 'message': 'Invalid password!'}), 401

    session_token = str(uuid.uuid4())
    new_session = Session(user_id=user.id, token=session_token)
    db.session.add(new_session)
    db.session.commit()

    response = make_response(jsonify({'status': 'success', 'message': 'Logged in successfully'}))
    response.set_cookie('session_token', session_token, httponly=True, secure=True, samesite=None) 
    #Sec must be true in production
    
    return response

@app.route('/logout')
def logout():
    db.session.clear()
    return redirect(url_for('login'))


@app.route('/get_user_info', methods=['GET'])
def get_user_info():
    session_token = request.cookies.get('session_token')
    if not session_token:
        print('Session token is missing')
        return jsonify({'status': 'error', 'message': 'Session token is missing'}), 401
    
    # Finding the session using the session token
    session = Session.query.filter_by(token=session_token).first()
    if not session:
        print('Invalid session token')
        return jsonify({'status': 'error', 'message': 'Invalid session token'}), 401

    # Finding the user using the session's user_id
    user = User.query.filter_by(id=session.user_id).first()
    if not user:
        print('User not found')
        return jsonify({'status': 'error', 'message': 'User not found'}), 404
    
    return jsonify({'username': user.username, 'id': user.id}), 200

 
@app.route('/load', methods=['GET']) 
def load():
    
    session_token = request.cookies.get('session_token')
    session = Session.query.filter_by(token=session_token).first()
    zudoku = Zudoku.query.filter_by(user_id=session.user_id).first()
    
    # Ideally for changing the zudoku.sudoku and solution need to be done here
    print(zudoku.sudoku)
    return jsonify({
        'status': 'success',
        'message': 'Sudoku loaded successfully',
        'zudoku': {
            'id': zudoku.id,
            'sudoku': zudoku.sudoku,
            'difficulty': zudoku.difficulty,
            'status': zudoku.status,
            'solution': zudoku.solution,
            'lives': zudoku.lives,
            'user_id': zudoku.user_id
        }})
    
    
if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
    