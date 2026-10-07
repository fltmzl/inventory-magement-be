export const constant = {
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.APP_URL || '',
  MAIL: {
    HOST: process.env.MAIL_HOST,
    USER: process.env.MAIL_USER,
    PASSWORD: process.env.MAIL_PASSWORD,
  },
};
