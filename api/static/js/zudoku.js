import Sudoku from './zudoku_class.js'
import {saveSudoku, loadSudoku, welcomeLogin, getUserInfo} from './saveLoad.js'

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sudoku-canvas');
    const ratio = window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    const current_hour = new Date().getHours()
    console.log(current_hour)
    const screenWidth = screen.width
    

    // Logic for adjusts in canvas-resolution and moving html elementsd for mobile adaptation
    const lives_label = document.getElementById('lives-label');
    const mobile_row = document.getElementById('mobile-row1');
    const save = document.getElementById('save');
    const load = document.getElementById('load');
    const notes = document.getElementById('notes')

    if (screenWidth < 620) {
        canvas.width = screenWidth * 0.9, canvas.height = screenWidth * 0.9
        
        canvas.width  *=  ratio;
        canvas.height *=  ratio;

        canvas.style.width = screenWidth * 0.9 + "px";
        canvas.style.height = screenWidth * 0.9 + "px";

        mobile_row.appendChild(lives_label);
        mobile_row.appendChild(save);
        mobile_row.appendChild(load);
        mobile_row.appendChild(notes);

        document.querySelectorAll('.pc-only').forEach(onlypc => {
            onlypc.style.display = 'none';
        });

    } else {
            
        canvas.width  *=  ratio;
        canvas.height *=  ratio;

        canvas.style.width = 450 + "px";
        canvas.style.height = 450 + "px";
    }

    canvas.getContext("2d").scale(ratio, ratio);
    const cellSize = canvas.width / 9 / ratio;

    let numbers_style = 'dark'; 
    let selectedCell = null;
    let notes_mode = false;
    let sudoku = new Sudoku();

    sudoku.generateSudoku();
    sudoku.setDifficulty('Medium');
    
    function openNav() {
        document.getElementById('mySidebar').style.width = '200px';
    }

    function closeNav() {
        document.getElementById('mySidebar').style.width = '0';
    }

    window.openNav = openNav;
    window.closeNav = closeNav;

    console.log(current_hour)
    if (current_hour >= 6 && current_hour <= 18) { 
        setTheme('1')
    } else {
        setTheme('2')
    }
    
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (numbers_style == 'dark') { 
            ctx.fillStyle = sudoku.number_color[0][0][0];
        } 
        else if (numbers_style == 'light') {
            ctx.fillStyle = sudoku.number_color[1][1][1];
        }


        for (let i = 0; i <= 9; i++) {
            ctx.lineWidth = (i % 3 === 0) ? 2 : 0.5;
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height * 1.1);
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width *1.1, i * cellSize);
            ctx.stroke();
        }
        // highlightingSelectedCell()
    }

    function drawNumbers() {
        ctx.font = `${cellSize / 2}px Dancing Script`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let selected_row, selected_col; 

        if (selectedCell) {
            selected_row = selectedCell.row; // Access row directly
            selected_col = selectedCell.col; // Access col directly
        }

        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (sudoku.cell_color[row][col] == "wrong" ) {
                    highlightCell(row,col)
                }

                if (selected_row == row && selected_col == col) {
                    highlightingSelectedCell()
                }
                
                ctx.fillStyle == sudoku.color;

                // Deciding the color of the numbers
                if (numbers_style == 'dark') { 
                    ctx.fillStyle = sudoku.number_color[row][col][0];
                } 
                else if (numbers_style == 'light') {
                    ctx.fillStyle = sudoku.number_color[row][col][1];
                }

                const num = sudoku.sudoku[row][col];

                const x = col * cellSize + cellSize / 2;
                const y = row * cellSize + cellSize / 2;

                // VERY IMPORTANT LOGIC ORDER!, should be kept in this form to avoid issues)

                if (sudoku.notes_map[row][col]) {
                    ctx.font = `${cellSize / 4}px Dancing Script`;
                    drawNotes(ctx, sudoku.notes[row][col], x, y, cellSize);
                    ctx.font = `${cellSize / 2}px Dancing Script`;
                } else if (num != ' ' ) {
                    ctx.fillText(num, x, y);
                } 
            
                }
            }
        }

    function drawNotes(ctx, num, x, y, cellSize) {
        const positions = [
            [-cellSize / 3 + 1, -cellSize / 3 + 1], [0, -cellSize / 3 + 1], [cellSize / 3 - 1, -cellSize / 3 + 1],
            [-cellSize / 3 + 1, 0], [0, 0], [cellSize / 3, 0],
            [-cellSize / 3 + 1, cellSize / 3  - 1], [0, cellSize / 3  - 1], [cellSize / 3 - 1, cellSize / 3  - 1]
        ];
    
        for (let i = 0; i < 9; i++) {
            const [dx, dy] = positions[i];
            const note = num[i] || ' '; // Using an empty string if the note is missing
            ctx.fillText(note, x + dx, y + dy);
        }
    }


    function OldhighlightSelectedCell() { 
        if (selectedCell) {
            const { row, col } = selectedCell;
            const x = col * cellSize + 2.5;
            const y = row * cellSize + 2.5;
            const size = cellSize - 5;

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1; 
            ctx.beginPath();
            ctx.rect(x, y, size, size);
            ctx.stroke();
        }
    }


    function highlightingSelectedCell() { 
        if (selectedCell) {
            const { row, col } = selectedCell;

            if (sudoku.sudoku[row][col] == sudoku.solution[row][col]) {
                return
            }
            
            const x = col * cellSize + 1;
            const y = row * cellSize + 1;
            const size = cellSize - 2;

            ctx.save();
            ctx.shadowBlur = 20; 
            ctx.shadowColor = 'rgba(173, 216, 230, 1)'; 

            ctx.shadowOffsetX = 0; 
            ctx.shadowOffsetY = 0; 
    
            ctx.fillStyle = 'rgba(173, 216, 230, 0.5)';  

            if (numbers_style == 'light') {
                ctx.shadowColor = 'rgba(138, 173, 184, 1)';
                ctx.fillStyle = 'rgba(138, 173, 184, 0.5)';
            }

            ctx.fillRect(x, y, size, size);
    
            // Reseting shadow settings
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            ctx.restore();
        }
    }

    function highlightCell(row, col) { 
        // console.log(selectedCell)
        if (selectedCell) {
            const { row:selected_row, col:selected_col } = selectedCell;
            if (row == selected_row && col == selected_col && !sudoku.check_cell(row, col)) { 
                return  // logic to make sure the focused cell doesn't get painted
            }
        }

        const x = col * cellSize + 1;
        const y = row * cellSize + 1;
        const size = cellSize - 2;

        ctx.save();
        // Apply shadow properties for highlighting
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 102, 102, 0.6)';

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    
        ctx.fillStyle = 'rgba(255, 102, 102, 0.3)';
        // if (numbers_style == 'light') {
        //     ctx.shadowColor = 'rgba(204, 82, 82, 0.3)';
        // }
        ctx.fillRect(x, y, size, size);
    
        // Restore the context state to remove shadow properties
        ctx.restore();
    }

    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        // Checking if the clicked cell is the same as the currently selected cell
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
            selectedCell = null;
        } else {
            selectedCell = { row, col };
        }

        drawGrid(); 
        drawNumbers(); 
    }

    function insert_number(num) {
        if (sudoku.lives <=  0) 
            return
        if (selectedCell && num < "1" && num > "9") 
            return 

        const { row, col } = selectedCell;

        if (!notes_mode) {
            sudoku.switchNote(row,col, true, false);
            sudoku.resetNote(row,col);

            if (sudoku.sudoku[row][col] != sudoku.solution[row][col]) {
                if (sudoku.sudoku[row][col] == num) {
                    sudoku.sudoku[row][col] = ' ';
                } else {
                    sudoku.sudoku[row][col] = num;
                if (!sudoku.check_cell(row, col)) {
                    sudoku.lives -= 1;
                    sudoku.number_color[row][col] = [sudoku.colors.WRONG_RED, sudoku.colors.WRONG_RED];
                    document.getElementById('lives-label').innerHTML = `${sudoku.lives} lives`;  // used to be lives left          
                } else {
                    sudoku.number_color[row][col] = [sudoku.colors.DARK_CORRECT_BLUE, sudoku.colors.LIGHT_CORRECT_BLUE];
                }
                }    
            }
        } else { // notes mode
            
            sudoku.switchNote(row,col, false, true)

            sudoku.sudoku[row][col] = ' ';
        
            if (sudoku.notes[row][col][num-1] == num) {
                sudoku.notes[row][col][num-1] = ' ';
            } else {
                sudoku.notes[row][col][num-1] = num;
            }
            
            
        }
        sudoku.findWrongs()
        drawGrid();
        drawNumbers();  
        }
        

    function handleKeyPress(event) {
        insert_number(event.key);
        }

    canvas.addEventListener('click', handleClick);
    document.addEventListener('keypress', handleKeyPress);

    drawGrid();
    drawNumbers();
    
    document.getElementById('notes').addEventListener('click', () => {
        notes_mode = !notes_mode
    });

    // SAVING AND LOADING SYSTEM
    document.getElementById('save').addEventListener('click', () => {
        saveSudoku(sudoku);
    });

    document.getElementById('load').addEventListener('click', async () => {
        await loadSudoku(sudoku);
        drawGrid();
        drawNumbers();
    });

    // SETTING DIFFICULTIES
    document.querySelectorAll('.difficulty_button').forEach(button => {
        button.addEventListener('click', (event) => {
            sudoku.generateSudoku();
            sudoku.setDifficulty(event.target.textContent);
            sudoku.findWrongs();
            sudoku.clear_colors_and_notes()
            selectedCell = null;

    
            drawGrid();
            drawNumbers();
        })
    })

    // NUMBERS BESIDES SCREEN
    let number_buttons = document.getElementsByClassName('number_button')


    for (let i = 0; i < number_buttons.length; i++)
        number_buttons[i].addEventListener('click', (event) => {
        insert_number(event.target.textContent)
       
    })
    
    // CHECKPOINT 1: STYLE GROUP
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownContent = document.getElementById('dropdownContent');
    const options = document.querySelectorAll('.option');

    
    dropdownButton.addEventListener('click', () => { 
        dropdownContent.style.display = 'block';
    }); // Clicking on the dropdowButton activates it

    options.forEach(option => {
        option.addEventListener('click', (event) => {
            const value = option.getAttribute('data-value');
            setTheme(value);
            dropdownButton.innerHTML = event.target.textContent;
            dropdownContent.classList.remove('show');
            dropdownContent.style.display = 'none';
        }); // Adds functionaly for each style
    });

    window.addEventListener('click', (e) => {
        if (!dropdownButton.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.style.display = 'none';
        }
    }); // The styles list dissappears if clicking outside


 
    function setTheme(value) {
        document.body.className = '';
        let color = '';
        let color2 = '';
        let hoverColor = '';
        switch (value) {
            case '1': // Daylight
                document.body.classList.add('daylight');
                color = '#000000';
                color2 = '#000000';
                numbers_style = 'dark'
                drawGrid();
                drawNumbers();
                break;
            case '2': // Moonlight
                document.body.classList.add('moonlight');
                color = '#f0e68c';
                color2 = '#ffffff';
                sudoku.color = '#f0e68c'; 
                numbers_style = 'light';

                drawGrid();
                drawNumbers();
                break;
            case '3': // Aquatic
                document.body.classList.add('aquatic');
                color = '#000000';
                sudoku.color = '#000000';
                numbers_style = 'dark';

                drawGrid();
                drawNumbers();
                break;
            case '4': // Twilight
                document.body.classList.add('twilight');
                color = '#ffe4e1';
                
                sudoku.color = '#ffffff'; 
                numbers_style = 'light';
                drawGrid();
                drawNumbers();
                break;
        }

        //UPDATING ELEMENTS BY COLOR
        document.querySelectorAll('p').forEach(p => {
            p.style.color = color;
        });
        
        document.querySelector('h1').style.color = color;

        document.querySelector('label').style.color = color2;

        // document.getElementById('dropdownButton').style.color = color2; 

        // document.querySelectorAll('.option').forEach(style_option => {
        //     style_option.style.color = color2;
        // })

        document.querySelectorAll('.number_button').forEach(button => {
            button.style.color = color2;

        });
        

        document.querySelectorAll('.bottom_buttons').forEach(button => {
            button.style.color = color2;

        });

        document.querySelectorAll('.difficulty_button').forEach(button => {
            button.style.color = color2;

        });
    }
    
    welcomeLogin()
    
});