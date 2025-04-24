import multer from "multer";
import path from "path";

const petStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "pet_avatars"); // Folder specifically for pet avatars
    },
    filename: function (req, file, cb) {
        const { id } = req.params; // Get the pet ID from the request parameters
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // Use the pet ID in the filename
        cb(null, `${id}-${uniqueSuffix}-${file.originalname}`);
    },
});

const petFileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, JPG, and PNG files are allowed for pet avatars."), false);
    }
};

export const petAvatarUpload = multer({ storage: petStorage, fileFilter: petFileFilter });
