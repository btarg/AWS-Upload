# File Uploading Service

This service acts as a simplified pay-as-you-go alternative to Google Drive / OneDrive / Dropbox etc.

## Tech Stack

- **Frontend**: The frontend is built with Vue.js and Vite. We use Pinia for state management and Tailwind CSS for styling.

- **Backend**: The backend is built with Express.js.

- **Database**: We use PostgreSQL for our database. It stores user data and file data: users have a UUID and their public OAuth ID (Discord account ID) as well as a subscription plan identifier. For encrypted files, we currently store the IV in the database, but not the key.

- **File Uploads**: File uploads are handled with lib-storage and the AWS S3 client v3. We request upload URLs from Backblaze B2 and allow the user to upload multipart files to it.

- **File Downloads** We allow for the user to encrypt files entirely in the browser, and file decryption is also done client-side. We request a temporary signed download URL from B2 and cache the association between that URL and the file's ID in memory.

- **Payments**: We have plans to integrate Stripe for payments.