import "dotenv/config";
import * as process from "process";

export const ENV = {
  MongoURI: process.env.MONGO_URI,
  Port: parseInt(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  adminSecretToken: process.env.ADMIN_SECRET_TOKEN,
  loginURL: process.env.LOGIN_URL,
  testDomain: process.env.TEST_DOMAIN,
  privateApiKeyEmail: process.env.PRIVATE_API_KEY,
  publicApiKeyEmail: process.env.PUBLIC_API_KEY,
  verifyEmail: process.env.VERIFY_EMAIL,
};
