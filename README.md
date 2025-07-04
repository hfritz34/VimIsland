# VimIsland

A vim movement-based infinite runner game where players control cursor characters navigating an island environment while avoiding incoming crashing waves.

## Project Structure

```
vimisland/
├── web/          # Frontend (Vite + PixiJS)
├── api/          # Backend API (Node.js + Express)
├── assets/       # Shared assets (sprites, audio, etc.)
└── docs/         # Documentation
```

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
npm install
```

### Run Development
```bash
# Run both frontend and backend
npm run dev

# Run frontend only
npm run dev:web

# Run backend only  
npm run dev:api
```

### Build for Production
```bash
npm run build
```

## Game Controls

- `h`, `j`, `k`, `l` - Basic movement
- `w` - Jump forward by word
- `b` - Jump backward by word
- `f + [letter]` - Find and jump to letter
- `dd` - Delete line (rescue villagers)
- `x` - Delete character (remove obstacles)

## Tech Stack

- **Frontend**: Vite, PixiJS, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Deployment**: TBD

## Contributing

TBD 