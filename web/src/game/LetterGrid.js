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
        const letterText = new PIXI.Text(randomLetter, textStyle);
        
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
}