import pool from '../config/database.js';
import { decreaseHealthPointsAndRemoveDecayedFiles } from './fileService.js';
import { monthlyCostPerTBInCredits } from '../config/costs.js';

// Decrease credits for all users every hour.
// If a user has 0 credits, decrease all their files' health points
// and remove decayed files.
export const decreaseCredits = async () => {
    // Decrease credits for all users and get users with 0 credits
    const usersWithZeroCredits = await updateCreditsForAllUsers();

    // For each user with 0 credits, decrease all their files' health points and remove decayed files
    for (const user of usersWithZeroCredits) {
        await decreaseHealthPointsAndRemoveDecayedFiles(user.id);
    }
};

// Run decreaseCredits every hour
setInterval(decreaseCredits, 60 * 60 * 1000);

const updateCreditsForAllUsers = async () => {
    console.log("Updating credits for all users");
    const hourlyCostPerTBInCredits = Math.round((monthlyCostPerTBInCredits / 30 / 24) * 100000) / 100000; // Hourly cost for 1TB in credits, rounded to the nearest 0.00001
    const bytesPerTB = 1024 * 1024 * 1024 * 1024;
    const maxBytesUsed = 1e12; // Cap the bytesUsed field to avoid numeric field overflow

    const query = `
        UPDATE users 
        SET data = jsonb_set(data, '{credits}', to_jsonb(GREATEST(0, (data->>'credits')::DECIMAL(20,10) - (LEAST(data->>'bytesUsed', $1)::NUMERIC / $2 * $3)::DECIMAL(20,10))))
        RETURNING *  
    `;

    const { rows } = await pool.query(query, [maxBytesUsed, bytesPerTB, hourlyCostPerTBInCredits]);
    return rows;
};