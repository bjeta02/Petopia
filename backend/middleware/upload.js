import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "logos/"); // Save to 'logos' folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const clinicName = req.body.name ? req.body.name.replace(/\s+/g, "_").toLowerCase() : "clinic";
        cb(null, `${clinicName}_logo_${Date.now()}${ext}`);
    },
});

const upload = multer({ storage });

export default upload;