const { getPool, dbType } = require('../config/database');

class User {
    static async create(userData) {
        const { nom, email, nationalite, sexe, mot_de_passe, diplome, photo, verification_code } = userData;
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'INSERT INTO utilisateurs (nom, email, nationalite, sexe, mot_de_passe, diplome, photo, verification_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                [nom, email, nationalite, sexe, mot_de_passe, diplome, photo || '', verification_code]
            );
            return result.rows[0].id;
        } else {
            const [res] = await pool.execute(
                'INSERT INTO utilisateurs (nom, email, nationalite, sexe, mot_de_passe, diplome, photo, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nom, email, nationalite, sexe, mot_de_passe, diplome, photo || '', verification_code]
            );
            return res.insertId;
        }
    }

    static async findByEmail(email) {
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'SELECT * FROM utilisateurs WHERE email = $1',
                [email]
            );
            return result.rows[0];
        } else {
            const [rows] = await pool.execute(
                'SELECT * FROM utilisateurs WHERE email = ?',
                [email]
            );
            return rows[0];
        }
    }

    static async findById(id) {
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'SELECT * FROM utilisateurs WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } else {
            const [rows] = await pool.execute(
                'SELECT * FROM utilisateurs WHERE id = ?',
                [id]
            );
            return rows[0];
        }
    }

    static async verifyEmail(email, code) {
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'UPDATE utilisateurs SET is_verified = TRUE, verification_code = NULL WHERE email = $1 AND verification_code = $2',
                [email, code]
            );
            return result.rowCount > 0;
        } else {
            const [res] = await pool.execute(
                'UPDATE utilisateurs SET is_verified = TRUE, verification_code = NULL WHERE email = ? AND verification_code = ?',
                [email, code]
            );
            return res.affectedRows > 0;
        }
    }

    static async updateVerificationCode(email, code) {
        const pool = getPool();
        if (dbType === 'postgresql') {
            await pool.query(
                'UPDATE utilisateurs SET verification_code = $1 WHERE email = $2',
                [code, email]
            );
        } else {
            await pool.execute(
                'UPDATE utilisateurs SET verification_code = ? WHERE email = ?',
                [code, email]
            );
        }
    }

    static async getAll() {
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'SELECT id, nom, email, nationalite, sexe, diplome, photo, is_verified, role, created_at FROM utilisateurs ORDER BY created_at DESC'
            );
            return result.rows;
        } else {
            const [rows] = await pool.execute(
                'SELECT id, nom, email, nationalite, sexe, diplome, photo, is_verified, role, created_at FROM utilisateurs ORDER BY created_at DESC'
            );
            return rows;
        }
    }

    static async update(id, userData) {
        const { nom, email, nationalite, sexe, diplome, photo } = userData;
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'UPDATE utilisateurs SET nom = $1, email = $2, nationalite = $3, sexe = $4, diplome = $5, photo = $6 WHERE id = $7',
                [nom, email, nationalite, sexe, diplome, photo || '', id]
            );
            return result.rowCount > 0;
        } else {
            const [res] = await pool.execute(
                'UPDATE utilisateurs SET nom = ?, email = ?, nationalite = ?, sexe = ?, diplome = ?, photo = ? WHERE id = ?',
                [nom, email, nationalite, sexe, diplome, photo || '', id]
            );
            return res.affectedRows > 0;
        }
    }

    static async delete(id) {
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'DELETE FROM utilisateurs WHERE id = $1',
                [id]
            );
            return result.rowCount > 0;
        } else {
            const [res] = await pool.execute(
                'DELETE FROM utilisateurs WHERE id = ?',
                [id]
            );
            return res.affectedRows > 0;
        }
    }

    static async updateRole(id, role) {
        let result;
        const pool = getPool();
        if (dbType === 'postgresql') {
            result = await pool.query(
                'UPDATE utilisateurs SET role = $1 WHERE id = $2',
                [role, id]
            );
            return result.rowCount > 0;
        } else {
            const [res] = await pool.execute(
                'UPDATE utilisateurs SET role = ? WHERE id = ?',
                [role, id]
            );
            return res.affectedRows > 0;
        }
    }
}

module.exports = User;
