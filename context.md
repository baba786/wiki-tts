# WikiAudio Project Context

*Last updated: March 31, 2025 at 15:30*

## Project Overview

WikiAudio is a web application that fetches Wikipedia article summaries and converts them to speech using Coqui TTS. It features both Search and Random modes, with a mobile-friendly interface.

## Development Timeline

### Initial Implementation (March 31, 2025, 12:00-14:00)
- Basic Search functionality working
- TTS conversion with Coqui working
- Simple UI with search bar and results display

### Random Mode Addition (March 31, 2025, 14:00-15:30)
- Added "Random Mode" that functions like TikTok/YouTube Shorts
- Implemented navigation between random articles
- Created mobile-friendly tab navigation
- Fixed state management between modes
- Improved UX when switching between modes

## Current Architecture

### Backend
- Flask server (server.py) running on port 5000
- Serves as TTS API using Coqui
- Caches generated audio files to avoid regeneration

### Frontend
- HTML/CSS/JavaScript
- Fetch API for Wikipedia content
- Modal architecture with two modes:
  - Search mode: User-directed article lookup
  - Random mode: TikTok-like discovery experience

### Key Features
- **Search Mode**: User searches for specific topics
- **Random Mode**: User swipes through random articles
- **Audio Generation**: Text-to-speech for article summaries
- **Mobile-Friendly**: Works on phones and tablets
- **Network Access**: Can be accessed from mobile devices on same network

## Implementation Details

### State Management
- Mode switching handled via CSS classes and JavaScript
- Content visibility managed during mode transitions
- History tracking for navigation in Random mode

### Data Flow
1. Frontend fetches Wikipedia summary via REST API
2. TTS request sent to Flask backend
3. Backend caches and serves audio files
4. Audio played in browser

## Mobile Network Access

To access the app from mobile devices on the same network:

1. Run Flask server with network access:
   ```bash
   cd /Users/sshugautam/Desktop/WebApps/wiki-tts-app
   python3 -m flask --app server run --host=0.0.0.0 --port=5000
   ```

2. Run web server with network access:
   ```bash
   cd /Users/sshugautam/Desktop/WebApps/wiki-tts-app
   python3 -m http.server 8000 --bind 0.0.0.0
   ```

3. Access from mobile device via computer's IP address:
   ```
   http://192.168.2.44:8000
   ```

## Potential Future Improvements

- Dark mode
- Customizable TTS voices
- User history/favorites
- Share functionality
- Better error handling
- Loading states visualization
- Expand article content beyond summary
- Automatic language detection

## Technical Debt / Known Issues

- The audio caching currently uses hard-coded paths
- Search mode and Random mode could have better visual distinction
- No offline support
- TTS might struggle with technical terms or foreign words
