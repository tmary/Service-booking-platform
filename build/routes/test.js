"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Resolve path to images directory from project root
const imagesPath = path_1.default.join(process.cwd(), 'public', 'images');
// Use the Router.get method with proper return type
router.get('/:filename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filename = req.params.filename;
        const imagePath = path_1.default.join(imagesPath, filename);
        console.log('Project root:', process.cwd());
        console.log('Images directory:', imagesPath);
        console.log('Testing image path:', imagePath);
        console.log('File exists:', fs_1.default.existsSync(imagePath));
        if (!fs_1.default.existsSync(imagePath)) {
            console.log('Image not found:', imagePath);
            res.status(404).send('Image not found');
            return;
        }
        // Set content type based on file extension
        if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            res.type('image/jpeg');
        }
        else if (filename.endsWith('.png')) {
            res.type('image/png');
        }
        // Stream the file instead of loading it into memory
        const stream = fs_1.default.createReadStream(imagePath);
        stream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).send('Error reading image file');
            }
        });
        stream.pipe(res);
    }
    catch (error) {
        console.error('Error in test-image route:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal server error');
        }
    }
}));
exports.default = router;
