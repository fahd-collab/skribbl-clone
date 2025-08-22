// Game state
let socket;
let currentGame = null;
let isDrawing = false;
let isDrawingMode = false;
let drawingContext;
let lastX = 0;
let lastY = 0;
let isReceivingDraw = false; // Track if we're receiving drawing data

// DOM elements
const screens = {
    welcome: document.getElementById('welcomeScreen'),
    lobby: document.getElementById('lobbyScreen'),
    game: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOverScreen')
};

const elements = {
    playerName: document.getElementById('playerName'),
    createGameBtn: document.getElementById('createGameBtn'),
    joinGameBtn: document.getElementById('joinGameBtn'),
    joinModal: document.getElementById('joinModal'),
    roomCode: document.getElementById('roomCode'),
    confirmJoinBtn: document.getElementById('confirmJoinBtn'),
    cancelJoinBtn: document.getElementById('cancelJoinBtn'),
    roomCodeDisplay: document.getElementById('roomCodeDisplay'),
    copyRoomCodeBtn: document.getElementById('copyRoomCodeBtn'),
    playersList: document.getElementById('playersList'),
    playerCount: document.getElementById('playerCount'),
    startGameBtn: document.getElementById('startGameBtn'),
    leaveLobbyBtn: document.getElementById('leaveLobbyBtn'),
    currentRound: document.getElementById('currentRound'),
    maxRounds: document.getElementById('maxRounds'),
    timeLeft: document.getElementById('timeLeft'),
    currentWord: document.getElementById('currentWord'),
    drawingCanvas: document.getElementById('drawingCanvas'),
    canvasOverlay: document.getElementById('canvasOverlay'),
    clearCanvasBtn: document.getElementById('clearCanvasBtn'),
    colorPicker: document.getElementById('colorPicker'),
    brushSize: document.getElementById('brushSize'),
    gamePlayersList: document.getElementById('gamePlayersList'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    finalScoresList: document.getElementById('finalScoresList'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    backToLobbyBtn: document.getElementById('backToLobbyBtn')
};

// Initialize the game
function init() {
    setupEventListeners();
    setupCanvas();
    showNotification('Khushamdeed — Skribbl Clone mein aapka khair maqdam hai!', 'info');
}

// Setup event listeners
function setupEventListeners() {
    // Welcome screen
    elements.createGameBtn.addEventListener('click', createGame);
    elements.joinGameBtn.addEventListener('click', showJoinModal);
    
    // Join modal
    elements.confirmJoinBtn.addEventListener('click', joinGame);
    elements.cancelJoinBtn.addEventListener('click', hideJoinModal);
    
    // Lobby
    elements.copyRoomCodeBtn.addEventListener('click', copyRoomCode);
    elements.startGameBtn.addEventListener('click', startGame);
    elements.leaveLobbyBtn.addEventListener('click', leaveLobby);
    
    // Game
    elements.clearCanvasBtn.addEventListener('click', clearCanvas);
    elements.sendChatBtn.addEventListener('click', sendChat);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChat();
    });
    
    // Game over
    elements.playAgainBtn.addEventListener('click', playAgain);
    elements.backToLobbyBtn.addEventListener('click', backToLobby);
    
    // Canvas events
    elements.drawingCanvas.addEventListener('mousedown', startDrawing);
    elements.drawingCanvas.addEventListener('mousemove', draw);
    elements.drawingCanvas.addEventListener('mouseup', stopDrawing);
    elements.drawingCanvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch events for mobile
    elements.drawingCanvas.addEventListener('touchstart', handleTouch);
    elements.drawingCanvas.addEventListener('touchmove', handleTouch);
    elements.drawingCanvas.addEventListener('touchend', stopDrawing);
}

// Setup canvas
function setupCanvas() {
    drawingContext = elements.drawingCanvas.getContext('2d');
    drawingContext.lineCap = 'round';
    drawingContext.lineJoin = 'round';
    
    // Set canvas background to white
    drawingContext.fillStyle = '#ffffff';
    drawingContext.fillRect(0, 0, elements.drawingCanvas.width, elements.drawingCanvas.height);
    
    updateBrush();
}

// Update brush settings
function updateBrush() {
    drawingContext.strokeStyle = elements.colorPicker.value;
    drawingContext.lineWidth = elements.brushSize.value;
}

// Event listeners for brush controls
elements.colorPicker.addEventListener('change', updateBrush);
elements.brushSize.addEventListener('input', updateBrush);

