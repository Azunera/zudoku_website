# REMOVE SIGNAL AND INSTEAD YK

from random import shuffle, sample
from copy import deepcopy
from enum import Enum
from PySide6.QtCore import QObject, Signal
from SudokuEnums import SkColor, Game_Statuses

class Sudoku(QObject):
    lost_one_life   = Signal(int)
    lost_all_lives  = Signal(Enum)
    sudoku_completed = Signal(Enum) 
    
    def __init__(self, parent):
        super().__init__(parent)
        self.parent = parent
        self.sudoku = [[" " for _ in range(9)] for _ in range(9)]
        self.statuses = [[[SkColor.WHITE, SkColor.BLACK] for _ in range(9)] for _ in range(9)]  # Grid to store cell statuses
        self.o_sudoku = None
        self.difficulty = None 
        self.wrongs = []
        self.solution = None
        self.lives = 5
        

    def check(self):
        """
        Checks the validity of the Sudoku board.

        Returns:
            bool: True if the board is valid, False otherwise.
        """
        rows = ["".join(row) for row in self.sudoku]
        columns = ["".join(column) for column in zip(*self.sudoku)]
        squares = ["".join(self.sudoku[r][e] for r in range(r1,r1+3) for e in range(e1,e1+3)) for r1 in range(0,9,3) for e1 in range(0,9,3)]
        our_board= [rows,columns,squares]
        for element in our_board:
            for group in element:
                for number in group:
                    if number != " ":
                        if group.count(number) > 1:
                            return False
        return True

    def on_life_lost(self):
        self.lives -= 1
        self.lost_one_life.emit(self.lives)

        if self.lives == 0:
            self.lost_all_lives.emit(Game_Statuses.LOST)   

    def generate_sudoku(self):
        """
        Generate a complete nnew random Sudoku board from zero, 

        Updates:
            self.sudoku = A new generated sudoku (prepared to be adjusted according difficulty)
            self.solution = A new generated sudoku
            self.statuses = Resets them to standard status
        """
        self.sudoku = [[" " for _ in range(9)] for _ in range(9)]
        hisd= ""
        n= 1
        r= -1
        t=1
        history=[]
        blacklist={}
        while n<10:
            r += 1
            if r >8:
                n += 1
                r = 0
            ii = True
            g = True
            if n==10: 
                break
        
            while g:
                # print("Current state of the self.sudoku:")
                # printsudoku()e
                # print("Trying to fill number", n, "at row", r)
                indexes= "012345678"
                try:
                    for el in blacklist[str(t)]:
                        for e in el:

                            indexes= indexes.replace(e,"")
                except:
                        pass
                        
                indexes= [int(e) for e in indexes]
                shuffle(indexes)
                for i in indexes:
                    if self.sudoku[r][i] == " ":
                        self.sudoku[r][i] = str(n)
                        # print("Attempting to fill cell (", r, ",", i, ") with number", n)
                        if self.check():
                            # print("Valid configuration so far:")
                            # printsudoku()
                            g = False
                            ii = False
                            break
                        else:
                            # print("Invalid configuration. Clearing cell (", r, ",", i, ")")
                            self.sudoku[r][i] = " "

                if ii:
                    # retracing, 
                    try:
                        del blacklist[str(t)]
                    except:
                        pass
                    t-= 1
                    hisd= history[-1][2]
                    self.sudoku[int(history[-1][0])][int(hisd)] = " "
                    try:
                        if hisd not in blacklist[str(t)]:
                            blacklist[str(t)] += (hisd,)
                    except:
                        blacklist[str(t)] = (hisd,)                   
                    del history[-1]
                
                    r -= 1
                    if r < 0:
                        r = 8
                        n -= 1
                    
                else:
                    history.append(f'{r}:{i}:{t}')
                    t+=1     
                    
        self.solution = deepcopy(self.sudoku)
        self.statuses = [[[SkColor.WHITE, SkColor.BLACK] for _ in range(9)] for _ in range(9)] 
        
    def set_difficulty(self, difficulty):
        """
        Set the difficulty of the Sudoku puzzle by removing a certain number of cells.

        Args:
            difficulty (str): The difficulty level ('Easy', 'Medium', 'Hard').

        Returns:
            list: A 2D list representing the Sudoku board with empty cells based on difficulty.

        Raises:
            Exception: If an invalid difficulty level is provided.
        """
        if difficulty.capitalize() not in ("Easy", "Medium", "Hard", "Test"):
            raise Exception("Invalid difficulty")

        if difficulty == 'Easy':
            empty_cells = 40
            self.lives = 15
        elif difficulty == 'Medium':
            empty_cells = 50
            self.lives = 10
        else:  # 'Hard'
            empty_cells = 60
            self.lives = 5
            
        if difficulty == "Test":
            empty_cells = 1
            self.lives = 100
            
        selected_positions = set() 

        cells_with_numbers = [(row, col) for row in range(9) for col in range(9) if self.sudoku[row][col] != " "]

        while len(selected_positions) < empty_cells:
            row, col = sample(cells_with_numbers, 1)[0]

            if (row, col) not in selected_positions:
                selected_positions.add((row, col))
                self.sudoku[row][col] = " "
            
        return self.sudoku

    def set_number(self, x, y, number):
        print(self.sudoku)
        """
        Set a number in the Sudoku board at the given position if the number isn't the correct one.

        Args:
            number (str): The number to set in the board.
            x (int): The row index.
            y (int): The column index.
        """
        if self.sudoku[x][y] != self.solution[x][y]:

            if self.sudoku[x][y] == number:
                self.sudoku[x][y] = " "
                self.statuses[x][y] = [SkColor.WHITE, SkColor.BLACK]
            else: 
                self.sudoku[x][y] = number
   
    def update_statuses(self, x, y, number):
        """
        Finds coordinates of conflicting numbers on the Sudoku board.

        Args:
            number (str): The number to check.
            x (int): The row index.
            y (int): The column index.
        """
        def convertor(x, y):
            return (x // 3) * 3 + y // 3, (x % 3) * 3 + y % 3

        rows = ["".join(row) for row in self.sudoku]
        columns = ["".join(column) for column in zip(*self.sudoku)]
        squares = ["".join(self.sudoku[r][e] for r in range(r1, r1 + 3) for e in range(e1, e1 + 3)) for r1 in range(0, 9, 3) for e1 in range(0, 9, 3)]
        our_board = [rows, columns, squares]

        wrong_cords = set()
        for group in our_board:
            for x in range(9):
                counter = {}
                safety_pin = True
                for y in range(9):
                    if group == columns:
                        actual_x, actual_y = y, x
                    elif group == squares:
                        actual_x, actual_y = convertor(x, y)
                    else:
                        actual_x, actual_y = x, y

                    if group[x][y] != " ":
                        if group[x][y] not in counter:
                            counter[group[x][y]] = (actual_x, actual_y)
                        else:
                            if safety_pin:
                                wrong_cords.add(counter[group[x][y]])
                                wrong_cords.add((actual_x, actual_y))
                                safety_pin = False
                            else:
                                wrong_cords.add((actual_x, actual_y))
                                
                               
        for x in range(9):
            for y in range(9):
                self.statuses[x][y][0] = SkColor.WHITE      
        # Updates the current grid colors data in logic 
             
        for nums in wrong_cords:
            self.statuses[nums[0]][nums[1]][0] = SkColor.RED
            


    def is_number_correct(self, x, y, number):
        """
        Check if the number at position (x, y) is the correct number.

        Args:
            x (int): The row index.
            y (int): The column index.
            number (str): The number to check.

        Returns:
            bool: True if the number is correct, False otherwise.
        """
        
        return self.solution[x][y] == number
      

    def check_win(self):
        """
        Checks if the current Sudoku board matches the complete Sudoku solution.

        Returns:
            bool: True if the board matches the solution, False otherwise.
        """
        for x in range(9):
            for y in range(9):
                if self.sudoku[x][y] != self.solution[x][y]:
                    return False
                
        self.sudoku_completed.emit(Game_Statuses.COMPLETED)
        return True
    def print_sudoku(self):
        """Prints the current state of the board"""
        print(f'''
     1   2   3   4   5   6   7   8   9 
   \033[1m+---+---+---+---+---+---+---+---+---+\033[0m
A  \033[1m|\033[0m {self.sudoku[0][0]} | {self.sudoku[0][1]} | {self.sudoku[0][2]} \033[1m|\033[0m {self.sudoku[0][3]} | {self.sudoku[0][4]} | {self.sudoku[0][5]} \033[1m|\033[0m {self.sudoku[0][6]} | {self.sudoku[0][7]} | {self.sudoku[0][8]} \033[1m|\033[0m
   \033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---+\033[0m
B  \033[1m|\033[0m {self.sudoku[1][0]} | {self.sudoku[1][1]} | {self.sudoku[1][2]} \033[1m|\033[0m {self.sudoku[1][3]} | {self.sudoku[1][4]} | {self.sudoku[1][5]} \033[1m|\033[0m {self.sudoku[1][6]} | {self.sudoku[1][7]} | {self.sudoku[1][8]} \033[1m|\033[0m
   \033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---+\033[0m
C  \033[1m|\033[0m {self.sudoku[2][0]} | {self.sudoku[2][1]} | {self.sudoku[2][2]} \033[1m|\033[0m {self.sudoku[2][3]} | {self.sudoku[2][4]} | {self.sudoku[2][5]} \033[1m|\033[0m {self.sudoku[2][6]} | {self.sudoku[2][7]} | {self.sudoku[2][8]} \033[1m|\033[0m
   \033[1m+---+---+---+---+---+---+---+---+---+\033[0m
D  \033[1m|\033[0m {self.sudoku[3][0]} | {self.sudoku[3][1]} | {self.sudoku[3][2]} \033[1m|\033[0m {self.sudoku[3][3]} | {self.sudoku[3][4]} | {self.sudoku[3][5]} \033[1m|\033[0m {self.sudoku[3][6]} | {self.sudoku[3][7]} | {self.sudoku[3][8]} \033[1m|\033[0m
   \033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---+\033[0m
E  \033[1m|\033[0m {self.sudoku[4][0]} | {self.sudoku[4][1]} | {self.sudoku[4][2]} \033[1m|\033[0m {self.sudoku[4][3]} | {self.sudoku[4][4]} | {self.sudoku[4][5]} \033[1m|\033[0m {self.sudoku[4][6]} | {self.sudoku[4][7]} | {self.sudoku[4][8]} \033[1m|\033[0m
   \033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---+\033[0m
F  \033[1m|\033[0m {self.sudoku[5][0]} | {self.sudoku[5][1]} | {self.sudoku[5][2]} \033[1m|\033[0m {self.sudoku[5][3]} | {self.sudoku[5][4]} | {self.sudoku[5][5]} \033[1m|\033[0m {self.sudoku[5][6]} | {self.sudoku[5][7]} | {self.sudoku[5][8]} \033[1m|\033[0m
   \033[1m+---+---+---+---+---+---+---+---+---+\033[0m
G  \033[1m|\033[0m {self.sudoku[6][0]} | {self.sudoku[6][1]} | {self.sudoku[6][2]} \033[1m|\033[0m {self.sudoku[6][3]} | {self.sudoku[6][4]} | {self.sudoku[6][5]} \033[1m|\033[0m {self.sudoku[6][6]} | {self.sudoku[6][7]} | {self.sudoku[6][8]} \033[1m|\033[0m
   \033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---+\033[0m
H  \033[1m|\033[0m {self.sudoku[7][0]} | {self.sudoku[7][1]} | {self.sudoku[7][2]} \033[1m|\033[0m {self.sudoku[7][3]} | {self.sudoku[7][4]} | {self.sudoku[7][5]} \033[1m|\033[0m {self.sudoku[7][6]} | {self.sudoku[7][7]} | {self.sudoku[7][8]} \033[1m|\033[0m
   \033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---\033[1m+\033[0m---+---+---+\033[0m
I  \033[1m|\033[0m {self.sudoku[8][0]} | {self.sudoku[8][1]} | {self.sudoku[8][2]} \033[1m|\033[0m {self.sudoku[8][3]} | {self.sudoku[8][4]} | {self.sudoku[8][5]} \033[1m|\033[0m {self.sudoku[8][6]} | {self.sudoku[8][7]} | {self.sudoku[8][8]} \033[1m|\033[0m
   \033[1m+---+---+---+---+---+---+---+---+---+\033[0m ''')
    
        
# if __name__ == "__main__":
    
#     sudoku = Sudoku()
#     sudoku.generate_sudoku()
#     sudoku.print_sudoku()


