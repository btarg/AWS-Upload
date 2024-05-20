import { Server } from 'socket.io';
let io;

export const initializeSocket = async (httpServer) => {
    try {
        if (!io) {
            io = new Server(httpServer);
        }
        return io;
    } catch (error) {
        console.error('Error initializing socket', error);
    }
};

export const getIo = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized. Please call initializeSocket first.');
    }
    return io;
};