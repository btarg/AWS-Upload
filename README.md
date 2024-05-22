# File Uploading Service

This is a file uploading service built with a modern tech stack. The service allows users to upload files, and it provides progress bars for uploads. It also has plans to integrate Stripe for payments.

## Tech Stack

- **Frontend**: The frontend is built with Vue.js and Vite. We use Pinia for state management and Tailwind CSS for styling. We also use vueUse for utility functions.

- **Backend**: The backend is built with Express.js. It handles API requests and communicates with the database.

- **Database**: We use PostgreSQL for our database. It stores user data and other necessary information.

- **File Uploads**: File uploads are handled with lib-storage and the AWS S3 client v3. We upload files in parts using Formidable, which takes the files from the Vue.js frontend.

- **Real-Time Communication**: We use Socket.IO for real-time communication between the client and the server. This is used for features like progress bars.

- **Payments**: We have plans to integrate Stripe for payments.