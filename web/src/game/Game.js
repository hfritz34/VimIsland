import * as PIXI from 'pixi.js';
import { InputManager } from './InputManager.js';
import { StateManager } from './StateManager.js';
import { LetterGrid } from './LetterGrid.js';
import { Player } from './Player.js';

export class Game {
  constructor(app) {
    this.app = app;
    this.inputManager = new InputManager();
    this.stateManager = new StateManager();
    this.letterGrid = null;
    this.player = null;
    this.playerContainer = null;
    
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

    // Create and add letter grid
    this.letterGrid = new LetterGrid(10, 10, 60);
    const gridBounds = this.letterGrid.getGridBounds();
    
    // Center the grid on screen
    const gridOffsetX = (this.app.screen.width - gridBounds.width) / 2;
    const gridOffsetY = (this.app.screen.height - gridBounds.height) / 2;
    this.letterGrid.getContainer().x = gridOffsetX;
    this.letterGrid.getContainer().y = gridOffsetY;
    
    this.gameContainer.addChild(this.letterGrid.getContainer());
    
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

  gameLoop(delta) {
    // Main game loop - called every frame
    this.update(delta);
    this.render();
  }

  update(delta) {
    // Update game logic here
  }

  render() {
    // Rendering is handled by PIXI automatically
  }
}
