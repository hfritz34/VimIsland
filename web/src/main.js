import * as PIXI from 'pixi.js';
import { Game } from './game/Game.js';
import './style.css';

// Initialize PIXI Application
const app = new PIXI.Application({
  width: 1024,
  height: 768,
  backgroundColor: 0x87CEEB, // Sky blue
  antialias: true,
});

// Add canvas to DOM
document.querySelector('#app').appendChild(app.view);

// Initialize game
const game = new Game(app);
game.start();
