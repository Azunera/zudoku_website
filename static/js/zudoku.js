import Sudoku from './zudoku_class.js'

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
        ctx.fillStyle = sudoku.color


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


        selectedCell = { row, col };
    }


    function insert_number(num) {
        if (sudoku.lives >  0) {
            if (selectedCell && num >= "1" && num <= "9") {
                const { row, col } = selectedCell;


                if (sudoku.sudoku[row][col] == num) {
                    sudoku.sudoku[row][col] = ' ';
                } else {
                    sudoku.sudoku[row][col] = num;
                    if (!sudoku.check_cell(row, col)) {
                        sudoku.lives -= 1;
                        document.getElementById('lives_label').innerHTML = `${sudoku.lives} lives left`;              
                    }
                }
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

    function color_changer(back_color, main_color) {}
       
    document.getElementById('easy-button').addEventListener('click', () => {

        document.body.style.backgroundColor = 'white';
        intro.style.color = 'black';
        title.style.color = 'black';
        sudoku.color = 'black';

        sudoku.generateSudoku();
        sudoku.setDifficulty('Easy');
       
        drawGrid();
        drawNumbers();
        title.style.color = 'lightblue';
    });


    document.getElementById('medium-button').addEventListener('click', () => {      
        document.body.style.backgroundColor = '#f0f0f0';
        intro.style.color = '#c71585';
        title.style.color = '#c71585';
        sudoku.color = '#c71585'

        sudoku.generateSudoku();
        sudoku.setDifficulty('Medium');
        drawGrid();
        drawNumbers();
    });

    document.getElementById('hard-button').addEventListener('click', () => {
        document.body.style.backgroundColor = 'black';
        intro.style.color = '#eee8aa';
        title.style.color = '#eee8aa';
        sudoku.color = '#eee8aa'
   
        sudoku.generateSudoku();
        sudoku.setDifficulty('Hard');
        drawGrid();
        drawNumbers();
    });


    // SYSTEM FOR SAVING AND LOADING

    async function getUserInfo() {
        const response = await fetch('/get_user_info', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
       
        if (response.ok) {
            const userInfo = await response.json();
            return userInfo;
        } else {
            console.error('Failed to fetch user info');
            return null;
        }
    }


    async function getUserSudoku() {
        const response = await fetch('/load', {
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
            }
        });


        if (response.ok) {
            const userInfo = await response.json();
            return userInfo;
        } else {
            console.error('Failed to fetch user zudoku')
            return null;
        }
   
    }
    //side stuff
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
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            setTheme(value);
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
            case '2': // Candlelight
                document.body.classList.add('candlelight');
                color = '#fff5e1';
                hoverColor = '#e0c3a1';
                sudoku.color = '#8b4513'; // SaddleBrown for candlelight
                drawGrid();
                drawNumbers();
                break;
            case '3': // Moonlight
                document.body.classList.add('moonlight');
                // color = '#1a1a2e';
                color = '#f0e68c'
                hoverColor = '#3a3a5e';
                sudoku.color = '#f0e68c'; // Khaki for moonlight
                drawGrid();
                drawNumbers();
                break;
            case '4': // Aquatic
                document.body.classList.add('aquatic');
                color = '#e0f7fa';
                hoverColor = '#b2ebf2';
                sudoku.color = '#00796b'; // Teal for aquatic
                drawGrid();
                drawNumbers();
                break;
            case '5': // Twilight
                document.body.classList.add('twilight');
                color = '#ffe4e1';
                hoverColor = '#ffb6c1';
                sudoku.color = '#c71585'; // MediumVioletRed for twilight
                drawGrid();
                drawNumbers();
                break;
        }

        // Update elements color
        console.log(color)
        // document.querySelector('p').style.color = color;
        document.querySelectorAll('p').forEach(p => {
            p.style.color = color;
        });
        document.querySelector('h1').style.color = color;


        document.querySelectorAll('.number_button').forEach(button => {
            // button.style.backgroundColor = color;
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = hoverColor;
            });
            button.addEventListener('mouseout', () => {
                // button.style.backgroundColor = color;
            });
        });

        document.querySelectorAll('.bottom_buttons').forEach(button => {
            button.style.backgroundColor = 'transparent';
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = hoverColor;
            });
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'transparent';
            });
        });
    }

    //bottoms buttons
    document.getElementById('save').addEventListener('click', async () => {
        const userInfo = await getUserInfo();

        if (userInfo) {
            let data = JSON.stringify({
                sudoku: sudoku.sudoku,
                difficulty: sudoku.difficulty,
                status: sudoku.statuses,
                solution: sudoku.solution,
                lives: sudoku.lives,
                user_id: userInfo.id
            });

            fetch("/save", {
                method: "POST",
                body: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        } else {
            console.error('User info not available');
        }
    });
   
    document.getElementById('load').addEventListener('click', async () => {

        function JSONtoObject(str) {
            str = str.replace(/{{/g, '[[');  
            str = str.replace(/}}/g, ']]');  
            str = str.replace(/{/g, "[");
            str = str.replace(/}/g, "]");
            numbers = [1,2,3,4,5,6,7,8,9]  
            numbers.forEach(number => {
                let regex = new RegExp(number, 'g');
                str = str.replace(regex, `"${number}"`);
            })
            return JSON.parse(str);  
        }
   
        const userZudoku = await getUserSudoku();
        if (userZudoku) {
            sudoku.sudoku = JSONtoObject(userZudoku.zudoku.sudoku);
            sudoku.difficulty = userZudoku.zudoku.difficulty;
            // sudoku.statuses = JSONtoObject(userZudoku.zudoku.status);
            sudoku.solution = JSONtoObject(userZudoku.zudoku.solution);
            sudoku.lives = userZudoku.zudoku.lives;
            drawGrid();
            drawNumbers();
        } else {
            console.error("User hasn't saved Sudoku info or user is not logged in.");
        }
    });

async function getUserInfo() {
    const response = await fetch('/get_user_info', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
   
    if (response.ok) {
        const userInfo = await response.json();
        return userInfo;
    } else {
        console.error('Failed to fetch user info');
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('what?')
    const userInfo = await getUserInfo();

    if (userInfo) {
        const welcome = document.getElementById('welcome');
        const register = document.getElementById('register');
        const login = document.getElementById('login');
        console.log('HEY')
        document.getElementById('welcome-message').innerHTML =  `Bienvenido ${userInfo.username}!`;
        welcome.hidden = false;
        register.hidden = true;
        login.hidden = true;
    }
})
});

