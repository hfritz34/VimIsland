import * as PIXI from 'pixi.js';

export class Player {
  constructor(gridRow = 5, gridCol = 5, cellSize = 60) {
    this.gridRow = gridRow;
    this.gridCol = gridCol;
    this.cellSize = cellSize;
    this.container = new PIXI.Container();
    
    // Jump ability properties
    this.jumpCooldown = 0;
    this.jumpCooldownMax = 180; // 3 seconds at 60 FPS
    this.isJumping = false;
    this.jumpDuration = 30; // 0.5 seconds at 60 FPS
    this.jumpTimer = 0;
    
    this.createCursor();
  }

  createCursor() {
    // Create a vertical cursor like in vim (thin vertical line)
    const cursor = new PIXI.Graphics();
    cursor.rect(0, 0, 3, this.cellSize - 10);
    cursor.fill(0xFF0000);
    
    // Create highlight box for better visibility
    const highlight = new PIXI.Graphics();
    highlight.rect(-this.cellSize/2 + 5, -this.cellSize/2 + 5, this.cellSize - 10, this.cellSize - 10);
    highlight.fill({ color: 0xFF0000, alpha: 0.1 });
    highlight.stroke({ color: 0xFF0000, width: 2, alpha: 0.3 });
    
    this.cursor = cursor;
    this.highlight = highlight;
    
    this.container.addChild(highlight);
    this.container.addChild(cursor);
    
    // Position cursor to the left side of the character
    cursor.x = -this.cellSize/2 + 5;
    cursor.y = -this.cellSize/2 + 5;
    
    // Start blinking animation
    this.startBlinking();
  }

  startBlinking() {
    let blinkCounter = 0;
    setInterval(() => {
      blinkCounter++;
      this.cursor.visible = blinkCounter % 2 === 0;
    }, 500);
  }

  updatePosition() {
    this.container.x = this.gridCol * this.cellSize + this.cellSize / 2;
    this.container.y = this.gridRow * this.cellSize + this.cellSize / 2;
  }

  moveUp() {
    if (this.gridRow > 0) {
      this.gridRow--;
      this.updatePosition();
    }
  }

  moveDown(maxRows) {
    if (this.gridRow < maxRows - 1) {
      this.gridRow++;
      this.updatePosition();
    }
  }

  moveLeft() {
    if (this.gridCol > 0) {
      this.gridCol--;
      this.updatePosition();
    }
  }

  moveRight(maxCols) {
    if (this.gridCol < maxCols - 1) {
      this.gridCol++;
      this.updatePosition();
    }
  }

  getContainer() {
    return this.container;
  }

  getPosition() {
    return { row: this.gridRow, col: this.gridCol };
  }

  // Move to next word start position
  moveToNextWord(letterGrid) {
    const nextPos = letterGrid.findNextWordStart(this.gridRow, this.gridCol);
    if (nextPos) {
      this.gridRow = nextPos.row;
      this.gridCol = nextPos.col;
      this.updatePosition();
      return true;
    }
    return false;
  }

  // Move to previous word start position
  moveToPreviousWord(letterGrid) {
    const prevPos = letterGrid.findPreviousWordStart(this.gridRow, this.gridCol);
    if (prevPos) {
      this.gridRow = prevPos.row;
      this.gridCol = prevPos.col;
      this.updatePosition();
      return true;
    }
    return false;
  }

  // Move to end of current/next word
  moveToWordEnd(letterGrid) {
    const endPos = letterGrid.findWordEnd(this.gridRow, this.gridCol);
    if (endPos) {
      this.gridRow = endPos.row;
      this.gridCol = endPos.col;
      this.updatePosition();
      return true;
    }
    return false;
  }

  // Find and move to character in current row
  findCharacter(letterGrid, targetChar) {
    const charPos = letterGrid.findCharacterInRow(this.gridRow, this.gridCol, targetChar);
    if (charPos) {
      this.gridRow = charPos.row;
      this.gridCol = charPos.col;
      this.updatePosition();
      return true;
    }
    return false;
  }

  // Update player state (cooldowns, jumping animation)
  update(delta) {
    // Update jump cooldown
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= delta;
      if (this.jumpCooldown < 0) this.jumpCooldown = 0;
    }

    // Update jumping state
    if (this.isJumping) {
      this.jumpTimer -= delta;
      if (this.jumpTimer <= 0) {
        this.isJumping = false;
        this.jumpTimer = 0;
        // Reset visual state
        this.container.y = this.gridRow * this.cellSize + this.cellSize / 2;
      } else {
        // Create jump animation (slight upward movement)
        const jumpProgress = 1 - (this.jumpTimer / this.jumpDuration);
        const jumpHeight = Math.sin(jumpProgress * Math.PI) * -20; // Peak at middle of jump
        this.container.y = this.gridRow * this.cellSize + this.cellSize / 2 + jumpHeight;
      }
    }
  }

  // Jump over waves (o = jump up, O = jump down)
  jumpOverWaves(direction = 'up') {
    if (this.jumpCooldown > 0 || this.isJumping) {
      return false; // Can't jump while on cooldown or already jumping
    }

    // Start jump
    this.isJumping = true;
    this.jumpTimer = this.jumpDuration;
    this.jumpCooldown = this.jumpCooldownMax;

    // Optional: Move one row in the direction
    if (direction === 'up' && this.gridRow > 0) {
      this.gridRow--;
    } else if (direction === 'down' && this.gridRow < 9) { // Assuming 10 rows (0-9)
      this.gridRow++;
    }
    
    this.updatePosition();
    return true;
  }

  // Check if jump is available
  canJump() {
    return this.jumpCooldown <= 0 && !this.isJumping;
  }

  // Get jump cooldown percentage (for UI)
  getJumpCooldownPercent() {
    return this.jumpCooldown / this.jumpCooldownMax;
  }

  // Check if player is currently jumping (immune to waves)
  isImmuneToWaves() {
    return this.isJumping;
  }

  // Move to start of line (column 0)
  moveToLineStart() {
    this.gridCol = 0;
    this.updatePosition();
  }

  // Move to end of line (last column)
  moveToLineEnd(maxCols) {
    this.gridCol = maxCols - 1;
    this.updatePosition();
  }

  // Delete character at current position
  deleteCurrentCharacter(letterGrid) {
    return letterGrid.deleteCharacter(this.gridRow, this.gridCol);
  }
}