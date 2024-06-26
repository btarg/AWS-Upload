import dotenv from 'dotenv';
dotenv.config();
export const monthlyCostPerTBInCredits = process.env.MONTHLY_COST_PER_TB_IN_CREDITS || 1000;
export const monthlyCostPerTBInUSD = monthlyCostPerTBInCredits * 100; // 1 credit = 1 cent