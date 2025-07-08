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
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const textStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 24,
      fill: 0x000000,
      align: 'center'
    });

    for (let row = 0; row < this.rows; row++) {
      this.letters[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        // Use new PixiJS v8 Text constructor
        const letterText = new PIXI.Text({
          text: randomLetter,
          style: textStyle
        });
        
        letterText.x = col * this.cellSize + this.cellSize / 2;
        letterText.y = row * this.cellSize + this.cellSize / 2;
        letterText.anchor.set(0.5);
        
        this.letters[row][col] = {
          letter: randomLetter,
          text: letterText
        };
        
        this.container.addChild(letterText);
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
    // First, if we're in a word, skip to the end of current word
    let col = currentCol;
    let row = currentRow;
    
    // Skip current word if we're in one
    if (col < this.cols && this.letters[row][col]) {
      const currentIsVowel = this.isVowel(this.letters[row][col].letter);
      while (col < this.cols && this.letters[row][col] && 
             this.isVowel(this.letters[row][col].letter) === currentIsVowel) {
        col++;
      }
    }
    
    // Now find the start of the next word
    while (row < this.rows) {
      while (col < this.cols) {
        if (this.letters[row][col]) {
          // Found a letter, this is the start of next word
          return { row, col };
        }
        col++;
      }
      // Move to next row
      row++;
      col = 0;
    }
    
    // No more words found
    return null;
  }
}