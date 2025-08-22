# Skribbl Clone - Unlimited Players

A real-time multiplayer drawing and guessing game inspired by skribbl.io, built with Node.js, Socket.IO, and modern web technologies.

## Features

- 🎨 **Real-time Drawing**: Smooth drawing experience with customizable colors and brush sizes
- 👥 **Unlimited Players**: No player limit - invite as many friends as you want!
- 🏠 **Room System**: Create private rooms with unique 6-digit codes
- 🎯 **Word Guessing**: Players take turns drawing while others guess the word
- ⏱️ **Timer System**: 60-second rounds with time-based scoring
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🎮 **Multiple Rounds**: 3 rounds per game with rotating players
- 💯 **Scoring System**: Points based on correct guesses and time remaining
- 💬 **Chat System**: Real-time chat for guessing and communication
- 🏆 **Leaderboards**: Final scores displayed at the end of each game

## How to Play

1. **Enter Your Name**: Start by entering your player name
2. **Create or Join Game**: 
   - Create a new game to get a room code
   - Join an existing game using a room code
3. **Wait in Lobby**: Wait for other players to join (minimum 2 players)
4. **Start Drawing**: When it's your turn, draw the given word on the canvas
5. **Guess Words**: When others are drawing, type your guesses in the chat
6. **Score Points**: Earn points for correct guesses and time bonuses
7. **Complete Rounds**: Play through 3 rounds with different words and drawers

**Note**: The web UI is presented in Roman‑Urdu (Latin script) — labels, notifications and chat/system messages are shown in Roman‑Urdu.

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project files**
   ```bash
   # If you have git installed:
   git clone <repository-url>
   cd skrillclone
   
   # Or simply download and extract the ZIP file
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## Game Rules

- **Drawing**: Use your mouse or touch to draw on the canvas
- **Guessing**: Type your guesses in the chat box
- **Scoring**: 
  - Correct guess: 100 points + time bonus
  - Time bonus: Up to 60 additional points based on speed
- **Rounds**: 3 rounds per game, each player draws once
- **Time Limit**: 60 seconds per round

## Technical Details

### Backend
- **Node.js**: Server runtime
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **CORS**: Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript**: No frameworks, pure JS
- **HTML5 Canvas**: Drawing functionality
- **CSS3**: Modern styling with animations
- **Responsive Design**: Mobile-first approach

### Real-time Features
- WebSocket connections for instant updates
- Drawing synchronization across all players
- Live chat and notifications
- Real-time score updates

## File Structure

```
skrillclone/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── public/            # Frontend files
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styling
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

## Customization

### Adding More Words
Edit the `words` array in `server.js` to add more drawing words:

```javascript
const words = [
    'cat', 'dog', 'house', 'tree', 'car', 'bird', 'fish', 'flower',
    // Add your own words here
    'your_word_here'
];
```

### Changing Game Settings
Modify these values in `server.js`:

```javascript
this.timeLeft = 60;        // Seconds per round
```s.maxRounds = 3;        // Number of rounds per game
this.timeLeft = 60;        // Seconds per round
### Styling Changes
Edit `public/styles.css` to customize colors, fonts, and layout.
### Styling Changes
## Troubleshootings.css` to customize colors, fonts, and layout.

### Common Issuesg

1. **Port already in use**
   ```bash
   # Change port in server.js or kill existing process
   lsof -ti:3000 | xargs kill -9
   ```hange port in server.js or kill existing process
   lsof -ti:3000 | xargs kill -9
2. **Dependencies not installed**
   ```bash
   npm installies not installed**
   ```bash
   npm install
3. **Canvas not working**
   - Ensure JavaScript is enabled
   - Check browser console for errors
   - Try refreshing the pageabled
   - Check browser console for errors
### Browser Compatibilityage
- Chrome (recommended)
- Firefoxer Compatibility
- Safari (recommended)
- Edgefox
- Mobile browsers (iOS Safari, Chrome Mobile)
- Edge
## Contributingrs (iOS Safari, Chrome Mobile)

Feel free to contribute improvements:
1. Fork the project
2. Create a feature branchprovements:
3. Make your changes
4. Test thoroughlye branch
5. Submit a pull request
4. Test thoroughly
## Licensea pull request

This project is open source and available under the MIT License.

## Supportct is open source and available under the MIT License.

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all dependencies are properly installed
4. Verify Node.js version compatibility messages
3. Ensure all dependencies are properly installed
---Verify Node.js version compatibility

**Enjoy playing Skribbl Clone! 🎨🎮**

**Enjoy playing Skribbl Clone! 🎨🎮**
