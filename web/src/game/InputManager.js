export class InputManager {
  constructor() {
    this.keys = {};
    this.commandCallback = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
      this.handleVimCommand(event.key);
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
    });
  }

  handleVimCommand(key) {
    const vimCommands = ['h', 'j', 'k', 'l'];
    
    if (vimCommands.includes(key) && this.commandCallback) {
      this.commandCallback(key);
    }
  }
  
  setCommandCallback(callback) {
    this.commandCallback = callback;
  }

  isKeyPressed(key) {
    return !!this.keys[key];
  }
}
