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

export const uploadToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResponse> => {
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

  /*
   * Cloudinary automatically determines the
   * appropriate resource type for images/audio.
   */

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data =
    (await response.json()) as
      | CloudinaryUploadResponse
      | { error?: { message?: string } };

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