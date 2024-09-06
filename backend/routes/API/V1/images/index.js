const express = require('express');
const { uploadImage, getImages, getImageById, updateImage, deleteImage, upload } = require('../../../../controllers/images.controller')

const router = express.Router();

router.post('/upload', upload.single('image'), uploadImage);
router.get('/', getImages);
router.get('/find/:id', getImageById);
router.put('/update/:id', updateImage);
router.delete('/delete/:id', deleteImage);

module.exports = router;