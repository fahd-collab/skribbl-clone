const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const games = new Map();
const words = [
  'cat', 'dog', 'house', 'tree', 'car', 'bird', 'fish', 'flower', 'sun', 'moon',
  'star', 'book', 'phone', 'computer', 'pizza', 'hamburger', 'apple', 'banana',
  'elephant', 'giraffe', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'rabbit',
  'butterfly', 'bee', 'spider', 'snake', 'frog', 'turtle', 'dolphin', 'whale',
  'shark', 'octopus', 'crab', 'lobster', 'shrimp', 'salmon', 'tuna', 'trout',
  'eagle', 'hawk', 'owl', 'penguin', 'duck', 'goose', 'swan', 'chicken',
  'cow', 'horse', 'pig', 'sheep', 'goat', 'deer', 'moose', 'buffalo',
  'mountain', 'river', 'ocean', 'lake', 'beach', 'forest', 'desert', 'snow',
  'rain', 'cloud', 'wind', 'fire', 'water', 'earth', 'air', 'light',
  'dark', 'big', 'small', 'fast', 'slow', 'hot', 'cold', 'happy', 'sad'
];

// Game class
class Game {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = new Map();
    this.currentDrawer = null;
    this.currentWord = '';
    this.gameState = 'waiting'; // waiting, playing, finished
    this.round = 1;
    this.maxRounds = 3;
    this.timeLeft = 60;
    this.scores = new Map();
    this.guessedWords = new Set();
    this.roundStartTime = null;
  }

  addPlayer(playerId, playerName) {
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      score: 0,
      isDrawing: false
    });
    this.scores.set(playerId, 0);
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.scores.delete(playerId);
    
    if (this.players.size === 0) {
      this.gameState = 'waiting';
      this.currentDrawer = null;
      this.currentWord = '';
    } else if (this.currentDrawer === playerId) {
      this.nextRound();
    }
  }

  startGame() {
    if (this.players.size < 2) return false;
    
    this.gameState = 'playing';
    this.round = 1;
    this.roundStartTime = Date.now();
    this.nextRound();
    return true;
  }

  nextRound() {
    if (this.round > this.maxRounds) {
      this.endGame();
      return;
    }

    this.round++;
    this.currentWord = words[Math.floor(Math.random() * words.length)];
    this.guessedWords.clear();
    this.timeLeft = 60;
    this.roundStartTime = Date.now();

    // Select next drawer
    const playerIds = Array.from(this.players.keys());
    if (this.currentDrawer) {
      const currentIndex = playerIds.indexOf(this.currentDrawer);
      const nextIndex = (currentIndex + 1) % playerIds.length;
      this.currentDrawer = playerIds[nextIndex];
    } else {
      this.currentDrawer = playerIds[0];
    }

    // Update player states
    this.players.forEach((player, id) => {
      player.isDrawing = (id === this.currentDrawer);
    });
  }

  endGame() {
    this.gameState = 'finished';
    this.currentDrawer = null;
    this.currentWord = '';
  }

  guessWord(playerId, guess) {
    if (this.gameState !== 'playing' || playerId === this.currentDrawer) return false;
    
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedWord = this.currentWord.toLowerCase().trim();
    
    if (normalizedGuess === normalizedWord && !this.guessedWords.has(playerId)) {
      this.guessedWords.add(playerId);
      const timeBonus = Math.max(0, 60 - Math.floor((Date.now() - this.roundStartTime) / 1000));
      const score = 100 + timeBonus;
      
      this.scores.set(playerId, this.scores.get(playerId) + score);
      this.players.get(playerId).score = this.scores.get(playerId);
      
      return { correct: true, score, timeBonus };
    }
    
    return { correct: false };
  }

  getGameData() {
    return {
      roomId: this.roomId,
      players: Array.from(this.players.values()),
      currentDrawer: this.currentDrawer,
      currentWord: this.currentWord,
      gameState: this.gameState,
      round: this.round,
      maxRounds: this.maxRounds,
      timeLeft: this.timeLeft,
      scores: Object.fromEntries(this.scores),
      guessedWords: Array.from(this.guessedWords)
    };
  }
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', (playerName) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const game = new Game(roomId, socket.id);
    game.addPlayer(socket.id, playerName);
    
    games.set(roomId, game);
    socket.join(roomId);
    
    socket.emit('gameCreated', { roomId, gameData: game.getGameData() });
    console.log(`Game created: ${roomId} by ${playerName}`);
  });

  socket.on('joinGame', ({ roomId, playerName }) => {
    const game = games.get(roomId);
    
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }
    
    if (game.gameState !== 'waiting') {
      socket.emit('error', 'Game already in progress');
      return;
    }
    
    game.addPlayer(socket.id, playerName);
    socket.join(roomId);
    
    // Notify all players in the room
    io.to(roomId).emit('playerJoined', { playerName, gameData: game.getGameData() });
    console.log(`${playerName} joined game ${roomId}`);
  });

  socket.on('startGame', (roomId) => {
    const game = games.get(roomId);
    
    if (game && game.hostId === socket.id) {
      if (game.startGame()) {
        io.to(roomId).emit('gameStarted', game.getGameData());
        console.log(`Game ${roomId} started`);
      }
    }
  });

  socket.on('draw', ({ roomId, x, y, drawing }) => {
    const game = games.get(roomId);
    
    if (game && game.currentDrawer === socket.id && game.gameState === 'playing') {
      socket.to(roomId).emit('draw', { x, y, drawing });
    }
  });

  socket.on('clearCanvas', (roomId) => {
    const game = games.get(roomId);
    
    if (game && game.currentDrawer === socket.id) {
      socket.to(roomId).emit('clearCanvas');
    }
  });

  socket.on('guessWord', ({ roomId, guess }) => {
    const game = games.get(roomId);
    
    if (game && game.gameState === 'playing') {
      const result = game.guessWord(socket.id, guess);
      
      if (result.correct) {
        io.to(roomId).emit('wordGuessed', {
          playerName: game.players.get(socket.id).name,
          word: game.currentWord,
          score: result.score,
          timeBonus: result.timeBonus
        });
        
        // Check if all players have guessed
        if (game.guessedWords.size === game.players.size - 1) {
          setTimeout(() => {
            game.nextRound();
            io.to(roomId).emit('roundEnded', game.getGameData());
          }, 2000);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all games they're in
    games.forEach((game, roomId) => {
      if (game.players.has(socket.id)) {
        const playerName = game.players.get(socket.id).name;
        game.removePlayer(socket.id);
        
        io.to(roomId).emit('playerLeft', { playerName, gameData: game.getGameData() });
        console.log(`${playerName} left game ${roomId}`);
        
        // Remove empty games
        if (game.players.size === 0) {
          games.delete(roomId);
          console.log(`Game ${roomId} deleted (no players left)`);
        }
      }
    });
  });
});

// Game timer
setInterval(() => {
  games.forEach((game, roomId) => {
    if (game.gameState === 'playing' && game.roundStartTime) {
      const elapsed = Math.floor((Date.now() - game.roundStartTime) / 1000);
      game.timeLeft = Math.max(0, 60 - elapsed);
      
      if (game.timeLeft === 0) {
        // Round time expired
        setTimeout(() => {
          game.nextRound();
          io.to(roomId).emit('roundEnded', game.getGameData());
        }, 2000);
      }
      
      // Send time update every second
      io.to(roomId).emit('timeUpdate', { timeLeft: game.timeLeft });
    }
  });
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
