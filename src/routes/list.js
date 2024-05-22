import express from 'express';
import { getAllUsers } from '../models/userModel.js';
import { adminAuth } from './admin.js';
import pool from '../config/database.js';

const router = express.Router();


const listFiles = async () => {
    const query = `
    SELECT * FROM files;
  `;

    const { rows } = await pool.query(query);
    return rows;
};

router.get('/files', adminAuth, async (req, res) => {
    try {
        const files = await listFiles();
        res.json(files);
    } catch (error) {
        console.error('Error listing files', error);
        res.status(500).json({ error: 'Error listing files' });
    }
});
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        console.error('Error listing users', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;