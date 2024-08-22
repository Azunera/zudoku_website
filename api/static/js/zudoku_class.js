// export default class Colors {
//     static WRONG_RED_DARK = "#1E5A8C"; // Tomato Red
//     static LIGHTER_WRONG_RED = "rgb(255, 150, 128)";
//     static DARKER_WRONG_RED = "rgb(205, 49, 21)";
//     static CORRECT_BLUE = "rgb(70, 130, 180)"; // Steel Blue
//     static LIGHTER_CORRECT_BLUE = "rgb(100, 170, 220)";
//     static DARKER_CORRECT_BLUE = "rgb(30, 90, 140)";
// }
// RGB: (255, 150, 128)
// Hex: #FF9680
// Lighter Steel Blue:
// RGB: (100, 170, 220)
// Hex: #64AAD8
// Darker Versions:
// Darker Tomato Red:
// RGB: (205, 49, 21)
// Hex: #CD3115
// Darker Steel Blue:
// RGB: (30, 90, 140)
// Hex: #1E5A8C

export default class Sudoku {
    constructor() {
        this.colors = {
            WRONG_RED: "rgb(255, 99, 71)",    // Tomato Red
            LIGHT_WRONG_RED: "rgb(255, 150, 128)", 
            DARK_WRONG_RED: "rgb(205, 49, 21)",
            CORRECT_BLUE: "rgb(70, 130, 180)", // Steel Blue
            LIGHT_CORRECT_BLUE: "rgb(100, 170, 220)",
            DARK_CORRECT_BLUE: "rgb(30, 90, 140)",
            BLACK: 'rgb(0,0,0)',
            WHITE: 'rgb(255,255,255)'
        };

        
        this.sudoku = Array.from({ length: 9 }, () => Array(9).fill(' '));
        // this.statuses = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 'clear'));
        this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']));
        this.notes_map = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => false));
        this.number_color = Array.from({ length: 9}, () => Array.from({ length: 9}, () => [this.colors.BLACK, this.colors.WHITE]));
        this.cell_color = Array.from({ length: 9}, () => Array.from({ length: 9}, () => 'clear'));
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

    switchNote(x,y, deactivate=false, activate=false ) { 
        if (deactivate) {
            if (this.notes_map[x][y] == false) {
                return
            }
        }
        if (activate) {
            if (this.notes_map[x][y] == true) {
                return
            }
        }
        this.notes_map[x][y] = !this.notes_map[x][y];
    }

    resetNote(x,y) {
        for (let z; z < 9; z++) {
            this.notes[x][y][z] = ' ';
        }
    }

    // checkNumber(x,y) {
    //     this.sudoku
    // }
    

    setDifficulty(difficulty) {
        if (!['Easy', 'Medium', 'Hard', 'Arduous', 'Test'].includes(difficulty)) {
            throw new Error('Invalid difficulty');
        }

        this.difficulty = difficulty

        let emptyCells;
        if (difficulty === 'Easy') {
            emptyCells = 40;
            this.lives = 10;
            document.getElementById('lives-label').innerHTML = `${this.lives} lives`;
        } else if (difficulty === 'Medium') {
            emptyCells = 50;
            this.lives = 10;
            document.getElementById('lives-label').innerHTML = `${this.lives} lives `;
        } else if (difficulty === 'Hard') {
            emptyCells = 60;
            this.lives = 15;
            document.getElementById('lives-label').innerHTML = `${this.lives} lives `;
        } else if (difficulty === 'Arduous') {
            emptyCells = 63;
            this.lives = 15;
            document.getElementById('lives-label').innerHTML = `${this.lives} lives `;
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
    
    findWrongs() {

        this.cell_color = Array.from({ length: 9}, () => Array.from({ length: 9}, () => "clear"));
        let rows = Array.from({ length: 9 }, () => new Set());
        let cols = Array.from({ length: 9 }, () => new Set());
        let boxes = Array.from({ length: 9 }, () => new Set());
    
        let wrongCells = new Set(); // for wronging cell coordinates as strings and avoiding repetition of them
    
        for (let r = 0; r < 9; r++) { // PER ROW
            for (let c = 0; c < 9; c++) { // PER COLUMN
                if (this.sudoku[r][c] === ' ') {
                    continue;
                }
    
                let value = this.sudoku[r][c];
                let boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    
                let cellStr = `${r},${c}`;
    
                if (rows[r].has(value) || cols[c].has(value) || boxes[boxIndex].has(value)) {
                    // If a duplicate is found, mark this cell as wrong
                    wrongCells.add(cellStr);
    
                    // Marking the first appearance in rows, cols, and boxes as wrong as well.
                    for (let rr = 0; rr < 9; rr++) {
                        if (this.sudoku[rr][c] === value && !wrongCells.has(`${rr},${c}`)) {
                            wrongCells.add(`${rr},${c}`);
                            break;
                        }
                    }
    
                    for (let cc = 0; cc < 9; cc++) {
                        if (this.sudoku[r][cc] === value && !wrongCells.has(`${r},${cc}`)) {
                            wrongCells.add(`${r},${cc}`);
                            break;
                        }
                    }
    
                    for (let i = 0; i < 9; i++) {
                        let boxRow = Math.floor(boxIndex / 3) * 3 + Math.floor(i / 3);
                        let boxCol = (boxIndex % 3) * 3 + (i % 3);
                        if (this.sudoku[boxRow][boxCol] === value && !wrongCells.has(`${boxRow},${boxCol}`)) {
                            wrongCells.add(`${boxRow},${boxCol}`);
                            break;
                        }
                    }
    
                } else {
                    rows[r].add(value);
                    cols[c].add(value);
                    boxes[boxIndex].add(value);
                }
            }
        }
        wrongCells.forEach(cell => {
            const [r, c] = cell.split(',').map(Number);
            this.cell_color[r][c] = 'wrong';
            // this.number_color[r][c] = [this.colors.DARK_WRONG_RED, this.colors.LIGHT_WRONG_RED];
        });
        
        // return Array.from(wrongCells).map(cell => cell.split(',').map(Number));
    }
}
