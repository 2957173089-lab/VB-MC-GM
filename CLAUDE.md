# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based music player application built for AI Studio with the following key features:
- Music discovery and playback functionality
- Immersive player mode
- Multiple play modes (sequence, loop, shuffle)
- Integration with Gemini AI API for music-related features
- Firebase integration for backend services

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build directory
npm run clean

# Type checking (linting)
npm run lint
```

## Environment Setup

Required environment variables (set in `.env.local`):
- `GEMINI_API_KEY`: Your Gemini API key for AI features
- `APP_URL`: Application URL (auto-injected by AI Studio)

## Architecture Overview

### Core Structure
- **Framework**: React with TypeScript, Vite build tool
- **Routing**: React Router with HashRouter
- **State Management**: React Context API (PlayerContext)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion library

### Key Components
- `src/App.tsx`: Root application with routing and PlayerProvider
- `src/store/PlayerContext.tsx`: Global music player state management
- `src/components/Layout.tsx`: Main layout with navigation and mini player
- `src/components/MiniPlayer.tsx`: Floating mini player component
- `src/pages/`: Page components for different sections (Modes, Discover, Player, Profile)

### Data Flow
- Player state is managed globally through PlayerContext
- Music data structure includes Song interface with id, title, artist, coverUrl, and optional audioUrl
- Mock playlist provided in PlayerContext for development
- Audio playback handled through HTML5 audio element with refs

### Navigation Structure
- Hash-based routing for AI Studio compatibility
- Four main sections: Modes (/), Discover (/discover), Player (/player), Profile (/profile)
- Bottom navigation bar with glassmorphism design
- Immersive mode hides navigation for full-screen player experience

## Key Dependencies

### Runtime Dependencies
- `react`, `react-dom`: Core React libraries
- `react-router-dom`: Client-side routing
- `@google/genai`: Gemini AI API integration
- `firebase`: Backend services
- `lucide-react`: Icon library
- `motion`: Animation library
- `better-sqlite3`: Local database
- `express`: Server framework

### Development Dependencies
- `vite`: Build tool and development server
- `typescript`: Type checking
- `tailwindcss`: Utility-first CSS framework
- `@tailwindcss/vite`: Tailwind Vite plugin
- `tsx`: TypeScript execution

## File Organization

```
src/
├── App.tsx                 # Root application component
├── main.tsx              # Application entry point
├── store/
│   └── PlayerContext.tsx  # Global player state
├── components/
│   ├── Layout.tsx        # Main layout with navigation
│   └── MiniPlayer.tsx    # Floating mini player
└── pages/
    ├── Modes.tsx         # Home/Modes page
    ├── Discover.tsx      # Music discovery
    ├── Player.tsx        # Full player interface
    ├── Profile.tsx       # User profile
    └── LyricsDetail.tsx  # Lyrics display
```

## API Integration

- **Music APIs**:
  - Primary: `https://api.music.areschang.top/` - 音乐搜索和推荐
  - Backup: `http://iwenwiki.com:3000/` - 备用音乐数据源
- **Gemini AI**: Used for music-related AI features via `@google/genai`
- **Firebase**: Backend services for user data and music metadata
- Environment variables required for proper API configuration

## Build and Deployment

- Built with Vite for optimized production bundles
- TypeScript for type safety
- Tailwind CSS for responsive, utility-first styling
- Designed for deployment on AI Studio platform
- Express server included for potential backend functionality