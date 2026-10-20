import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// @desc    Upload media (single or multiple)
// @route   POST /api/uploads
// @access  Private
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Please attach at least one image or video.',
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const isVideo = file.mimetype.startsWith('video/');
      const mediaType = isVideo ? 'video' : 'image';

      if (isCloudinaryConfigured()) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'aura',
          resource_type: isVideo ? 'video' : 'image',
        });

        uploadedFiles.push({
          url: result.secure_url,
          type: mediaType,
          publicId: result.public_id,
        });
      } else {
        // Local upload storage URL
        const localUrl = `/uploads/${file.filename}`;
        uploadedFiles.push({
          url: localUrl,
          type: mediaType,
          filename: file.filename,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully.',
      files: uploadedFiles,
      url: uploadedFiles[0]?.url, // Convenience field for single-file uploads (e.g. avatar)
    });
  } catch (error) {
    next(error);
  }
};
