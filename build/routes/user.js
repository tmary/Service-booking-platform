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
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const router = express_1.default.Router();
// Register route
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, address, role } = req.body;
        // Check if user already exists
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }
        // Prevent creation of admin accounts through registration
        if (role === 'admin') {
            res.status(403).json({ message: 'Cannot create admin accounts through registration' });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create user in MongoDB
        const user = new User_1.User({
            name,
            email,
            password: hashedPassword,
            address,
            role: role && ['client', 'provider'].includes(role) ? role : 'client'
        });
        const savedUser = yield user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: savedUser._id, email: savedUser.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // Send user data with token
        const userResponse = {
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            token
        };
        res.status(201).json(userResponse);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: error.message });
    }
}));
// Login route
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Verify password
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Debug log
        console.log('Login attempt:', {
            userId: user._id,
            email: user.email,
            role: user.role
        });
        // Generate JWT token
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        };
        console.log('Token payload:', tokenPayload);
        const token = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '24h',
            algorithm: 'HS256'
        });
        // Debug log
        console.log('Generated token length:', token.length);
        // Send user data with token
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        };
        res.json(userResponse);
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid email or password' });
    }
}));
// Protected route - Get all users (admin only)
router.get('/', auth_1.auth, (0, roleAuth_1.requireRole)(['admin']), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.find().select('-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Protected route - Get user by ID (admin or own profile)
router.get('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Allow users to access their own profile or admins to access any profile
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== req.params.id && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            res.status(403).json({ message: 'Not authorized to access this user profile' });
            return;
        }
        const user = yield User_1.User.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Protected route - Update user (admin or own profile)
router.put('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { name, address, role, password } = req.body;
        // Check if user is updating their own profile or is an admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) !== req.params.id && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            res.status(403).json({ message: 'Not authorized to update this user' });
            return;
        }
        // Only admins can change roles
        if (role && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            res.status(403).json({ message: 'Only admins can change user roles' });
            return;
        }
        // Prepare update data
        const updateData = { name, address };
        if (role && ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) === 'admin') {
            updateData.role = role;
        }
        // If password is being updated, hash it
        if (password) {
            updateData.password = yield bcrypt_1.default.hash(password, 10);
        }
        // Update in MongoDB
        const updatedUser = yield User_1.User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Protected route - Delete user (admin only)
router.delete('/:id', auth_1.auth, (0, roleAuth_1.requireRole)(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield User_1.User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
