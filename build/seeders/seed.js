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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Provider_1 = require("../models/Provider");
const Service_1 = require("../models/Service");
dotenv_1.default.config();
// Generate proper MongoDB ObjectIds
const generateObjectId = () => new mongoose_1.default.Types.ObjectId();
// Pre-generate IDs for providers
const providerIds = Array(7).fill(null).map(() => generateObjectId());
const MOCK_PROVIDERS = [
    {
        _id: providerIds[0],
        name: 'Sarah Johnson',
        businessName: 'Elegant Events Catering',
        description: 'Professional catering service for all occasions. Specializing in corporate events, weddings, and private parties.',
        rating: 4.9,
        location: 'Downtown Area',
        category: 'Catering',
        services: [
            {
                title: 'Corporate Lunch Catering',
                description: 'Professional lunch service for business meetings and corporate events',
                price: 25,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            {
                title: 'Wedding Reception Catering',
                description: 'Full-service wedding catering including appetizers, main course, and desserts',
                price: 75,
                availability: ['Friday', 'Saturday', 'Sunday']
            },
            {
                title: 'Private Party Buffet',
                description: 'Customizable buffet service for private events',
                price: 35,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }
        ]
    },
    {
        _id: providerIds[1],
        name: 'Michael Chen',
        businessName: 'Academic Excellence Tutoring',
        description: 'Expert tutoring in Mathematics, Sciences, and Languages for all academic levels.',
        rating: 4.8,
        location: 'University District',
        category: 'Education',
        services: [
            {
                title: 'Mathematics Tutoring',
                description: 'One-on-one tutoring in algebra, calculus, and statistics',
                price: 45,
                availability: ['Monday', 'Wednesday', 'Friday']
            },
            {
                title: 'Physics & Chemistry',
                description: 'Comprehensive science tutoring for high school and college students',
                price: 50,
                availability: ['Tuesday', 'Thursday', 'Saturday']
            },
            {
                title: 'Language Lessons',
                description: 'Private language tutoring in Mandarin, Spanish, and French',
                price: 40,
                availability: ['Monday', 'Wednesday', 'Friday', 'Saturday']
            }
        ]
    },
    {
        _id: providerIds[2],
        name: 'Robert Wilson',
        businessName: 'PowerPro Electrical Services',
        description: 'Licensed electrician providing comprehensive electrical services for residential and commercial properties.',
        rating: 4.7,
        location: 'Eastside',
        category: 'Electrical',
        services: [
            {
                title: 'Electrical Repairs',
                description: 'Troubleshooting and repair of electrical issues',
                price: 85,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            {
                title: 'New Installation',
                description: 'Installation of new electrical systems and fixtures',
                price: 150,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            {
                title: 'Emergency Services',
                description: '24/7 emergency electrical repair service',
                price: 120,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }
        ]
    },
    {
        _id: providerIds[3],
        name: 'Lisa Thompson',
        businessName: 'Glamour Hair Studio',
        description: 'Expert hair styling and care services for all hair types. Creating beautiful looks for every occasion.',
        rating: 4.9,
        location: 'Fashion District',
        category: 'Hair Care',
        services: [
            {
                title: 'Hair Braiding',
                description: 'Professional braiding services for all hair types',
                price: 80,
                availability: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            {
                title: 'Weaving',
                description: 'Full weave installation and maintenance',
                price: 150,
                availability: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            {
                title: 'Hair Washing & Styling',
                description: 'Professional wash, treatment, and styling service',
                price: 65,
                availability: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            }
        ]
    },
    {
        _id: providerIds[4],
        name: 'Maria Rodriguez',
        businessName: 'Spotless Home Cleaning',
        description: 'Professional residential cleaning services with attention to detail and eco-friendly products.',
        rating: 4.8,
        location: 'Westside',
        category: 'Cleaning',
        services: [
            {
                title: 'Window Cleaning',
                description: 'Interior and exterior window cleaning service',
                price: 80,
                availability: ['Monday', 'Wednesday', 'Friday']
            },
            {
                title: 'Carpet & Floor Cleaning',
                description: 'Deep cleaning of carpets and all types of flooring',
                price: 120,
                availability: ['Monday', 'Tuesday', 'Thursday']
            },
            {
                title: 'Bathroom & Kitchen',
                description: 'Detailed cleaning of bathrooms and kitchen areas',
                price: 100,
                availability: ['Monday', 'Wednesday', 'Friday']
            }
        ]
    },
    {
        _id: providerIds[5],
        name: 'Jennifer Kim',
        businessName: 'Glam Squad Beauty',
        description: 'Professional makeup artistry for weddings, special events, and photo shoots.',
        rating: 4.9,
        location: 'Beauty District',
        category: 'Beauty',
        services: [
            {
                title: 'Bridal Makeup',
                description: 'Complete bridal makeup package including trial session',
                price: 200,
                availability: ['Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            {
                title: 'Special Event Makeup',
                description: 'Professional makeup for parties and special occasions',
                price: 100,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            {
                title: 'Photoshoot Makeup',
                description: 'Camera-ready makeup for professional photo sessions',
                price: 150,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            }
        ]
    },
    {
        _id: providerIds[6],
        name: 'Emily Davis',
        businessName: 'Luxe Nail Spa',
        description: 'Luxury nail care services providing the latest trends in nail art and care.',
        rating: 4.8,
        location: 'Shopping District',
        category: 'Beauty',
        services: [
            {
                title: 'Basic Manicure',
                description: 'Classic manicure with regular polish',
                price: 35,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            {
                title: 'Gel Manicure',
                description: 'Long-lasting gel polish manicure',
                price: 45,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            {
                title: 'Luxury Pedicure',
                description: 'Deluxe pedicure with extended massage',
                price: 60,
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            }
        ]
    }
];
const MOCK_CLIENTS = [
    {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'client123',
        address: '123 Main St, City'
    },
    {
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com',
        password: 'client123',
        address: '456 Oak Ave, City'
    },
    {
        name: 'David Brown',
        email: 'david.brown@example.com',
        password: 'client123',
        address: '789 Pine Rd, City'
    }
];
const createDefaultAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if admin already exists
        const adminExists = yield User_1.User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin account already exists');
            return;
        }
        // Create default admin account
        const hashedPassword = yield bcrypt_1.default.hash('admin123', 10);
        const admin = new User_1.User({
            name: 'System Admin',
            email: 'admin@system.com',
            password: hashedPassword,
            role: 'admin'
        });
        yield admin.save();
        console.log('Default admin account created successfully');
    }
    catch (error) {
        console.error('Error creating admin account:', error);
    }
});
const createServiceProviders = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear existing data
        yield User_1.User.deleteMany({ role: 'provider' });
        yield Provider_1.Provider.deleteMany({});
        yield Service_1.Service.deleteMany({});
        console.log('Cleared existing provider data');
        for (const mockProvider of MOCK_PROVIDERS) {
            try {
                // Generate email from business name
                const email = mockProvider.businessName.toLowerCase().replace(/\s+/g, '.') + '@example.com';
                // Hash the business name as password
                const hashedPassword = yield bcrypt_1.default.hash(mockProvider.businessName, 10);
                // Create User account
                const user = new User_1.User({
                    name: mockProvider.name,
                    email: email,
                    password: hashedPassword,
                    role: 'provider'
                });
                yield user.save();
                console.log(`Created user account for ${mockProvider.name}`);
                // Create Provider account
                const provider = new Provider_1.Provider({
                    _id: mockProvider._id,
                    name: mockProvider.name,
                    email: email,
                    password: hashedPassword,
                    businessName: mockProvider.businessName,
                    description: mockProvider.description,
                    rating: mockProvider.rating,
                    location: mockProvider.location,
                    category: mockProvider.category,
                    services: [] // Initialize empty services array
                });
                yield provider.save();
                console.log(`Created provider account for ${mockProvider.businessName}`);
                // Create Services and update provider
                const serviceIds = [];
                for (const mockService of mockProvider.services) {
                    const service = new Service_1.Service({
                        providerId: provider._id,
                        title: mockService.title,
                        description: mockService.description,
                        price: mockService.price,
                        availability: mockService.availability
                    });
                    const savedService = yield service.save();
                    serviceIds.push(savedService._id);
                    console.log(`Created service: ${mockService.title}`);
                }
                // Update provider with service IDs
                yield Provider_1.Provider.findByIdAndUpdate(provider._id, {
                    $set: { services: serviceIds }
                });
                console.log(`Updated provider ${mockProvider.businessName} with service IDs`);
            }
            catch (error) {
                console.error(`Error processing provider ${mockProvider.name}:`, error);
            }
        }
        console.log('All service providers and their services created successfully');
    }
    catch (error) {
        console.error('Error creating service providers:', error);
    }
});
const createTestClients = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear existing clients
        yield User_1.User.deleteMany({ role: 'client' });
        console.log('Cleared existing client data');
        // Create new test clients
        for (const mockClient of MOCK_CLIENTS) {
            const hashedPassword = yield bcrypt_1.default.hash(mockClient.password, 10);
            const client = new User_1.User({
                name: mockClient.name,
                email: mockClient.email,
                password: hashedPassword,
                role: 'client',
                address: mockClient.address
            });
            yield client.save();
            console.log(`Created client account for ${mockClient.name}`);
        }
        console.log('All test clients created successfully');
    }
    catch (error) {
        console.error('Error creating test clients:', error);
    }
});
// Run the seeders
const runSeeders = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        yield createDefaultAdmin();
        yield createServiceProviders();
        yield createTestClients();
        console.log('All seeding completed successfully');
    }
    catch (error) {
        console.error('Error during seeding:', error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
});
runSeeders();
