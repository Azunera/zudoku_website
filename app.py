from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Configure the database connection
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://j1r9o4:<YOUR_API_KEY>@eu-central-1.sql.xata.sh/zudoku:main?sslmode=require'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define your Sudoku model
class Sudoku(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sudoku_data = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Text, nullable=True)
    wrongs = db.Column(db.Text, nullable=True)
    solution = db.Column(db.Text, nullable=True)
    lives = db.Column(db.Integer, nullable=False)

# Route to serve the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route to serve the sudoku page
@app.route('/sudoku')
def sudoku():
    return render_template('sudoku.html')

# Route to save sudoku data
@app.route('/save_sudoku', methods=['POST'])
def save_sudoku():
    data = request.json
    sudoku = Sudoku(
        sudoku_data=data['sudoku'],
        difficulty=data['difficulty'],
        status=data['status'],
        wrongs=data['wrongs'],
        solution=data['solution'],
        lives=data['lives']
    )
    db.session.add(sudoku)
    db.session.commit()
    return jsonify({'message': 'Sudoku saved successfully'}), 201

# Route to load sudoku data
@app.route('/load_sudoku/<int:id>')
def load_sudoku(id):
    sudoku = Sudoku.query.get_or_404(id)
    return jsonify({
        'sudoku': sudoku.sudoku_data,
        'difficulty': sudoku.difficulty,
        'status': sudoku.status,
        'wrongs': sudoku.wrongs,
        'solution': sudoku.solution,
        'lives': sudoku.lives
    })

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
