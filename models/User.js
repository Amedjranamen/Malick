const { promisePool } = require('../config/database');

class User {
    static async create(userData) {
        const { nom, email, nationalite, sexe, mot_de_passe, diplome, photo, verification_code } = userData;
        const [result] = await promisePool.execute(
            'INSERT INTO utilisateurs (nom, email, nationalite, sexe, mot_de_passe, diplome, photo, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nom, email, nationalite, sexe, mot_de_passe, diplome, photo || '', verification_code]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM utilisateurs WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM utilisateurs WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async verifyEmail(email, code) {
        const [result] = await promisePool.execute(
            'UPDATE utilisateurs SET is_verified = TRUE, verification_code = NULL WHERE email = ? AND verification_code = ?',
            [email, code]
        );
        return result.affectedRows > 0;
    }

    static async updateVerificationCode(email, code) {
        await promisePool.execute(
            'UPDATE utilisateurs SET verification_code = ? WHERE email = ?',
            [code, email]
        );
    }

    static async getAll() {
        const [rows] = await promisePool.execute(
            'SELECT id, nom, email, nationalite, sexe, diplome, photo, is_verified, role, created_at FROM utilisateurs ORDER BY created_at DESC'
        );
        return rows;
    }

    static async update(id, userData) {
        const { nom, email, nationalite, sexe, diplome, photo } = userData;
        const [result] = await promisePool.execute(
            'UPDATE utilisateurs SET nom = ?, email = ?, nationalite = ?, sexe = ?, diplome = ?, photo = ? WHERE id = ?',
            [nom, email, nationalite, sexe, diplome, photo || '', id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await promisePool.execute(
            'DELETE FROM utilisateurs WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async updateRole(id, role) {
        const [result] = await promisePool.execute(
            'UPDATE utilisateurs SET role = ? WHERE id = ?',
            [role, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;
