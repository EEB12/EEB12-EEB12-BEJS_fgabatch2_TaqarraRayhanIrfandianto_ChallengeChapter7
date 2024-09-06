const prisma = require('../config/prisma')
const ImageKit = require('imagekit');
const dotenv = require('dotenv');

dotenv.config();

const multer = require('multer');
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadImage = async (req, res) => {
    const { title, description } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }

    try {
        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
        });

        const image = await prisma.image.create({
            data: {
                title,
                description,
                imageUrl: uploadResponse.url,
            },
        });

        res.status(201).json(image);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all uploaded images
const getImages = async (req, res) => {
    try {
        const images = await prisma.image.findMany();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get image details by ID
const getImageById = async (req, res) => {
    const { id } = req.params;

    try {
        const image = await prisma.image.findUnique({
            where: { id: parseInt(id) },
        });

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update image title and description
const updateImage = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
        const updatedImage = await prisma.image.update({
            where: { id: parseInt(id) },
            data: { title, description },
        });

        res.status(200).json(updatedImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an image
const deleteImage = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedImage = await prisma.image.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: 'Image deleted successfully', deletedImage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadImage, getImages, getImageById, updateImage, deleteImage, upload };
