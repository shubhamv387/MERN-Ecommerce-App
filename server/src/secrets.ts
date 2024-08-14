export const PORT: number = parseInt(process.env.PORT!, 10) || 3000
export const NODE_ENV: string = process.env.NODE_ENV!
export const MONGO_URL: string = process.env.MONGO_URL!
export const MONGO_URI_TEST: string = process.env.MONGO_URI_TEST! // Specially for testing using a different database i.e. local database
export const JWT_ACCESS_TOKEN_SECRET_KEY: string = process.env.JWT_ACCESS_TOKEN_SECRET_KEY!
export const JWT_REFRESH_TOKEN_SECRET_KEY: string = process.env.JWT_REFRESH_TOKEN_SECRET_KEY!
export const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY!
export const BREVO_API_KEY: string = process.env.BREVO_API_KEY!
