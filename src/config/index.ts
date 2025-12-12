import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  salt_round: process.env.SALT_ROUND,
  reset_pass_secret: process.env.RESET_PASS_TOKEN,
  reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  jwt_secret: process.env.JWT_SECRET,
  refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
  expires_in: process.env.EXPIRES_IN,

  frontend_url: process.env.CLIENT_URL,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
    reset_pass_link: process.env.RESET_PASS_LINK,
  },
  stripe: {
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  },
  cloudinary: {
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  },
};
