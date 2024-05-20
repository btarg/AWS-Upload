import { createFileTable } from '../models/fileModel.js';
import { createUserTable } from '../models/userModel.js';

export const initializeDatabase = async () => {
    try {
        console.log("Creating tables...");
        await createFileTable();
        await createUserTable();
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database', error);
    }
};
