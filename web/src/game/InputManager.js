export class InputManager {
  constructor() {
    this.keys = {};
    this.commandCallback = null;
    this.waitingForChar = false;  // For 'f' command
    this.lastFindChar = null;      // Store last searched character
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
    // If we're waiting for a character after 'f'
    if (this.waitingForChar) {
      this.waitingForChar = false;
      // Only accept letters for find
      if (key.length === 1 && /[a-zA-Z]/.test(key)) {
        this.lastFindChar = key.toUpperCase();
        this.commandCallback('f' + this.lastFindChar);
      }
      return;
    }
    
    const vimCommands = ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'f', ';', 'o', 'O', '0', '$', 'x'];
    
    if (vimCommands.includes(key)) {
      if (key === 'f') {
        // Wait for next character
        this.waitingForChar = true;
      } else if (key === ';' && this.lastFindChar) {
        // Repeat last find
        this.commandCallback('f' + this.lastFindChar);
      } else if (this.commandCallback) {
        this.commandCallback(key);
      }
    }
  }
  
  setCommandCallback(callback) {
    this.commandCallback = callback;
  }

  isKeyPressed(key) {
    return !!this.keys[key];
  }
}
