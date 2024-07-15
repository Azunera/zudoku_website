export default class Sudoku {
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


    check() {
        let rows = Array.from({ length: 9 }, () => new Set());
        let cols = Array.from({ length: 9 }, () => new Set());
        let boxes = Array.from({ length: 9 }, () => new Set());
   
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.sudoku[r][c] === ' ') {
                    continue;
                }
   
                let value = this.sudoku[r][c];
                let boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
   
                if (rows[r].has(value) || cols[c].has(value) || boxes[boxIndex].has(value)) {
                    return false;
                }
   
                rows[r].add(value);
                cols[c].add(value);
                boxes[boxIndex].add(value);
            }
        }
   
        return true;    
    };
     
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
                    for (const el of blacklist[t]) {
                        for (const e of el) {
                            indexes = indexes.replace(e, '');
                        }
                    }
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


    check_cell(x,y) {
        if (this.sudoku[x][y] == this.solution[x][y]) {
            return true;
        } else {
            return false
        }
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
            document.getElementById('lives_label').innerHTML = `${this.lives} lives left`;
        } else if (difficulty === 'Medium') {
            emptyCells = 50;
            this.lives = 10;
            document.getElementById('lives_label').innerHTML = `${this.lives} lives left`;
        } else if (difficulty === 'Hard') {
            emptyCells = 60;
            this.lives = 5;
            document.getElementById('lives_label').innerHTML = `${this.lives} lives left`;
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