export class InputManager {
  constructor() {
    this.keys = {};
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
    switch(key) {
      case 'h':
        console.log('Move left');
        break;
      case 'j':
        console.log('Move down');
        break;
      case 'k':
        console.log('Move up');
        break;
      case 'l':
        console.log('Move right');
        break;
      default:
        console.log(`Key pressed: ${key}`);
    }
  }

  isKeyPressed(key) {
    return !!this.keys[key];
  }
}
