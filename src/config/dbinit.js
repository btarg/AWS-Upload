import { createFileTable, createFileIdIndex } from '../models/fileModel.js';
import { createUserTable, createUserIdIndex } from '../models/userModel.js';
import { createFolderTable } from '../models/folderModel.js';

export const initializeDatabase = async () => {
    try {
        console.log("Creating tables...");
        await createUserTable();
        // index user id
        await createUserIdIndex();
        await createFolderTable();
        await createFileTable();
        // create an index for fileId since we query it often
        await createFileIdIndex();
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database', error);
    }
};
