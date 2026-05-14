const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./config/database');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const campagneRoutes = require('./routes/campagnes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campagnes', campagneRoutes);

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/verify', (req, res) => {
    res.render('verify');
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user });
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

// Initialisation de la base de données et démarrage du serveur
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
});
