const fs = require("fs");
const path = require("path");
class FileDeleter {
    constructor(baseFolder) {
        this.baseFolder = path.join(__dirname, "..", baseFolder);
        this.ensureFolderExists();
    }
    ensureFolderExists() {
        if (!fs.existsSync(this.baseFolder)) {
            console.warn(`Base folder does not exist : ${this.baseFolder}`);
        }
    }
    deleteSingle(fileName) {
        try {
            return new Promise((resolve, reject) => {
                if (!fileName) {
                    console.log("No old file is deleted.");
                    return resolve();
                }
                const filePath = path.join(this.baseFolder, fileName);
                console.log("File to be deleted : ", filePath);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(
                                `❌ Failed to delete file: ${fileName}`,
                                err
                            );
                            return reject(err);
                        }
                        console.log(`✅ Successfully deleted: ${fileName}`);
                        resolve();
                    });
                } else {
                    console.warn(`⚠️ File not found for deletion: ${fileName}`);
                    resolve(); // Still resolve, since it's not an error if file doesn't exist
                }
            });
        } catch (error) {
            throw error;
        }
    }
    deleteMultiple(fileNames) {
        if (!Array.isArray(fileNames) || fileNames.length === 0) {
            console.log("No files provided for deletion.");
            return Promise.resolve();
        }

        // Return a promise that waits for all deletions
        return Promise.all(
            fileNames.map((fileName) => this.deleteSingle(fileName))
        )
            .then(() => {
                console.log(`🗑️  Deleted ${fileNames.length} file(s)`);
            })
            .catch((err) => {
                console.error("Error during bulk deletion:", err);
                throw err; // Propagate error if needed
            });
    }
}
module.exports = FileDeleter;