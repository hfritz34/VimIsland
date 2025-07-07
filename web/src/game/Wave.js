import * as PIXI from 'pixi.js';

export class Wave {
  constructor(cellSize = 60, gridCols = 10) {
    this.cellSize = cellSize;
    this.gridCols = gridCols;
    this.container = new PIXI.Container();
    this.speed = 1; // pixels per frame
    this.currentRow = -1; // Start above the grid
    
    // Random wave properties
    this.waveWidth = Math.floor(Math.random() * 3) + 1; // 1-3 cells wide
    this.waveStartCol = Math.floor(Math.random() * (gridCols - this.waveWidth)); // Random start position
    this.wavePixelWidth = this.waveWidth * this.cellSize;
    this.wavePixelX = this.waveStartCol * this.cellSize;
    
    console.log(`Wave created: ${this.waveWidth} cells wide, starting at column ${this.waveStartCol}`);
    
    this.createWave();
  }

  createWave() {
    const wave = new PIXI.Graphics();
    
    // Use new PixiJS v8 Graphics API - only draw the wave for the specified width
    wave.rect(this.wavePixelX, 0, this.wavePixelWidth, this.cellSize);
    wave.fill(0x0000FF); // Bright blue
    
    // Add wave texture/pattern (foam on top) - only over the wave area
    const waveTop = new PIXI.Graphics();
    const foamCircles = Math.ceil(this.waveWidth * 2); // Proportional to wave width
    for (let i = 0; i < foamCircles; i++) {
      const foamX = this.wavePixelX + (i * (this.wavePixelWidth / foamCircles));
      waveTop.circle(foamX, 5, 8); // Slightly smaller foam circles
    }
    waveTop.fill({ color: 0xFFFFFF, alpha: 0.5 }); // White foam with transparency
    
    this.wave = wave;
    this.container.addChild(wave);
    this.container.addChild(waveTop);
  }

  update() {
    // Move wave down
    this.container.y += this.speed;
    
    // Calculate which grid row the wave is currently on
    this.currentRow = Math.floor(this.container.y / this.cellSize);
  }

  getCurrentRow() {
    return this.currentRow;
  }

  getContainer() {
    return this.container;
  }

  isOffScreen(gridRows) {
    return this.currentRow >= gridRows;
  }

  reset() {
    this.container.y = -this.cellSize;
    this.currentRow = -1;
  }
  
  // Check if a specific column is covered by this wave
  isColumnCovered(col) {
    return col >= this.waveStartCol && col < this.waveStartCol + this.waveWidth;
  }
  
  // Get wave coverage info for collision detection
  getWaveCoverage() {
    return {
      startCol: this.waveStartCol,
      endCol: this.waveStartCol + this.waveWidth - 1,
      width: this.waveWidth
    };
  }
}