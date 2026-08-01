// src/config/env.js


import dotenv from 'dotenv';


dotenv.config();


const requiredEnvVars = ['PORT', 'DATABASE_URL'];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {

    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Check your .env file against .env.example.`
    );
  }
}

validateEnv();


export const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL,
};
