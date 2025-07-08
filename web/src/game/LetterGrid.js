import * as PIXI from 'pixi.js';

export class LetterGrid {
  constructor(rows = 10, cols = 10, cellSize = 60) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.letters = [];
    this.container = new PIXI.Container();
    
    this.generateGrid();
  }

  generateGrid() {
    // Common 3-5 letter words for the game
    const words = [
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD',
      'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS',
      'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO',
      'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'HER',
      'MAKE', 'GOOD', 'LOOK', 'HELP', 'PLAY', 'SMALL', 'GREAT', 'AGAIN', 'TELL', 'WORK',
      'CALL', 'HAND', 'HIGH', 'KEEP', 'LAST', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH',
      'BACK', 'CALL', 'CAME', 'COME', 'EACH', 'FEEL', 'FIND', 'GIVE', 'GOOD', 'KNOW'
    ];
    
    const textStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 24,
      fill: 0x000000,
      align: 'center'
    });

    // Initialize empty grid
    for (let row = 0; row < this.rows; row++) {
      this.letters[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.letters[row][col] = null;
      }
    }

    // Place words randomly on the grid
    for (let row = 0; row < this.rows; row++) {
      let col = 0;
      while (col < this.cols) {
        // Random chance to place a word or leave space
        if (Math.random() < 0.7 && col < this.cols - 2) { // 70% chance to place word
          const word = words[Math.floor(Math.random() * words.length)];
          
          // Check if word fits in remaining space
          if (col + word.length <= this.cols) {
            // Place the word
            for (let i = 0; i < word.length; i++) {
              const letterText = new PIXI.Text({
                text: word[i],
                style: textStyle
              });
              
              letterText.x = (col + i) * this.cellSize + this.cellSize / 2;
              letterText.y = row * this.cellSize + this.cellSize / 2;
              letterText.anchor.set(0.5);
              
              this.letters[row][col + i] = {
                letter: word[i],
                text: letterText
              };
              
              this.container.addChild(letterText);
            }
            col += word.length;
            
            // Add space after word (random 1-2 spaces)
            col += Math.floor(Math.random() * 2) + 1;
          } else {
            // Not enough space for word, skip to next row
            break;
          }
        } else {
          // Leave empty space
          col++;
        }
      }
    }
  }

  getLetterAt(row, col) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return this.letters[row][col];
    }
    return null;
  }

  getContainer() {
    return this.container;
  }

  getGridBounds() {
    return {
      width: this.cols * this.cellSize,
      height: this.rows * this.cellSize
    };
  }

  // Check if a letter is a vowel
  isVowel(letter) {
    return 'AEIOU'.includes(letter);
  }

  // Find the next word start position from current position
  findNextWordStart(currentRow, currentCol) {
    let col = currentCol;
    let row = currentRow;
    
    // Skip current word if we're in one
    if (col < this.cols && this.letters[row][col]) {
      // Move to end of current word
      while (col < this.cols && this.letters[row][col]) {
        col++;
      }
    }
    
    // Skip spaces to find next word
    while (row < this.rows) {
      while (col < this.cols && !this.letters[row][col]) {
        col++;
      }
      
      // If we found a letter, this is the start of next word
      if (col < this.cols && this.letters[row][col]) {
        return { row, col };
      }
      
      // Move to next row
      row++;
      col = 0;
    }
    
    // No more words found
    return null;
  }

  // Find the previous word start position from current position
  findPreviousWordStart(currentRow, currentCol) {
    let col = currentCol;
    let row = currentRow;
    
    // If we're at the start of a word, move back to find previous word
    if (col > 0 && this.letters[row][col] && !this.letters[row][col - 1]) {
      col--;
    }
    
    // Skip current word if we're in the middle of one
    if (col >= 0 && this.letters[row][col]) {
      // Move to start of current word
      while (col > 0 && this.letters[row][col - 1]) {
        col--;
      }
      // Move one more step back to get to space before this word
      if (col > 0) {
        col--;
      } else if (row > 0) {
        // Need to go to previous row
        row--;
        col = this.cols - 1;
      } else {
        // Already at the very beginning
        return { row: 0, col: 0 };
      }
    }
    
    // Skip spaces to find previous word
    while (row >= 0) {
      while (col >= 0 && !this.letters[row][col]) {
        col--;
      }
      
      // If we found a letter, find the start of this word
      if (col >= 0 && this.letters[row][col]) {
        // Move to start of word
        while (col > 0 && this.letters[row][col - 1]) {
          col--;
        }
        return { row, col };
      }
      
      // Move to previous row
      row--;
      col = this.cols - 1;
    }
    
    // No previous word found, go to beginning
    return { row: 0, col: 0 };
  }
}