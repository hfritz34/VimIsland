import * as PIXI from 'pixi.js';

export class Player {
  constructor(gridRow = 5, gridCol = 5, cellSize = 60) {
    this.gridRow = gridRow;
    this.gridCol = gridCol;
    this.cellSize = cellSize;
    this.container = new PIXI.Container();
    
    this.createCursor();
  }

  createCursor() {
    // Create a vertical cursor like in vim (thin vertical line)
    const cursor = new PIXI.Graphics();
    cursor.beginFill(0xFF0000);
    cursor.drawRect(0, 0, 3, this.cellSize - 10);
    cursor.endFill();
    
    // Create highlight box for better visibility
    const highlight = new PIXI.Graphics();
    highlight.lineStyle(2, 0xFF0000, 0.3);
    highlight.beginFill(0xFF0000, 0.1);
    highlight.drawRect(-this.cellSize/2 + 5, -this.cellSize/2 + 5, this.cellSize - 10, this.cellSize - 10);
    highlight.endFill();
    
    this.cursor = cursor;
    this.highlight = highlight;
    
    this.container.addChild(highlight);
    this.container.addChild(cursor);
    
    // Position cursor to the left side of the character
    cursor.x = -this.cellSize/2 + 5;
    cursor.y = -this.cellSize/2 + 5;
    
    // Start blinking animation
    this.startBlinking();
  }

  startBlinking() {
    let blinkCounter = 0;
    setInterval(() => {
      blinkCounter++;
      this.cursor.visible = blinkCounter % 2 === 0;
    }, 500);
  }

  updatePosition() {
    this.container.x = this.gridCol * this.cellSize + this.cellSize / 2;
    this.container.y = this.gridRow * this.cellSize + this.cellSize / 2;
  }

  moveUp() {
    if (this.gridRow > 0) {
      this.gridRow--;
      this.updatePosition();
    }
  }

  moveDown(maxRows) {
    if (this.gridRow < maxRows - 1) {
      this.gridRow++;
      this.updatePosition();
    }
  }

  moveLeft() {
    if (this.gridCol > 0) {
      this.gridCol--;
      this.updatePosition();
    }
  }

  moveRight(maxCols) {
    if (this.gridCol < maxCols - 1) {
      this.gridCol++;
      this.updatePosition();
    }
  }

  getContainer() {
    return this.container;
  }

  getPosition() {
    return { row: this.gridRow, col: this.gridCol };
  }
}