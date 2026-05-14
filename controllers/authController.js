const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../config/mailer');

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { nom, email, nationalite, sexe, mot_de_passe, diplome } = req.body;
        const photoFile = req.file;

        // Vérifier si l'email existe déjà
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cet email est déjà utilisé' 
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // Générer le code de vérification
        const verificationCode = generateVerificationCode();

        // Chemin de la photo si uploadée
        const photoPath = photoFile ? `/uploads/${photoFile.filename}` : '';

        // Créer l'utilisateur
        const userId = await User.create({
            nom,
            email,
            nationalite,
            sexe,
            mot_de_passe: hashedPassword,
            diplome,
            photo: photoPath,
            verification_code: verificationCode
        });

        // Envoyer l'email de vérification
        const emailSent = await sendVerificationEmail(email, verificationCode);

        if (emailSent) {
            res.status(201).json({ 
                success: true, 
                message: 'Inscription réussie. Vérifiez votre email pour le code de confirmation.',
                email: email
            });
        } else {
            // En cas d'échec SMTP, permettre quand même l'inscription avec le code affiché
            res.status(201).json({ 
                success: true, 
                message: `Inscription réussie. Code de vérification: ${verificationCode} (SMTP non configuré)`,
                email: email,
                verificationCode: verificationCode
            });
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de l\'inscription' 
        });
    }
};

exports.verify = async (req, res) => {
    try {
        const { email, code } = req.body;

        const verified = await User.verifyEmail(email, code);

        if (verified) {
            res.json({ 
                success: true, 
                message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Code de vérification invalide ou expiré' 
            });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la vérification' 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        if (!user.is_verified) {
            return res.status(400).json({ 
                success: false, 
                message: 'Veuillez d\'abord vérifier votre email' 
            });
        }

        const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Créer la session
        req.session.user = {
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            photo: user.photo
        };

        res.json({ 
            success: true, 
            message: 'Connexion réussie',
            redirect: user.role === 'admin' ? '/dashboard' : '/profile'
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la connexion' 
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de la déconnexion' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Déconnexion réussie',
            redirect: '/login'
        });
    });
};
