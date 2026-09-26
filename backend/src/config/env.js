const requiredEnvironment = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];

export const validateEnvironment = () => {
  const missing = requiredEnvironment.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};

export const config = {
  get port() {
    return Number(process.env.PORT || 5000);
  },
  get clientUrl() {
    return process.env.CLIENT_URL;
  },
  get jwtSecret() {
    return process.env.JWT_SECRET;
  },
  get mongoUri() {
    return process.env.MONGODB_URI;
  },
};
