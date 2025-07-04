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
    // Create a simple rectangular cursor
    const cursor = new PIXI.Graphics();
    cursor.lineStyle(3, 0xFF0000, 1);
    cursor.drawRect(0, 0, this.cellSize - 10, this.cellSize - 10);
    
    // Create blinking underscore effect
    const underscore = new PIXI.Graphics();
    underscore.beginFill(0xFF0000);
    underscore.drawRect(5, this.cellSize - 15, this.cellSize - 20, 5);
    underscore.endFill();
    
    this.cursor = cursor;
    this.underscore = underscore;
    
    this.container.addChild(cursor);
    this.container.addChild(underscore);
    
    // Center cursor in cell
    this.container.pivot.set((this.cellSize - 10) / 2, (this.cellSize - 10) / 2);
    
    // Start blinking animation
    this.startBlinking();
  }

  startBlinking() {
    let blinkCounter = 0;
    setInterval(() => {
      blinkCounter++;
      this.underscore.visible = blinkCounter % 2 === 0;
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