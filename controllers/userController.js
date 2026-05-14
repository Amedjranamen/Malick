const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, email, nationalite, sexe, diplome } = req.body;
        const photoFile = req.file;

        // Chemin de la photo si uploadée
        const photoPath = photoFile ? `/uploads/${photoFile.filename}` : req.body.photo || '';

        const updated = await User.update(id, {
            nom,
            email,
            nationalite,
            sexe,
            diplome,
            photo: photoPath
        });

        if (updated) {
            // Mettre à jour la session avec les nouvelles données
            if (req.session.user && req.session.user.id == id) {
                req.session.user = {
                    ...req.session.user,
                    nom,
                    email,
                    photo: photoPath
                };
            }

            res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
        } else {
            res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.delete(id);

        if (deleted) {
            res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
        } else {
            res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updated = await User.updateRole(id, role);

        if (updated) {
            res.json({ success: true, message: 'Rôle mis à jour avec succès' });
        } else {
            res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
