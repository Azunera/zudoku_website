// saveLoad.js

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
        console.error('Failed to fetch user zudoku')
        return null;
    }
}

async function saveSudoku(sudoku) {
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
}

async function loadSudoku(sudoku) {
    function JSONtoObject(str) {
        str = str.replace(/{{/g, '[[');  
        str = str.replace(/}}/g, ']]');  
        str = str.replace(/{/g, "[");
        str = str.replace(/}/g, "]");
        let numbers = [1,2,3,4,5,6,7,8,9]  
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

    } else {
        console.error("User hasn't saved Sudoku info or user is not logged in.");
    }
}


async function welcomeLogin() {
    try {
    const userInfo = await getUserInfo();
    } catch(e){
        console.log(e)
    }
    
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
}



export { saveSudoku, loadSudoku, getUserInfo, welcomeLogin };
