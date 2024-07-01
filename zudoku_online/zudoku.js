class Sudoku {

    constructor() {
        this.sudoku = Array.from({ length: 9 }, () => Array(9).fill(' '));
        this.statuses = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ['WHITE', 'BLACK']));
        this.o_sudoku = null;
        this.difficulty = null;
        this.wrongs = [];
        this.solution = null;
        this.lives = 5;
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

            while (g) {
                let indexes = '012345678';
                if (blacklist[t]) {
                    blacklist[t].forEach(el => {
                        el.forEach(e => indexes = indexes.replace(e, ''));
                    });
                }
                indexes = indexes.split('').map(Number);
                this.shuffle(indexes);

                for (const i of indexes) {
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
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sudoku-canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / 9;

    // Sample Sudoku data
    let sudoku = Sudoku;
    sudoku.generateSudoku;
    console.log(sudoku.sudoku);

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';

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

        const num = prompt("Enter a number (1-9):");
        if (num >= "1" && num <= "9") {
            sudoku.sudoku[row][col] = num;
            drawGrid();
            drawNumbers();
        }
    }

    canvas.addEventListener('click', handleClick);

    drawGrid();
    drawNumbers();

    const solveButton = document.getElementById('solve-button');
    solveButton.addEventListener('click', () => {
        alert('Solve button clicked!');
        // Add your Sudoku solving logic here
    });
});
