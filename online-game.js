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