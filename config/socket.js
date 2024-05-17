const socketIo = require('socket.io');
let io;

const initializeSocket = async (server) => {
    try {
        if (!io) {
            io = socketIo(server);
        }
        return io;
    } catch (error) {
        console.error('Error initializing socket', error);
    }
};

const getIo = () => {
    if (!io) {
        console.error('Socket.io has not been initialized. Please call initializeSocket first.');
    }
    return io;
};

module.exports = { initializeSocket, getIo };