const cron = require('node-cron');
const s3 = require('../config/s3');
const fileModel = require('../models/fileModel');

cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    try {
        const expiredFiles = await fileModel.getExpiredFiles(now);

        for (const file of expiredFiles) {
            const s3Key = `${file.guildId}/${file.userId}/${file.filename}`;
            const deleteParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: s3Key,
            };
            await s3.deleteObject(deleteParams).promise();
            await fileModel.deleteFile(file.fileId);
            console.log(`Deleted file: ${file.filename}`);
        }
    } catch (error) {
        console.error('Error deleting expired files', error);
    }
});
