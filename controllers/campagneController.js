const Campagne = require('../models/Campagne');

exports.createCampagne = async (req, res) => {
    try {
        const { admin_id, sujet, message, piece_jointe } = req.body;

        const campagneId = await Campagne.create({
            admin_id,
            sujet,
            message,
            piece_jointe
        });

        res.status(201).json({ 
            success: true, 
            message: 'Campagne créée avec succès',
            campagneId 
        });
    } catch (error) {
        console.error('Erreur lors de la création de la campagne:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getAllCampagnes = async (req, res) => {
    try {
        const campagnes = await Campagne.getAll();
        res.json({ success: true, campagnes });
    } catch (error) {
        console.error('Erreur lors de la récupération des campagnes:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.deleteCampagne = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Campagne.delete(id);

        if (deleted) {
            res.json({ success: true, message: 'Campagne supprimée avec succès' });
        } else {
            res.status(404).json({ success: false, message: 'Campagne non trouvée' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la campagne:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
