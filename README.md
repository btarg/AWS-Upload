# File Uploading Service

This service acts as a simplified pay-as-you-go alternative to Google Drive / OneDrive / Dropbox etc.

## Tech Stack

- **Frontend**: The frontend is built with Vue.js and Vite. We use Pinia for state management and Tailwind CSS for styling. DropZone.js is used for file uploading.

- **Backend**: The backend is built with Express.js.

- **Database**: We use PostgreSQL for our database. It stores user data and other necessary information.

- **File Uploads**: File uploads are handled with lib-storage and the AWS S3 client v3. We upload files in parts using Formidable to BackBlaze B2 using the S3-compatible API.

- **Payments**: We have plans to integrate Stripe for payments.