// Drawing functions
function startDrawing(e) {
    if (!isDrawingMode) return;
    
    isDrawing = true;
    const rect = elements.drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastX = x;
    lastY = y;
}

function draw(e) {
    if (!isDrawing || !isDrawingMode) return;
    
    const rect = elements.drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingContext.beginPath();
    drawingContext.moveTo(lastX, lastY);
    drawingContext.lineTo(x, y);
    drawingContext.stroke();
    
    // Send drawing data to server
    socket.emit('draw', {
        roomId: currentGame.roomId,
        x: x / elements.drawingCanvas.width,
        y: y / elements.drawingCanvas.height,
        lastX: lastX / elements.drawingCanvas.width,
        lastY: lastY / elements.drawingCanvas.height,
        drawing: true
    });
    
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                    e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    elements.drawingCanvas.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    if (!isDrawingMode) return;
    
    // Clear and reset to white background
    drawingContext.clearRect(0, 0, elements.drawingCanvas.width, elements.drawingCanvas.height);
    drawingContext.fillStyle = '#ffffff';
    drawingContext.fillRect(0, 0, elements.drawingCanvas.width, elements.drawingCanvas.height);
    
    socket.emit('clearCanvas', currentGame.roomId);
}

// Game functions
function createGame() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        showNotification('Barah-e-karam apna naam darj karein', 'error');
        return;
    }
    
    if (!socket) {
        connectSocket();
    }
    
    socket.emit('createGame', playerName);
}

function showJoinModal() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        showNotification('Barah-e-karam apna naam darj karein', 'error');
        return;
    }
    
    elements.joinModal.classList.add('active');
}

function hideJoinModal() {
    elements.joinModal.classList.remove('active');
    elements.roomCode.value = '';
}

function joinGame() {
    const roomCode = elements.roomCode.value.trim().toUpperCase();
    const playerName = elements.playerName.value.trim();
    
    if (!roomCode) {
        showNotification('Barah-e-karam room code darj karein', 'error');
        return;
    }
    
    if (!socket) {
        connectSocket();
    }
    
    socket.emit('joinGame', { roomId: roomCode, playerName });
    hideJoinModal();
}

function startGame() {
    if (currentGame) {
        socket.emit('startGame', currentGame.roomId);
    }
}

function leaveLobby() {
    if (socket) {
        socket.disconnect();
    }
    showScreen('welcome');
    currentGame = null;
}

function sendChat() {
    const message = elements.chatInput.value.trim();
    if (!message || !currentGame) return;
    
    // Check if it's a word guess
    if (currentGame.gameState === 'playing' && !currentGame.isDrawing) {
        socket.emit('guessWord', { roomId: currentGame.roomId, guess: message });
    }
    
    // Add message to chat
    addChatMessage('Aap', message, 'user');
    elements.chatInput.value = '';
}

function playAgain() {
    if (currentGame) {
        socket.emit('startGame', currentGame.roomId);
    }
}

function backToLobby() {
    showScreen('lobby');
    updateLobby();
}

