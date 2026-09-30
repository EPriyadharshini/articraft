import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

const getCloudinary = () => {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(
      `Cloudinary upload is not configured: missing ${missing.join(", ")}`,
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary;
};

// export const uploadImage = (file) =>
//   new Promise((resolve, reject) => {
//     const uploader = getCloudinary().uploader.upload_stream(
//       { folder: "articraft/products", resource_type: "image" },
//       (error, result) =>
//         error
//           ? reject(error)
//           : resolve({ url: result.secure_url, publicId: result.public_id }),
//     );

//     Readable.from(file.buffer).pipe(uploader);
//   });

export const uploadImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(
        new Error("Invalid uploaded image: file buffer is missing"),
      );
    }

    console.log("Uploading image:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferSize: file.buffer.length,
    });

    const uploader = getCloudinary().uploader.upload_stream(
      {
        folder: "articraft/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
          });

          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    Readable.from(file.buffer).pipe(uploader);
  });

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  await getCloudinary().uploader.destroy(publicId, { resource_type: "image" });
};

console.log({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY?.slice(0, 6) + "...",
  hasSecret: !!process.env.CLOUDINARY_API_SECRET,
});

export const testCloudinary = async () => {
  try {
    const result = await getCloudinary().api.ping();
    console.log("Cloudinary ping:", result);
  } catch (error) {
    console.error("Cloudinary ping failed:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
    });
  }
};