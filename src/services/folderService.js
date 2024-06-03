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
  // Modify the SQL query to handle null parent_folder_id
  let { rows } = await pool.query(`
    SELECT * FROM folders 
    WHERE name = $1 AND userid = $2 AND (parent_folder_id = $3 OR (parent_folder_id IS NULL AND $3 IS NULL))
  `, [name, userId, parentFolderId]);

  // If the folder doesn't exist, create it
  if (rows.length === 0) {
    const folderId = await insertFolder(name, userId, parentFolderId);
    return folderId;
  }

  // If the folder exists, return its ID
  return rows[0].id;
}

export async function getFolderWithSubfoldersAndFiles(folderId, userId) {
    const query = `
        WITH folder AS (
            SELECT id::text, name, parent_folder_id::text, NULL AS userid, NULL AS folderid, NULL AS fileid, NULL AS filename, NULL AS filehash, NULL::bigint AS filesize, NULL::timestamp AS uploaddate, NULL::jsonb AS encryptiondata, NULL AS healthpoints, 'folder' as type FROM folders WHERE id = $1
        ), subfolders AS (
            SELECT id::text, name, parent_folder_id::text, NULL AS userid, NULL AS folderid, NULL AS fileid, NULL AS filename, NULL AS filehash, NULL::bigint AS filesize, NULL::timestamp AS uploaddate, NULL::jsonb AS encryptiondata, NULL AS healthpoints, 'subfolder' as type FROM folders WHERE parent_folder_id = $1
        ), files AS (
            SELECT fileid::text as id, filename AS name, folderid AS parent_folder_id, userid, folderid, fileid, filename, filehash, filesize, uploaddate, encryptiondata, healthpoints, 'file' as type FROM files WHERE folderid = $1 AND userid = $2
        )
        SELECT * FROM folder
        UNION ALL
        SELECT * FROM subfolders
        UNION ALL
        SELECT * FROM files;
    `;
    const { rows } = await pool.query(query, [folderId, userId]);
    return rows;
}
export async function getFolderById(folderId) {
    const { rows } = await pool.query('SELECT * FROM folders WHERE id = $1', [folderId]);
    return rows[0];
}

export async function getOrCreateFolders(folderString, userId) {
  if (!folderString) {
    return null;
  }

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