// Socket connection
function connectSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('gameCreated', ({ roomId, gameData }) => {
        currentGame = { ...gameData, roomId };
        showScreen('lobby');
        updateLobby();
        showNotification(`Game ban gaya! Room code: ${roomId}`, 'success');
    });
    
    socket.on('playerJoined', ({ playerName, gameData }) => {
        currentGame = gameData;
        updateLobby();
        addChatMessage('Nizaam', `${playerName} ne game join kiya`, 'system');
        showNotification(`${playerName} ne game join kiya`, 'info');
    });
    
    socket.on('playerLeft', ({ playerName, gameData }) => {
        currentGame = gameData;
        updateLobby();
        addChatMessage('Nizaam', `${playerName} ne game chhoda`, 'system');
        showNotification(`${playerName} ne game chhoda`, 'info');
    });
    
    socket.on('gameStarted', (gameData) => {
        currentGame = gameData;
        showScreen('game');
        updateGame();
        showNotification('Game shuru ho gaya!', 'success');
    });
    
    socket.on('draw', ({ x, y, lastX: remoteLastX, lastY: remoteLastY, drawing }) => {
        if (drawing && !isDrawingMode) {
            // Convert normalized coordinates back to canvas coordinates
            const canvasX = x * elements.drawingCanvas.width;
            const canvasY = y * elements.drawingCanvas.height;
            const canvasLastX = remoteLastX * elements.drawingCanvas.width;
            const canvasLastY = remoteLastY * elements.drawingCanvas.height;
            
            // Set the drawing context properties to match the drawer's settings
            drawingContext.strokeStyle = '#000000'; // Default color for viewers
            drawingContext.lineWidth = 5; // Default brush size for viewers
            
            // Draw the line
            drawingContext.beginPath();
            drawingContext.moveTo(canvasLastX, canvasLastY);
            drawingContext.lineTo(canvasX, canvasY);
            drawingContext.stroke();
        }
    });
    
    socket.on('clearCanvas', () => {
        if (!isDrawingMode) {
            // Clear and reset to white background
            drawingContext.clearRect(0, 0, elements.drawingCanvas.width, elements.drawingCanvas.height);
            drawingContext.fillStyle = '#ffffff';
            drawingContext.fillRect(0, 0, elements.drawingCanvas.width, elements.drawingCanvas.height);
        }
    });
    
    socket.on('wordGuessed', ({ playerName, word, score, timeBonus }) => {
        addChatMessage(playerName, `Sahih! "${word}" (+${score} points, +${timeBonus} time bonus)`, 'correct');
        updateGame();
        showNotification(`${playerName} ne sahi jawab diya!`, 'success');
    });
    
    socket.on('roundEnded', (gameData) => {
        currentGame = gameData;
        if (gameData.gameState === 'finished') {
            showScreen('gameOver');
            updateGameOver();
        } else {
            updateGame();
            showNotification('Round khatam hua!', 'info');
        }
    });
    
    socket.on('timeUpdate', ({ timeLeft }) => {
        if (currentGame) {
            currentGame.timeLeft = timeLeft;
            elements.timeLeft.textContent = timeLeft;
        }
    });
    
    socket.on('error', (message) => {
        // server sends messages (now in Roman Urdu) — display as-is
        showNotification(message, 'error');
    });
    
    socket.on('disconnect', () => {
        showNotification('Server se talaq toot gaya', 'error');
        currentGame = null;
    });
}

// UI update functions
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function updateLobby() {
    if (!currentGame) return;
    
    elements.roomCodeDisplay.textContent = currentGame.roomId;
    elements.playerCount.textContent = currentGame.players.length;
    
    // Update players list
    elements.playersList.innerHTML = '';
    currentGame.players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = `player-card ${player.id === currentGame.hostId ? 'host' : ''}`;
        playerCard.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-score">Score: ${player.score}</div>
        `;
        elements.playersList.appendChild(playerCard);
    });
    
    // Enable/disable start button
    elements.startGameBtn.disabled = currentGame.players.length < 2;
}

function updateGame() {
    if (!currentGame) return;
    
    elements.currentRound.textContent = currentGame.round;
    elements.maxRounds.textContent = currentGame.maxRounds;
    elements.timeLeft.textContent = currentGame.timeLeft;
    
    // Update word display
    if (currentGame.gameState === 'playing') {
        elements.currentWord.textContent = currentGame.currentWord;
    } else {
        elements.currentWord.textContent = 'Waiting for word...';
    }
    
    // Update drawing mode
    isDrawingMode = currentGame.currentDrawer === socket.id;
    elements.canvasOverlay.classList.toggle('hidden', isDrawingMode);
    
    // Update players list
    elements.gamePlayersList.innerHTML = '';
    currentGame.players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = `game-player ${player.id === currentGame.currentDrawer ? 'drawing' : ''}`;
        playerItem.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score}</span>
        `;
        elements.gamePlayersList.appendChild(playerItem);
    });
    
    // Update canvas controls visibility
    const canvasControls = document.querySelector('.canvas-controls');
    canvasControls.style.display = isDrawingMode ? 'flex' : 'none';
}

function updateGameOver() {
    if (!currentGame) return;
    
    // Sort players by score
    const sortedPlayers = [...currentGame.players].sort((a, b) => b.score - a.score);
    
    elements.finalScoresList.innerHTML = '';
    sortedPlayers.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = `final-score-item ${index === 0 ? 'winner' : ''}`;
        scoreItem.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="final-score">${player.score}</span>
        `;
        elements.finalScoresList.appendChild(scoreItem);
    });
}

function addChatMessage(playerName, message, type = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.innerHTML = `
        <div class="player-name">${playerName}</div>
        <div class="message-text">${message}</div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function copyRoomCode() {
    if (currentGame) {
        navigator.clipboard.writeText(currentGame.roomId).then(() => {
            showNotification('Room code copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy room code', 'error');
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.querySelector('.notifications').appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
