const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Initialisation de la base de données
const initDB = async () => {
    try {
        // Création de la table utilisateurs
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS utilisateurs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                nationalite VARCHAR(50) NOT NULL,
                sexe ENUM('homme', ' femme', 'autre') NOT NULL,
                mot_de_passe VARCHAR(255) NOT NULL,
                diplome VARCHAR(100) NOT NULL,
                photo VARCHAR(255),
                verification_code VARCHAR(6),
                is_verified BOOLEAN DEFAULT FALSE,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Création de la table campagnes
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS campagnes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NOT NULL,
                sujet VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                piece_jointe VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES utilisateurs(id)
            )
        `);

        console.log('Base de données initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
};

module.exports = { promisePool, initDB };
