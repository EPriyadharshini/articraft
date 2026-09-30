import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_API_KEY);
console.log("Secret exists:", !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

try {
  const result = await cloudinary.uploader.upload("./heart.jpg", {
    folder: "articraft/products",
  });

  console.log("UPLOAD SUCCESS");
  console.log(result.secure_url);
} catch (error) {
  console.error("UPLOAD FAILED");
  console.error({
    message: error.message,
    http_code: error.http_code,
    name: error.name,
  });
}
