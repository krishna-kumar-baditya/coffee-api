const multer = require("multer");
const path = require("path");
const fs = require("fs");

class FileUploader {
    constructor({
        folderName = "uploads",
        supportedFiles = ["image/png", "image/jpg", "image/jpeg"],
        fileSize = 1024 * 1024 * 2, // renamed from fieldSize
    }) {
        this.folderName = folderName;
        this.supportedFiles = supportedFiles;
        this.fileSize = fileSize;

        // Create uploads folder if not exists
        if (!fs.existsSync(this.folderName)) {
            fs.mkdirSync(this.folderName, { recursive: true });
        }
    }

    storage() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.folderName);
            },
            filename: (req, file, cb) => {
                let ext = path.extname(file.originalname);
                console.log("extension ",ext);
                
                 
                
                cb(null, Date.now() + "AM" + ext);
            },
        });
    }

    fileFilter() {
        return (req, file, cb) => {
            if (this.supportedFiles.includes(file.mimetype)) {
                cb(null, true);
            } else {
                req.fileValidationError = `Unsupported file format. Supported formats: ${this.supportedFiles.join(", ")}`;
                cb(null, false);
            }
        };
    }

    upload() {
        return multer({
            storage: this.storage(),
            fileFilter: this.fileFilter(),
            limits: {
                fileSize: this.fileSize, // Correct option name is fileSize
            },
        });
    }
}

// Export class itself so we can instantiate it in routes
module.exports = FileUploader;