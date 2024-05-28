import { insertFolder } from '../models/folderModel.js';
import pool from '../config/database.js';

export async function getAllFolders(userId) {
  const { rows } = await pool.query('SELECT * FROM folders WHERE userid = $1', [userId]);
  return rows;
}

export async function getRootFolders(userId) {
  const { rows } = await pool.query('SELECT * FROM folders WHERE userid = $1 AND parent_folder_id IS NULL', [userId]);
  return rows;
}

export async function getSubFolders(folderId) {
  const { rows } = await pool.query('SELECT * FROM folders WHERE parent_folder_id = $1', [folderId]);
  return rows;
}

export async function getOrCreateFolder(name, userId, parentFolderId = null) {
  // Try to get the folder from the database
  let { rows } = await pool.query('SELECT * FROM folders WHERE name = $1 AND userid = $2 AND parent_folder_id = $3', [name, userId, parentFolderId]);

  // If the folder doesn't exist, create it
  if (rows.length === 0) {
    const folderId = await insertFolder(name, userId, parentFolderId);
    return folderId;
  }

  // If the folder exists, return its ID
  return rows[0].id;
}
export async function getFolderById(folderId) {
    const { rows } = await pool.query('SELECT * FROM folders WHERE id = $1', [folderId]);
    return rows[0];
}
export async function getOrCreateFolders(folderString, userId) {
  const folderNames = folderString.split('/');
  let parentFolderId = null;

  for (let name of folderNames) {
    // remove unallowed characters
    name = name.replace(/[^a-z0-9]/gi, '');
    if (name.length > 0) {
      parentFolderId = await getOrCreateFolder(name, userId, parentFolderId);
    }
  }

  // Return the ID of the last folder
  return parentFolderId;
}