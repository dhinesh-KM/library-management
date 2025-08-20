import { config } from 'dotenv'
import path from 'path'

// Determine the environment and load the appropriate .env file
const env = process.env.NODE_ENV || 'dev'
// config({ path: `.env.${env}`})

export const port = process.env.PORT
export const mongoURI = process.env.MONGO_URI_LOCAL
export const secretKey = process.env.SECRETKEY
