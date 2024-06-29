
class Sudoku {
    constructor() {
        this.sudoku = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => " "));
        this.o_sudoku = null;
        this.difficulty = null;
        this.wrongs = [];
        this.solution = null;
        this.lives = 5;
    }
}