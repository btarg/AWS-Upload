const fileModel = require('../models/fileModel');
const userModel = require('../models/userModel');

const initializeDatabase = async () => {
    try {
        await fileModel.createFileTable();
        await userModel.createUserTable();
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database', error);
    }
};
module.exports = { initializeDatabase };