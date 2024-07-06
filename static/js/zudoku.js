class Sudoku {
    constructor() {
        this.sudoku = Array.from({ length: 9 }, () => Array(9).fill(' '));
        this.statuses = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ['WHITE', 'BLACK']));
        this.o_sudoku = null;
        this.difficulty = null;
        this.wrongs = [];
        this.solution = null;
        this.lives = 5;
        this.color = 'black'
        this.events = {
            lostOneLife: [],
            lostAllLives: [],
            sudokuCompleted: []
        };
    }

    generateSudoku() {
        this.sudoku = Array.from({ length: 9 }, () => Array(9).fill(' '));
        let n = 1;
        let r = -1;
        let t = 1;
        const history = [];
        const blacklist = {};

        while (n < 10) {
            r += 1;
            if (r > 8) {
                n += 1;
                r = 0;
            }
            if (n === 10) break;

            let ii = true;
            let g = true;
            let i;

            while (g) {
                let indexes = '012345678';
                if (blacklist[t]) {
                    blacklist[t].forEach(el => {
                        el.forEach(e => indexes = indexes.replace(e, ''));
                    });
                }
                indexes = indexes.split('').map(Number);
                this.shuffle(indexes);

                for (i of indexes) {
                    if (this.sudoku[r][i] === ' ') {
                        this.sudoku[r][i] = String(n);
                        if (this.check()) {
                            g = false;
                            ii = false;
                            break;
                        } else {
                            this.sudoku[r][i] = ' ';
                        }
                    }
                }

                if (ii) {
                    delete blacklist[t];
                    t -= 1;
                    const lastHistory = history.pop();
                    const hisd = lastHistory[2];
                    this.sudoku[parseInt(lastHistory[0])][parseInt(hisd)] = ' ';
                    if (!blacklist[t]) blacklist[t] = [];
                    if (!blacklist[t].includes(hisd)) blacklist[t].push(hisd);

                    r -= 1;
                    if (r < 0) {
                        r = 8;
                        n -= 1;
                    }
                } else {
                    history.push(`${r}:${i}:${t}`);
                    t += 1;
                }
            }
        }

        this.solution = JSON.parse(JSON.stringify(this.sudoku));
        this.statuses = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ['WHITE', 'BLACK']));
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    check() {
        // Add your Sudoku validity check logic here
        return true;
    }

    setDifficulty(difficulty) {
        if (!['Easy', 'Medium', 'Hard', 'Test'].includes(difficulty)) {
            throw new Error('Invalid difficulty');
        }

        this.difficulty = difficulty 

        let emptyCells;
        if (difficulty === 'Easy') {
            emptyCells = 40;
            this.lives = 15;
        } else if (difficulty === 'Medium') {
            emptyCells = 50;
            this.lives = 10;
        } else if (difficulty === 'Hard') {
            emptyCells = 60;
            this.lives = 5;
        } else { // Test
            emptyCells = 1;
            this.lives = 100;
        }

        const selectedPositions = new Set();
        const cellsWithNumbers = this.sudoku.flatMap((row, rowIndex) =>
            row.map((col, colIndex) => (col !== ' ' ? [rowIndex, colIndex] : null)).filter(Boolean)
        );

        while (selectedPositions.size < emptyCells) {
            const [row, col] = cellsWithNumbers[Math.floor(Math.random() * cellsWithNumbers.length)];
            if (!selectedPositions.has(`${row},${col}`)) {
                selectedPositions.add(`${row},${col}`);
                this.sudoku[row][col] = ' ';
            }
        }
        
        return this.sudoku;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sudoku-canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / 9;
    let selectedCell = null; // To store the currently selected cell

    const title = document.getElementById('title')
    const intro = document.getElementById('intro')
    


    // Sampling Sudoku data
    let sudoku = new Sudoku();
    sudoku.generateSudoku();
    sudoku.setDifficulty('Medium');
    console.log(sudoku.sudoku);

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = sudoku.color;

        for (let i = 0; i <= 9; i++) {
            ctx.lineWidth = (i % 3 === 0) ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
    }

    function drawNumbers() {
        ctx.font = `${cellSize / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = sudoku.color

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = sudoku.sudoku[row][col];
                if (num) {
                    const x = col * cellSize + cellSize / 2;
                    const y = row * cellSize + cellSize / 2;
                    ctx.fillText(num, x, y);
                }
            }
        }
    }

    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        selectedCell = { row, col }; // Store the selected cell
    }

    function handleKeyPress(event) {
        if (selectedCell && event.key >= "1" && event.key <= "9") {
            const { row, col } = selectedCell;
            sudoku.sudoku[row][col] = event.key;
            drawGrid();
            drawNumbers();
        }
    }

    canvas.addEventListener('click', handleClick);
    document.addEventListener('keypress', handleKeyPress);

    drawGrid();
    drawNumbers();

    document.getElementById('easy-button').addEventListener('click', () => {
        document.body.style.backgroundColor = 'white';
        intro.style.color = 'black';
        title.style.color = 'black';
        sudoku.color = 'black';


        sudoku.generateSudoku();
        sudoku.setDifficulty('Easy');
        drawGrid();
        drawNumbers();
        title.style.color = 'lightblue';

    });

    document.getElementById('medium-button').addEventListener('click', () => {       
        document.body.style.backgroundColor = '#f0f0f0';
        intro.style.color = '#c71585';
        title.style.color = '#c71585';
        sudoku.color = '#c71585'

        sudoku.generateSudoku();
        sudoku.setDifficulty('Medium');
        drawGrid();
        drawNumbers();
    });

    document.getElementById('hard-button').addEventListener('click', () => {
        document.body.style.backgroundColor = 'black';
        intro.style.color = '#eee8aa';
        title.style.color = '#eee8aa';
        sudoku.color = '#eee8aa'
    
        sudoku.generateSudoku();
        sudoku.setDifficulty('Hard');
        drawGrid();
        drawNumbers();
    });

    // SYSTEM FOR SAVING AND LOADING

    async function getUserInfo() {
        const response = await fetch('/get_user_info', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const userInfo = await response.json();
            return userInfo;
        } else {
            console.error('Failed to fetch user info');
            return null;
        }
    }

    document.getElementById('save').addEventListener('click', async () => {
        const userInfo = await getUserInfo();
        
        if (userInfo) {
            let data = JSON.stringify({
                sudoku: sudoku.sudoku,
                difficulty: sudoku.difficulty,
                status: sudoku.statuses,
                solution: sudoku.solution,
                lives: sudoku.lives,
                user: userInfo.username // Include the user's username or ID
            });

            fetch("/save", {
                method: "POST",
                body: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        } else {
            console.error('User info not available');
        }
    });
})

// Guardarlo local Storage