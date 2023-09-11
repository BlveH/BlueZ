import "dotenv/config";
import * as process from "process";

export const ENV = {
  MongoURI: process.env.MONGO_URI,
  Port: parseInt(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  adminSecretToken: process.env.ADMIN_SECRET_TOKEN,
  loginURL: process.env.LOGIN_URL,
  testDomain: process.env.MAILGUN_TEST_DOMAIN,
  privateApiKeyEmail: process.env.MAILGUN_PRIVATE_API_KEY,
  publicApiKeyEmail: process.env.MAILGUN_PUBLIC_API_KEY,
  verifyEmail: process.env.MAILGUN_VERIFY_EMAIL,
  cloud_name: process.env.CLOUD_NAME,
  cloud_api_key: process.env.CLOUD_API_KEY,
  cloud_api_secret: process.env.CLOUD_API_SECRET,
  cloud_folder_path: process.env.CLOUD_FOLDER_PATH,
  cluod_public_id_prefix: process.env.CLOUD_PUBLIC_ID_PREFIX,
  cloud_big_size: process.env.CLOUD_BIG_SIZE,
  stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_success_url: process.env.STRIPE_SUCCESS_URL,
  stripe_cancel_url: process.env.STRIPE_CANCEL_URL,
  webhook_secret: process.env.WEBHOOK_SECRET,
  appPrefix: process.env.APP_PREFIX,
};
