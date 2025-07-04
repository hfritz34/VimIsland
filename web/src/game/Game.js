import * as PIXI from 'pixi.js';
import { InputManager } from './InputManager.js';
import { StateManager } from './StateManager.js';

export class Game {
  constructor(app) {
    this.app = app;
    this.inputManager = new InputManager();
    this.stateManager = new StateManager();
    
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

    // Add welcome text
    const style = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 24,
      fill: 0x000000,
    });

    const text = new PIXI.Text('Welcome to VimIsland!', style);
    text.x = this.app.screen.width / 2 - text.width / 2;
    text.y = this.app.screen.height / 2 - text.height / 2;
    
    this.uiContainer.addChild(text);
  }

  start() {
    console.log('VimIsland started!');
    this.app.ticker.add(this.gameLoop.bind(this));
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
