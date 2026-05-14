const express = require('express');
const router = express.Router();
const campagneController = require('../controllers/campagneController');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour les uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    next();
};

router.post('/', isAdmin, upload.single('piece_jointe'), campagneController.createCampagne);
router.get('/', isAdmin, campagneController.getAllCampagnes);
router.delete('/:id', isAdmin, campagneController.deleteCampagne);

module.exports = router;
