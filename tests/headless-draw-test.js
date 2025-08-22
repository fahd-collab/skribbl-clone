const io = require('socket.io-client');

const SERVER = process.env.SERVER_URL || 'http://localhost:3000';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('Starting headless draw test against', SERVER);

  const client1 = io(SERVER);
  let roomId;

  client1.on('connect', () => {
    console.log('Client1 connected:', client1.id);
    client1.emit('createGame', 'Host');
  });

  client1.on('gameCreated', async ({ roomId: rid }) => {
    roomId = rid;
    console.log('Game created with roomId', roomId);

    // Connect viewer
    const client2 = io(SERVER);

    client2.on('connect', () => {
      console.log('Client2 connected:', client2.id);
      client2.emit('joinGame', { roomId, playerName: 'Viewer' });
    });

    client2.on('playerJoined', ({ playerName }) => {
      console.log('Client2 saw playerJoined:', playerName);
    });

    // Listen for draw events on viewer
    let receivedDraw = false;
    client2.on('draw', (data) => {
      console.log('Client2 received draw event:', data);
      receivedDraw = true;
      console.log('TEST PASSED: viewer received draw event. Exiting.');
      client1.disconnect();
      client2.disconnect();
      process.exit(0);
    });

    // After a short delay, start the game as host
    await wait(500);
    console.log('Client1 starting game...');
    client1.emit('startGame', roomId);

    // After game starts, emit draw events from client1 (drawer)
    client1.on('gameStarted', async (gameData) => {
      console.log('Client1 received gameStarted');
      // Give server a moment to set up listeners
      await wait(300);
      console.log('Client1 emitting draw events...');
      for (let i = 0; i < 5; i++) {
        client1.emit('draw', {
          roomId,
          x: 0.1 + i * 0.01,
          y: 0.1 + i * 0.01,
          lastX: 0.09 + i * 0.01,
          lastY: 0.09 + i * 0.01,
          drawing: true
        });
        await wait(100);
      }

      // wait a bit for viewer to receive
      await wait(3000);
      if (!receivedDraw) {
        console.error('TEST FAILED: viewer did not receive draw events within timeout.');
        client1.disconnect();
        client2.disconnect();
        process.exit(1);
      }
    });

    // Safety timeout
    setTimeout(() => {
      console.error('TEST FAILED: overall timeout reached.');
      client1.disconnect();
      process.exit(1);
    }, 10000);
  });

  client1.on('error', (err) => {
    console.error('Client1 error:', err);
  });

})();
