const requiredEnvironment = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];

export const validateEnvironment = () => {
  const missing = requiredEnvironment.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required core environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate and report external integration configuration states
  const razorpayKeys = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'];
  const missingRazorpay = razorpayKeys.filter((key) => !process.env[key]);
  if (missingRazorpay.length > 0) {
    console.info(`[Config Notice] Razorpay is not configured (missing: ${missingRazorpay.join(', ')}). Payment creation and webhook routes will return configuration errors until configured.`);
  } else {
    console.log('[Config Notice] Razorpay keys and webhook secret are configured.');
  }

  const cloudinaryKeys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingCloudinary = cloudinaryKeys.filter((key) => !process.env[key]);
  if (missingCloudinary.length > 0) {
    console.info(`[Config Notice] Cloudinary is not configured (missing: ${missingCloudinary.join(', ')}). Image upload routes will reject requests until credentials are provided.`);
  } else {
    console.log('[Config Notice] Cloudinary image storage credentials configured.');
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
