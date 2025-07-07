import * as PIXI from 'pixi.js';
import { InputManager } from './InputManager.js';
import { StateManager } from './StateManager.js';
import { LetterGrid } from './LetterGrid.js';
import { Player } from './Player.js';
import { Wave } from './Wave.js';

export class Game {
  constructor(app) {
    this.app = app;
    this.inputManager = new InputManager();
    this.stateManager = new StateManager();
    this.letterGrid = null;
    this.player = null;
    this.playerContainer = null;
    this.waves = [];
    this.waveSpawnTimer = 0;
    this.waveSpawnInterval = 60; // 1 second at 60 FPS (reduced for testing)
    this.isGameOver = false;
    this.score = 0;
    this.waveContainer = null;
    this.gameLoopStarted = false;
    
    this.setup();
  }

  setup() {
    // Create containers for different game layers
    this.backgroundContainer = new PIXI.Container();
    this.gameContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();

    this.app.stage.addChild(this.backgroundContainer);
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.uiContainer);
    
    // Create sandy island background
    this.createIslandBackground();

    // Create and add letter grid
    this.letterGrid = new LetterGrid(10, 10, 60);
    const gridBounds = this.letterGrid.getGridBounds();
    
    // Center the grid on screen
    const gridOffsetX = (this.app.screen.width - gridBounds.width) / 2;
    const gridOffsetY = (this.app.screen.height - gridBounds.height) / 2;
    this.letterGrid.getContainer().x = gridOffsetX;
    this.letterGrid.getContainer().y = gridOffsetY;
    
    this.gameContainer.addChild(this.letterGrid.getContainer());
    
    // Create wave container
    this.waveContainer = new PIXI.Container();
    this.waveContainer.x = gridOffsetX;
    this.waveContainer.y = gridOffsetY;
    this.gameContainer.addChild(this.waveContainer);
    console.log('Wave container created and added to game container');
    
    // Create and add player cursor
    this.player = new Player(0, 0, 60);
    this.player.updatePosition();
    
    // Add player to a container that's offset with the grid
    this.playerContainer = new PIXI.Container();
    this.playerContainer.x = gridOffsetX;
    this.playerContainer.y = gridOffsetY;
    this.playerContainer.addChild(this.player.getContainer());
    
