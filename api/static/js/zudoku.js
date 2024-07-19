import Sudoku from './zudoku_class.js'
import {saveSudoku, loadSudoku, welcomeLogin, getUserInfo} from './saveLoad.js'

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sudoku-canvas');
    const ctx = canvas.getContext('2d');

    
    const cellSize = canvas.width / 9;
    
    let selectedCell = null;
    const title = document.getElementById('title')
    const intro = document.getElementById('intro')
   
    let sudoku = new Sudoku();
    sudoku.generateSudoku();
    sudoku.setDifficulty('Medium');


    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = sudoku.color;


        for (let i = 0; i <= 9; i++) {
            ctx.lineWidth = (i % 3 === 0) ? 2 : 0.5;
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
    }

    function drawNumbers() {
        ctx.font = `${cellSize / 2}px Dancing Script`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#690000';  // This is the DARKER_CORRECT_BLUE color


        // # Cells colors
        // WHITE         = (255, 255, 255)  # White, for clear cells,
        // FOCUS_BLUE    = (173, 216, 230)  # Light Blue, for focused cell
        // CROSS_BLUE    = (240, 248, 255)  # Alice Blue, for highlight
        // RED           = (255, 200, 200)  # R
        
        // # Numbers colors
        // BLACK         = (0,0,0)
        // WRONG_RED     = (255, 99, 71)   # Tomato Red, for wrong nmbers
        // CORRECT_BLUE  = (70, 130, 180)   # Steel Blue, for right numbers
        
        
        // # WIDGETS COLOR
        // WINNING_GREEN = (0, 128, 0) 
        // LOSING_RED    = (128, 0, 0)
    
        // EASY_GREEN    = (193, 255, 193)   #  pastel green
        // MEDIUM_ORANGE = (255, 187, 119)  #  pastel orange
        // HARD_RED      = (191, 97, 97)     #  pastel red 
    
        
        // BACKGROUND    = (211, 211, 211)   # Light_gray
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                ctx.fillStyle = sudoku.number_color[row][col]
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


        selectedCell = { row, col };
    }

    function insert_number(num) {
        if (sudoku.lives >  0) {
            if (selectedCell && num >= "1" && num <= "9") {
                const { row, col } = selectedCell;

                if (sudoku.sudoku[row][col] != sudoku.solution[row][col]) {
                    if (sudoku.sudoku[row][col] == num) {
                        sudoku.sudoku[row][col] = ' ';
                    } else {
                        sudoku.sudoku[row][col] = num;
                    if (!sudoku.check_cell(row, col)) {
                        sudoku.lives -= 1;
                        document.getElementById('lives_label').innerHTML = `${sudoku.lives} lives left`;              
                    }
                }   
                sudoku.findWrongs()
                drawGrid();
                drawNumbers();
            }
        }  
    }


    function handleKeyPress(event) {
        insert_number(event.key);
        }

    canvas.addEventListener('click', handleClick);
    document.addEventListener('keypress', handleKeyPress);

    drawGrid();
    drawNumbers();


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

            drawGrid()
            drawNumbers()
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
                // color = '#fffae3';
                // document.body.getElementById('dropdownButton').innerHTML = 'Daylight'
                hoverColor = '#ddd';
                sudoku.color = '#000'; // Black for daylight
                drawGrid();
                drawNumbers();
                break;
            case '2': // Moonlight
                document.body.classList.add('moonlight');
                color = '#f0e68c';
                color2 = '#ffffff';
                // color2 = '#1a1a2e';  // maybe for background?
                sudoku.color = '#f0e68c'; // Khaki for moonlight
                drawGrid();
                drawNumbers();
                break;
            case '3': // Aquatic
                document.body.classList.add('aquatic');
                color = '#000000';
                sudoku.color = '#000000'; // Teal for aquatic
                drawGrid();
                drawNumbers();
                break;
            case '4': // Twilight
                document.body.classList.add('twilight');
                color = '#ffe4e1';
                sudoku.color = '#ffffff'; // MediumVioletRed for twilight
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

        document.getElementById('dropdownButton').style.color = color2; 

        document.querySelectorAll('.option').forEach(style_option => {
            style_option.style.color = color2;
        })

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
