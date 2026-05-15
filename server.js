const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDB, getPool, dbType } = require('./config/database');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Dossier uploads créé');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialiser la base de données AVANT de configurer le session store
initDB().then(() => {
    // Session store configuration (après l'initialisation de la DB)
    let sessionStore;
    if (dbType === 'postgresql' && process.env.NODE_ENV === 'production') {
        const pgSession = require('connect-pg-simple')(session);
        sessionStore = new pgSession({
            pool: getPool(),
            tableName: 'session'
        });
    }

    app.use(session({
        secret: process.env.SESSION_SECRET || 'secret-key',
        resave: false,
        saveUninitialized: false,
        store: sessionStore || undefined,
        cookie: { 
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }
    }));

    // View engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Routes
    const authRoutes = require('./routes/auth');
    const userRoutes = require('./routes/users');
    const campagneRoutes = require('./routes/campagnes');

    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/campagnes', campagneRoutes);

    // Routes principales
    app.get('/', (req, res) => {
        if (req.session.user) {
            return res.redirect('/dashboard');
        }
        res.redirect('/login');
    });

    app.get('/login', (req, res) => {
        res.render('login');
    });

    app.get('/register', (req, res) => {
        res.render('register');
    });

    app.get('/verify', (req, res) => {
        const email = req.query.email;
        const code = req.query.code;
        res.render('verify', { email, code });
    });

    app.get('/dashboard', async (req, res) => {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.redirect('/login');
        }
        try {
            const users = await User.getAll();
            const Campagne = require('./models/Campagne');
            const campagnes = await Campagne.getAll();
            res.render('dashboard', { users, campagnes });
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            res.render('dashboard', { users: [], campagnes: [] });
        }
    });

    app.get('/profile', async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        try {
            const user = await User.findById(req.session.user.id);
            res.render('profile', { user });
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.render('profile', { user: req.session.user });
        }
    });

    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
});