    this.gameContainer.addChild(this.playerContainer);
  }

  start() {
    console.log('VimIsland started!');
    
    // Set up input handling
    this.inputManager.setCommandCallback((command) => {
      this.handleVimCommand(command);
    });
    
    this.app.ticker.add(this.gameLoop.bind(this));
  }
  
  handleVimCommand(command) {
    switch(command) {
      case 'h':
        this.player.moveLeft();
        break;
      case 'j':
        this.player.moveDown(this.letterGrid.rows);
        break;
      case 'k':
        this.player.moveUp();
        break;
      case 'l':
        this.player.moveRight(this.letterGrid.cols);
        break;
    }
  }
  
  createIslandBackground() {
    const gridBounds = { width: 600, height: 600 }; // 10x10 grid at 60px per cell
    const padding = 80;
    
    // Calculate island position
    const islandX = (this.app.screen.width - gridBounds.width) / 2 - padding;
    const islandY = (this.app.screen.height - gridBounds.height) / 2 - padding;
    const islandWidth = gridBounds.width + padding * 2;
    const islandHeight = gridBounds.height + padding * 2;
    
    // Create sandy island
    const island = new PIXI.Graphics();
    
    // Draw main sand area
    island.roundRect(islandX, islandY, islandWidth, islandHeight, 20);
    island.fill(0xF4A460); // Sandy brown
    
    // Add texture variation
    for (let i = 0; i < 30; i++) {
      const x = islandX + Math.random() * islandWidth;
      const y = islandY + Math.random() * islandHeight;
      island.circle(x, y, Math.random() * 30 + 10);
    }
    island.fill({ color: 0xDEB887, alpha: 0.5 }); // Burly wood with transparency
    
    // Add darker sand edges
    island.roundRect(islandX, islandY, islandWidth, islandHeight, 20);
    island.stroke({ color: 0xD2691E, width: 5, alpha: 0.5 }); // Chocolate color
    
    this.backgroundContainer.addChild(island);
  }

  gameLoop(ticker) {
    // Main game loop - called every frame
    // PixiJS v8 passes the ticker object, we need to extract deltaTime
    const delta = ticker.deltaTime || ticker;
    
    if (!this.gameLoopStarted) {
      console.log('Game loop started!');
      console.log('Ticker object:', ticker);
      console.log('Extracted delta:', delta, 'Type:', typeof delta);
      this.gameLoopStarted = true;
    }
    this.update(delta);
    this.render();
  }

  update(delta) {
    if (this.isGameOver) return;
    
    // Update score (survival time)
    this.score += delta;
    
    // Update wave spawning
    this.waveSpawnTimer += delta;
    
    if (this.waveSpawnTimer >= this.waveSpawnInterval) {
      console.log('Wave spawn condition met! Timer:', this.waveSpawnTimer);
      this.spawnWave();
      this.waveSpawnTimer = 0;
    }
    
    // Update waves
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves[i];
      wave.update();
      
      // Check collision with player - must be same row AND within wave's column coverage
      const playerPos = this.player.getPosition();
      if (wave.getCurrentRow() === playerPos.row && wave.isColumnCovered(playerPos.col)) {
        console.log(`Collision detected! Player at (${playerPos.row}, ${playerPos.col}), Wave covers columns ${wave.getWaveCoverage().startCol}-${wave.getWaveCoverage().endCol}`);
        this.handleGameOver();
        return;
      }
      
      // Remove waves that are off screen
      if (wave.isOffScreen(this.letterGrid.rows)) {
        this.waveContainer.removeChild(wave.getContainer());
        this.waves.splice(i, 1);
        console.log('Wave removed, total waves:', this.waves.length);
      }
    }
  }
  
  spawnWave() {
    console.log('spawnWave() called - creating new wave...');
    const wave = new Wave(60, this.letterGrid.cols);
    console.log('Wave created:', wave);
    
    // Waves are added to waveContainer which is already offset, so no need to offset again
    wave.getContainer().x = 0;
    wave.getContainer().y = -60; // Start above the grid
    console.log('Wave container position set to:', wave.getContainer().x, wave.getContainer().y);
    
    this.waves.push(wave);
    this.waveContainer.addChild(wave.getContainer());
    console.log('Wave added to game, total waves:', this.waves.length);
    console.log('Wave container children count:', this.waveContainer.children.length);
  }

  render() {
    // Rendering is handled by PIXI automatically
  }
  
  handleGameOver() {
    this.isGameOver = true;
    
    // Create game over screen
    const gameOverContainer = new PIXI.Container();
    
    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    
    // Game over text
    const style = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 48,
      fill: 0xFF0000,
      align: 'center'
    });
    
    const gameOverText = new PIXI.Text({
      text: 'GAME OVER',
      style: style
    });
    gameOverText.x = this.app.screen.width / 2;
    gameOverText.y = this.app.screen.height / 2 - 100;
    gameOverText.anchor.set(0.5);
    
    // Score text
    const scoreStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center'
    });
    
    const survivalTime = Math.floor(this.score / 60); // Convert to seconds
    const scoreText = new PIXI.Text({
      text: `Survived: ${survivalTime} seconds`,
      style: scoreStyle
    });
    scoreText.x = this.app.screen.width / 2;
    scoreText.y = this.app.screen.height / 2;
    scoreText.anchor.set(0.5);
    
    // Restart instruction
    const restartText = new PIXI.Text({
      text: 'Press R to restart',
      style: scoreStyle
    });
    restartText.x = this.app.screen.width / 2;
    restartText.y = this.app.screen.height / 2 + 50;
    restartText.anchor.set(0.5);
    
    gameOverContainer.addChild(bg);
    gameOverContainer.addChild(gameOverText);
    gameOverContainer.addChild(scoreText);
    gameOverContainer.addChild(restartText);
    
    this.uiContainer.addChild(gameOverContainer);
    
    // Add restart handler
    document.addEventListener('keydown', this.handleRestart.bind(this));
  }
  
  handleRestart(event) {
    if (event.key === 'r' && this.isGameOver) {
      // Remove event listener
      document.removeEventListener('keydown', this.handleRestart.bind(this));
      
      // Clear all containers
      this.uiContainer.removeChildren();
      this.gameContainer.removeChildren();
      this.backgroundContainer.removeChildren();
      
      // Reset game state
      this.isGameOver = false;
      this.score = 0;
      this.waves = [];
      this.waveSpawnTimer = 0;
      
      // Reinitialize game
      this.setup();
    }
  }
}
