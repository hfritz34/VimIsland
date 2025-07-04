import * as PIXI from 'pixi.js';
import { Game } from './game/Game.js';
import './style.css';

// Initialize PIXI Application with new v8 API
async function initGame() {
  const app = new PIXI.Application();
  
  await app.init({
    width: 1024,
    height: 768,
    backgroundColor: 0x87CEEB, // Sky blue
    antialias: true,
  });

  // Add canvas to DOM (using new canvas property instead of deprecated view)
  document.querySelector('#app').appendChild(app.canvas);

  // Initialize game
  const game = new Game(app);
  game.start();
}

// Start the game
initGame().catch(console.error);
