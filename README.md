# Database Operations

This service uses PostgreSQL for its database operations. The database is used to store metadata about the files, including their IDs, the IDs of the users who uploaded them, their filenames, their hashes, their upload dates, and their expiration dates.

## Files Table

The service uses a table named `files` to store the file metadata. The table is created if it doesn't exist when the service starts. Here's the structure of the `files` table:

- `id` - the primary key of the record
- `fileId` - the ID of the file (a randomly generated unique identifier)
- `guildId` - the ID of the Discord server which the file is associated with
- `userId` - the ID of the Discord user who uploaded the file
- `filename` - the original name (and extension) of the file
- `fileHash` - the SHA-1 hash of the file
- `uploadDate` - the date and time when the file was uploaded
- `expiresAt` - the date and time when the file will expire

## Database Functions

The service provides several functions for interacting with the `files` table:

- `createFileTable` - creates the `files` table if it doesn't exist
- `insertFile` - inserts a new file record and returns its ID
- `getExpiredFiles` - gets all files that have expired
- `deleteFile` - deletes a file record

These functions are exported from the `database.js` module and can be used throughout the service.