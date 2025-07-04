# Development Guide

## Getting Started

1. Clone the repository
2. Run `npm install` in the root directory
3. Run `npm run dev` to start both frontend and backend

## Frontend Development (web/)

- Built with Vite for fast development
- Uses PixiJS for 2D graphics and animations
- Vanilla JavaScript for maximum performance
- ESLint and Prettier for code quality

### Key Files
- `src/main.js` - Entry point
- `src/game/Game.js` - Main game class
- `src/game/InputManager.js` - Vim input handling
- `src/game/StateManager.js` - Game state management

## Backend Development (api/)

- Express.js server
- RESTful API for scores and user data
- Environment-based configuration

### Key Files
- `src/server.js` - Server entry point
- `src/app.js` - Express app configuration

## Code Style

- Use ESLint and Prettier
- Follow existing naming conventions
- Write descriptive commit messages

## Testing

TBD

## Deployment

TBD 