interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  original_filename?: string;
  format?: string;
  bytes?: number;
  duration?: number;
}

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


console.log("Cloudinary Cloud Name:", CLOUDINARY_CLOUD_NAME);
console.log("Cloudinary Upload Preset:", CLOUDINARY_UPLOAD_PRESET);

export const uploadToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResponse> => {
  console.log("===== CLOUDINARY UPLOAD START =====");
  console.log("File:", file.name);
  console.log("File type:", file.type);
  console.log("File size:", file.size);
  console.log("Cloud name:", CLOUDINARY_CLOUD_NAME);
  console.log("Upload preset:", CLOUDINARY_UPLOAD_PRESET);

  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "Cloudinary cloud name is not configured."
    );
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary upload preset is not configured."
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  console.log("Cloudinary upload URL:", uploadUrl);

  const response = await fetch(
    uploadUrl,
    {
      method: "POST",
      body: formData,
    }
  );

  const data =
    (await response.json()) as
      | CloudinaryUploadResponse
      | { error?: { message?: string } };

  console.log("Cloudinary response:", data);

  if (!response.ok) {
    const errorMessage =
      "error" in data
        ? data.error?.message
        : undefined;

    throw new Error(
      errorMessage ||
        "Failed to upload file to Cloudinary."
    );
  }

  return data as CloudinaryUploadResponse;
};