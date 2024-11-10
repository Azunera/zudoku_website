export default class Sudoku {
    constructor() {
        this.colors = {
            WRONG_RED: "rgb(205, 49, 21)",    // Tomato Red
            // LIGHT_WRONG_RED: "rgb(205, 49, 21)",  // temporally the same as dark
            // DARK_WRONG_RED: "rgb(205, 49, 21)",
            LIGHT_CORRECT_BLUE: "rgb(100, 170, 220)", // 173, 216, 230 also cool
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

    check_victory() {
        if (this.check()) {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (this.sudoku[r][c] == ' ') {
                        return false;
                    }
                }
            }
            return true;
        }
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; 
        }
        return array;
    }
    
    generate_full_board() {
        this.sudoku = Array.from({ length: 9 }, () => Array(9).fill(" "));
        let numbers = this.shuffle(Array.from({ length: 9 }, (_, x) => (x + 1).toString()));
        this.fill_board(numbers);
    }
    
    fill_board(numbers) {
        let empty = this.find_empty(this.sudoku);
        if (!empty) {
            return true;
        }
        let [row, col] = empty;
    
        for (let num of numbers) {
            if (this.is_valid(this.sudoku, num, [row, col])) {
                this.sudoku[row][col] = num;
                if (this.fill_board(numbers)) {
                    return true;
                }
                this.sudoku[row][col] = " ";
            }
        }
        return false;
    }
    
    solve(board) {
        let empty = this.find_empty(board);
        if (!empty) {
            return true;
        }
        let [row, col] = empty;
    
        for (let num of Array.from({ length: 9 }, (_, x) => (x + 1).toString())) {
            if (this.is_valid(board, num, [row, col])) {
                board[row][col] = num;
                if (this.solve(board)) {
                    return true;
                }
                board[row][col] = " ";
            }
        }
        return false;
    }
    
    is_valid(board, num, pos) {
        let [row, col] = pos;
    
        // Checking row
        if (board[row].includes(num)) {
            return false;
        }
    
        // Checking column
        if ([...Array(9)].some((_, r) => board[r][col] === num)) {
            return false;
        }
    
        // Determine 3x3 box
        let box_x = Math.floor(col / 3);
        let box_y = Math.floor(row / 3);
    
        // Check within the 3x3 box
        for (let x = box_y * 3; x < box_y * 3 + 3; x++) {
            for (let y = box_x * 3; y < box_x * 3 + 3; y++) {
                if (board[x][y] === num) {
                    return false;
                }
            }
        }
        return true;
    }
    
    find_empty(board) {
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                if (board[x][y] === " ") {
                    return [x, y];
                }
            }
        }
        return null;
    }
    
    has_unique_solution() {
        let sudoku_copy = JSON.parse(JSON.stringify(this.sudoku));
        const max_solutions = 2;
        let solutions = this.solve_multiple(sudoku_copy, max_solutions);
        return solutions === 1;
    }
    
    solve_multiple(board, max_solutions) {
        let empty = this.find_empty(board);
        if (!empty) {
            return 1;
        }
        let [row, col] = empty;
        let solutions = 0;
    
        for (let num of Array.from({ length: 9 }, (_, x) => (x + 1).toString())) {
            if (this.is_valid(board, num, [row, col])) {
                board[row][col] = num;
                solutions += this.solve_multiple(board, max_solutions);
                board[row][col] = " ";
                if (solutions >= max_solutions) {
                    return solutions;
                }
            }
        }
        return solutions;
    }
    
    generateSudoku(difficulty, hints = null) {
        if (!hints) {
            const validDifficulties = ["easy", "medium", "hard", "evil", "test"];
            const fDifficulty = difficulty.toLowerCase();
            if (!validDifficulties.includes(fDifficulty)) {
                throw new Error("Invalid difficulty");
            }

            this.difficulty = fDifficulty
     
            let dif_index = validDifficulties.indexOf(fDifficulty);
            hints = 35 - (5 * dif_index) + Math.floor(Math.random() * 5);
            this.lives = 4 + 2 * dif_index;
            document.getElementById('lives-label').innerHTML = `${this.lives} lives `

            if (dif_index === 4) { // only for testing
                hints = 80;
                this.lives = 100;
            } 
            

        } else {
            this.lives = 6;
        }
    
        const attempts = 5;
    
        for (let attempt = 0; attempt < attempts; attempt++) {
            this.generate_full_board();
            this.solution = JSON.parse(JSON.stringify(this.sudoku));
    
            const cells = this.shuffle(
                Array.from({ length: 9 }, (_, x) =>
                    Array.from({ length: 9 }, (_, y) => [x, y])
                ).flat()
            );
    
            let filledCells = 81;
    
            for (const [row, col] of cells) {
                if (filledCells <= hints) {
                    break;
                }
                const backup = this.sudoku[row][col];
                this.sudoku[row][col] = " ";
    
                if (!this.has_unique_solution()) {
                    this.sudoku[row][col] = backup;
                } else {
                    filledCells--;
                }
            }
    
            if (filledCells <= hints) {
                break;
            } else {
                console.log("Could not reach the target hints; generated closest possible.");
            }
        }
    
        this.statuses = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ['WHITE', 'BLACK']));
        return this.sudoku;
    }
    

    generateSudoku2() {
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


    clear_colors_and_notes() {
        this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']));
        this.notes_map = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => false));
        this.number_color = Array.from({ length: 9}, () => Array.from({ length: 9}, () => [this.colors.BLACK, this.colors.WHITE]));
        this.cell_color = Array.from({ length: 9}, () => Array.from({ length: 9}, () => 'clear'));
    }

    setDifficulty(difficulty) {
        if (!['Easy', 'Medium', 'Hard', 'Evil', 'Test'].includes(difficulty)) {
            throw new Error('Invalid difficulty');
        }

        this.difficulty = difficulty

        let emptyCells;
        if (difficulty === 'Easy') {
            emptyCells = 1; // used to be 40
            this.lives = 5;
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
