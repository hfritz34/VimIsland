export class StateManager {
  constructor() {
    this.currentState = 'MENU';
    this.gameData = {
      score: 0,
      level: 1,
      lives: 3,
      coins: 0,
    };
  }

  setState(newState) {
    console.log(`State changed from ${this.currentState} to ${newState}`);
    this.currentState = newState;
  }

  getState() {
    return this.currentState;
  }

  updateGameData(data) {
    this.gameData = { ...this.gameData, ...data };
  }

  getGameData() {
    return this.gameData;
  }
}
