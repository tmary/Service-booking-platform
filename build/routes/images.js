"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const publicPath = path_1.default.resolve(process.cwd(), 'public');
router.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path_1.default.join(publicPath, 'images', filename);
    console.log('Requested image:', filename);
    console.log('Full image path:', imagePath);
    console.log('File exists:', fs_1.default.existsSync(imagePath));
    if (!fs_1.default.existsSync(imagePath)) {
        console.log('Image not found:', imagePath);
        res.status(404).send('Image not found');
        return;
    }
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    // Send the file with proper content type detection
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            if (!res.headersSent) {
                res.status(500).send('Error sending image file');
            }
        }
        else {
            console.log('File sent successfully:', filename);
        }
    });
});
exports.default = router;
