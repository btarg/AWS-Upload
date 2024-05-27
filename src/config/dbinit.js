import { createFileTable } from '../models/fileModel.js';
import { createUserTable } from '../models/userModel.js';
import { createFolderTable } from '../models/folderModel.js';

export const initializeDatabase = async () => {
    try {
        console.log("Creating tables...");
        await createUserTable();
        await createFolderTable();
        await createFileTable();
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database', error);
    }
};
