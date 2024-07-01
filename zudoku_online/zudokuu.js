document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');

    // Create the Sudoku grid
    for (let i = 0; i < 81; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = '1';
        input.classList.add('sudoku-cell');
        board.appendChild(input);
    }

    const solveButton = document.getElementById('solve-button');
    solveButton.addEventListener('click', () => {
        // Add your Sudoku solving logic here
        alert('Solve button clicked!');
    });
});





xata init --db https://Azunera-s-workspace-j1r9o4.eu-central-1.xata.sh/db/zudoku


from xata.client import XataClient
xata = XataClient()




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

    on(event, callback) {
        if (this.events[event]) {
            this.events[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    check() {
        const rows = this.sudoku.map(row => row.join(''));
        const columns = Array.from({ length: 9 }, (_, i) => this.sudoku.map(row => row[i]).join(''));
        const squares = Array.from({ length: 9 }, (_, i) => {
            const rowStart = Math.floor(i / 3) * 3;
            const colStart = (i % 3) * 3;
            return this.sudoku.slice(rowStart, rowStart + 3).flatMap(row => row.slice(colStart, colStart + 3)).join('');
        });

        const boardGroups = [rows, columns, squares];

        for (const group of boardGroups) {
            for (const line of group) {
                for (const char of line) {
                    if (char !== ' ' && line.split(char).length - 1 > 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    onLifeLost() {
        this.lives -= 1;
        this.emit('lostOneLife', this.lives);

        if (this.lives === 0) {
            this.emit('lostAllLives', 'LOST');
        }
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

    setDifficulty(difficulty) {
        if (!['Easy', 'Medium', 'Hard', 'Test'].includes(difficulty)) {
            throw new Error('Invalid difficulty');
        }

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

    setNumber(x, y, number) {
        if (this.sudoku[x][y] !== this.solution[x][y]) {
            if (this.sudoku[x][y] === number) {
                this.sudoku[x][y] = ' ';
                this.statuses[x][y] = ['WHITE', 'BLACK'];
            } else {
                this.sudoku[x][y] = number;
            }
        }
    }

    updateStatuses(x, y, number) {
        const convertor = (x, y) => [Math.floor(x / 3) * 3 + Math.floor(y / 3), (x % 3) * 3 + y % 3];

        const rows = this.sudoku.map(row => row.join(''));
        const columns = Array.from({ length: 9 }, (_, i) => this.sudoku.map(row => row[i]).join(''));
        const squares = Array.from({ length: 9 }, (_, i) => {
            const rowStart = Math.floor(i / 3) * 3;
            const colStart = (i % 3) * 3;
            return this.sudoku.slice(rowStart, rowStart + 3).flatMap(row => row.slice(colStart, colStart + 3)).join('');
        });

        const boardGroups = [rows, columns, squares];

        const wrongCords = new Set();
        for (const group of boardGroups) {
            for (let x = 0; x < 9; x++) {
                const counter = {};
                let safetyPin = true;
                for (let y = 0; y < 9; y++) {
                    let actualX, actualY;
                    if (group === columns) {
                        actualX = y;
                        actualY = x;
                    } else if (group === squares) {
                        [actualX, actualY] = convertor(x, y);
                    } else {
                        actualX = x;
                        actualY = y;
                    }

                    if (group[x][y] !== ' ') {
                        if (!counter[group[x][y]]) {
                            counter[group[x][y]] = [actualX, actualY];
                        } else {
                            if (safetyPin) {
                                wrongCords.add(`${counter[group[x][y]][0]},${counter[group[x][y]][1]}`);
                                wrongCords.add(`${actualX},${actualY}`);
                                safetyPin = false;
                            } else {
                                wrongCords.add(`${actualX},${actualY}`);
                            }
                        }
                    }
                }
            }
        }

        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                this.statuses[x][y][0] = 'WHITE';
            }
        }

        for (const coord of wrongCords) {
            const [wrongX, wrongY] = coord.split(',').map(Number);
            this.statuses[wrongX][wrongY][0] = 'RED';
        }
    }

    isNumberCorrect(x, y, number) {
        return this.solution[x][y] === number;
    }

    checkWin() {
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                if (this.sudoku[x][y] !== this.solution[x][y]) {
                    return false;
                }
            }
        }
        this.emit('sudokuCompleted', 'COMPLETED');
        return true;
    }

    printSudoku() {
        console.log(`
     1   2   3   4   5   6   7   8   9 
   +---+---+---+---+---+---+---+---+---+
A  | ${this.sudoku[0][0]} | ${this.sudoku[0][1]} | ${this.sudoku[0][2]} | ${this.sudoku[0][3]} | ${this.sudoku[0][4]} | ${this.sudoku[0][5]} | ${this.sudoku[0][6]} | ${this.sudoku[0][7]} | ${this.sudoku[0][8]} |
   +---+---+---+---+---+---+---+---+---+
B  | ${this.sudoku[1][0]} | ${this.sudoku[1][1]} | ${this.sudoku[1][2]} | ${this.sudoku[1][3]} | ${this.sudoku[1][4]} | ${this.sudoku[1][5]} | ${this.sudoku[1][6]} | ${this.sudoku[1][7]} | ${this.sudoku[1][8]} |
   +---+---+---+---+---+---+---+---+---+
C  | ${this.sudoku[2][0]} | ${this.sudoku[2][1]} | ${this.sudoku[2][2]} | ${this.sudoku[2][3]} | ${this.sudoku[2][4]} | ${this.sudoku[2][5]} | ${this.sudoku[2][6]} | ${this.sudoku[2][7]} | ${this.sudoku[2][8]} |
   +---+---+---+---+---+---+---+---+---+
D  | ${this.sudoku[3][0]} | ${this.sudoku[3][1]} | ${this.sudoku[3][2]} | ${this.sudoku[3][3]} | ${this.sudoku[3][4]} | ${this.sudoku[3][5]} | ${this.sudoku[3][6]} | ${this.sudoku[3][7]} | ${this.sudoku[3][8]} |
   +---+---+---+---+---+---+---+---+---+
E  | ${this.sudoku[4][0]} | ${this.sudoku[4][1]} | ${this.sudoku[4][2]} | ${this.sudoku[4][3]} | ${this.sudoku[4][4]} | ${this.sudoku[4][5]} | ${this.sudoku[4][6]} | ${this.sudoku[4][7]} | ${this.sudoku[4][8]} |
   +---+---+---+---+---+---+---+---+---+
F  | ${this.sudoku[5][0]} | ${this.sudoku[5][1]} | ${this.sudoku[5][2]} | ${this.sudoku[5][3]} | ${this.sudoku[5][4]} | ${this.sudoku[5][5]} | ${this.sudoku[5][6]} | ${this.sudoku[5][7]} | ${this.sudoku[5][8]} |
   +---+---+---+---+---+---+---+---+---+
G  | ${this.sudoku[6][0]} | ${this.sudoku[6][1]} | ${this.sudoku[6][2]} | ${this.sudoku[6][3]} | ${this.sudoku[6][4]} | ${this.sudoku[6][5]} | ${this.sudoku[6][6]} | ${this.sudoku[6][7]} | ${this.sudoku[6][8]} |
   +---+---+---+---+---+---+---+---+---+
H  | ${this.sudoku[7][0]} | ${this.sudoku[7][1]} | ${this.sudoku[7][2]} | ${this.sudoku[7][3]} | ${this.sudoku[7][4]} | ${this.sudoku[7][5]} | ${this.sudoku[7][6]} | ${this.sudoku[7][7]} | ${this.sudoku[7][8]} |
   +---+---+---+---+---+---+---+---+---+
I  | ${this.sudoku[8][0]} | ${this.sudoku[8][1]} | ${this.sudoku[8][2]} | ${this.sudoku[8][3]} | ${this.sudoku[8][4]} | ${this.sudoku[8][5]} | ${this.sudoku[8][6]} | ${this.sudoku[8][7]} | ${this.sudoku[8][8]} |
   +---+---+---+---+---+---+---+---+---+
        `);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}


data = xata.records().get("tableName", "rec_xyz")
print(data)

pip install xata
