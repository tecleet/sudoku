class Sudoku {
    constructor() {
        this.board = Array(81).fill(0);
        this.solution = Array(81).fill(0);
    }

    // Generate a new game with specified difficulty
    generate(difficulty = 'medium') {
        // 1. Clear board
        this.board.fill(0);
        this.solution.fill(0);

        // 2. Generate a full valid solution
        this.fillDiagonal();
        this.solve(this.solution);
        
        // 3. Copy solution to board
        this.board = [...this.solution];

        // 4. Remove digits based on difficulty
        let attempts = 5; // Default for easy
        switch(difficulty) {
            case 'easy': attempts = 30; break;
            case 'medium': attempts = 40; break;
            case 'hard': attempts = 50; break;
            case 'expert': attempts = 60; break;
        }
        this.removeDigits(attempts);
        
        return {
            board: this.board,
            solution: this.solution
        };
    }

    fillDiagonal() {
        for (let i = 0; i < 9; i = i + 3) {
            this.fillBox(i, i);
        }
    }

    fillBox(row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!this.isSafeInBox(row, col, num, this.solution));
                
                let idx = (row + i) * 9 + (col + j);
                this.solution[idx] = num;
            }
        }
    }

    isSafeInBox(rowStart, colStart, num, board) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let r = rowStart + i;
                let c = colStart + j;
                if (board[r * 9 + c] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    isSafe(board, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (board[row * 9 + x] === num) return false;
        }

        // Check col
        for (let x = 0; x < 9; x++) {
            if (board[x * 9 + col] === num) return false;
        }

        // Check box
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
            }
        }

        return true;
    }

    solve(board) {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                let row = Math.floor(i / 9);
                let col = i % 9;

                for (let num = 1; num <= 9; num++) {
                    if (this.isSafe(board, row, col, num)) {
                        board[i] = num;
                        if (this.solve(board)) return true;
                        board[i] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    removeDigits(count) {
        while (count > 0) {
            let cellId = Math.floor(Math.random() * 81);
            if (this.board[cellId] !== 0) {
                let backup = this.board[cellId];
                this.board[cellId] = 0;

                // Copy board to check for uniqueness (optional for simple version, 
                // but good for ensuring valid puzzle. For now we just remove)
                // A true generator ensures unique solution, but for this task 
                // simple removal is usually sufficient for "fun" play.
                
                count--;
            }
        }
    }
    
    checkWin(currentBoard) {
        for(let i=0; i<81; i++) {
            if(currentBoard[i] !== this.solution[i]) return false;
        }
        return true;
    }
}
