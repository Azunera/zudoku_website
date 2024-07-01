class Sudoku {
    constructor () {
      this.sudoku = Array.from({length: 9 }, () => Array.fill(' '));
      this.statuses = Array.from({length : 9}, () => Array.fill(['White', 'Black']))
      this.o_sudoku = null
      this.lives = 5
      this.o_sudoku = null
      this.wrongs = []
      this.solution = null

    }

    check () {
        const rows = this.sudoku.map (row => row.join(" "))
        const columns = Array.from( { length: 9 }, (_, i) => this.sudoku.map (row => row[i].join('')))
        const squares = Array.from( { length: 9 }, (_, i) => {
            const rowStart = Math.floor(i / 3) * 3;
            const colStart = (i % 3) * 3;
            return this.sudoku.slice(rowStart, rowStart + 3).flatMap(row => row.slice(colStart, colStart + 3)).join('');
        });
        const board_group = [rows, columns, squares]
        for (element in board_group) {
            for (group in element) {
                for (number in group) {
                    if (number != " ") {
                        if (group.filter(n => n === number).length > 1) {
                            return false
                        }
                    }
                }      
            }
            return true
        }
    }


    check2() {
        // Function to check for duplicates in an array
        const hasDuplicates = array => new Set(array.filter(item => item !== ' ')).size !== array.filter(item => item !== ' ').length;
    
        // Check rows
        for (let row of this.sudoku) {
            if (hasDuplicates(row)) {
                return false;
            }
        }
    
        // Check columns
        for (let colIndex = 0; colIndex < 9; colIndex++) {
            const column = this.sudoku.map(row => row[colIndex]);
            if (hasDuplicates(column)) {
                return false;
            }
        }
    
        // Check squares
        for (let r1 = 0; r1 < 9; r1 += 3) {
            for (let c1 = 0; c1 < 9; c1 += 3) {
                const square = [];
                for (let rDelta = 0; rDelta < 3; rDelta++) {
                    for (let cDelta = 0; cDelta < 3; cDelta++) {
                        square.push(this.sudoku[r1 + rDelta][c1 + cDelta]);
                    }
                }
                if (hasDuplicates(square)) {
                    return false;
                }
            }
        }
    
        // If all checks pass, the sudoku is valid
        return true;
    }
    

    onLifeLost() {
        this.lives -= 1;
        this.emit('lostOneLife', this.lives);

        if (this.lives === 0) {
            this.emit('lostAllLives', 'LOST');
        }
    }

    generate_sudoku() {
        this.sudoku = Array.from({length: 9 }, () => Array.fill(' '));
        let n = 1;
        let r = 1;
        let t = 1;
        const history = [];
        const blacklist = {};

        while (n<10) {
            r++;
            if (r > 8) {
                n++;
                r= 0;
            }
            if (n === 10) break;

            let ii = true;
            let g  = true;

            while (g) {
                let indexes = "0123456789";
                
                if (blacklist[t]) {
                    for (el of blacklist[String(t)]) {
                        for (e in el) {
                            indexes = indexes.replace(e, '');
                        }};
                }

                indexes = indexes.split('').map(Number);
                this.shuffle(indexes);

                for (const i of indexes) {
                    if (this.sudoku[r][i] == '') {
                        this.sudoku[r][i] = String(n);

                        if (this.check()) {
                            g = false;
                            ii = false;
                            break;
                        } else {
                            this.sudoku[r][i] = '';
                        }
                    }
                }

                if (ii) {
            
                    delete blacklist[t];

                    t-= 1;
                    const lastHistory = history.pop();
                    const hisd = lastHistory;
                    this.sudoku[parseInt(history[-1][0])][parseInt(hisd)] = '';
                    
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
            console.log(this.solution)
            this.statuses = Array.from( {length: 9}, () => Array.fill(['White', 'Black']));
            console.log(this.statuses)
        }


        set_difficulty (difficulty) {
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
    }