import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "logos/"); // Save to 'logos' folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, path.extname(file.originalname)).replace(/\s+/g, "_").toLowerCase();
        cb(null, `${baseName}_${Date.now()}${path.extname(file.originalname)}`);        
    },
});

const upload = multer({ storage });

export default upload;