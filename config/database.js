const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');

// Déterminer le type de base de données à utiliser
const dbType = process.env.DB_TYPE || 'mysql';

let pool;

if (dbType === 'postgresql') {
    // Configuration PostgreSQL (pour Render)
    pool = new PgPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
} else {
    // Configuration MySQL (par défaut)
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

async function initDB() {
    try {
        if (dbType === 'postgresql') {
            await initPostgreSQL();
        } else {
            await initMySQL();
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    }
}

async function initMySQL() {
    const connection = await pool.getConnection();
    
    // Créer la base de données si elle n'existe pas
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    // Créer la table utilisateurs
    await connection.query(`
        CREATE TABLE IF NOT EXISTS utilisateurs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            nationalite VARCHAR(100),
            sexe VARCHAR(20),
            mot_de_passe VARCHAR(255) NOT NULL,
            diplome VARCHAR(255),
            photo TEXT,
            verification_code VARCHAR(10),
            is_verified BOOLEAN DEFAULT FALSE,
            role ENUM('user', 'admin') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Créer la table campagnes
    await connection.query(`
        CREATE TABLE IF NOT EXISTS campagnes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titre VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            fichier_joint VARCHAR(255),
            envoye_par INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (envoye_par) REFERENCES utilisateurs(id)
        )
    `);
    
    // Créer un utilisateur admin par défaut
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(`
        INSERT INTO utilisateurs (nom, email, nationalite, sexe, mot_de_passe, role, is_verified)
        VALUES ('Admin', 'admin@example.com', 'Française', 'autre', ?, 'admin', TRUE)
        ON DUPLICATE KEY UPDATE email = email
    `, [hashedPassword]);
    
    connection.release();
    console.log('Base de données MySQL initialisée avec succès');
}

async function initPostgreSQL() {
    // Attendre que la base de données soit disponible
    let retries = 5;
    while (retries > 0) {
        try {
            await pool.query('SELECT NOW()');
            break;
        } catch (error) {
            console.log(`Tentative de connexion à PostgreSQL... (${retries} restantes)`);
            retries--;
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    // Créer la table utilisateurs
    await pool.query(`
        CREATE TABLE IF NOT EXISTS utilisateurs (
            id SERIAL PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            nationalite VARCHAR(100),
            sexe VARCHAR(20),
            mot_de_passe VARCHAR(255) NOT NULL,
            diplome VARCHAR(255),
            photo TEXT,
            verification_code VARCHAR(10),
            is_verified BOOLEAN DEFAULT FALSE,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Créer la table campagnes
    await pool.query(`
        CREATE TABLE IF NOT EXISTS campagnes (
            id SERIAL PRIMARY KEY,
            titre VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            fichier_joint VARCHAR(255),
            envoye_par INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (envoye_par) REFERENCES utilisateurs(id)
        )
    `);
    
    // Créer la table session pour connect-pg-simple
    await pool.query(`
        CREATE TABLE IF NOT EXISTS session (
            sid VARCHAR NOT NULL PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP NOT NULL
        )
    `);
    
    // Créer un utilisateur admin par défaut
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
        INSERT INTO utilisateurs (nom, email, nationalite, sexe, mot_de_passe, role, is_verified)
        VALUES ('Admin', 'admin@example.com', 'Française', 'autre', $1, 'admin', TRUE)
        ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    console.log('Base de données PostgreSQL initialisée avec succès');
}

module.exports = { pool, initDB, dbType };
