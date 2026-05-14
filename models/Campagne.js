const { promisePool } = require('../config/database');

class Campagne {
    static async create(campagneData) {
        const { admin_id, sujet, message, piece_jointe } = campagneData;
        const [result] = await promisePool.execute(
            'INSERT INTO campagnes (admin_id, sujet, message, piece_jointe) VALUES (?, ?, ?, ?)',
            [admin_id, sujet, message, piece_jointe]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await promisePool.execute(
            'SELECT c.*, u.nom as admin_nom FROM campagnes c JOIN utilisateurs u ON c.admin_id = u.id ORDER BY c.created_at DESC'
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM campagnes WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async delete(id) {
        const [result] = await promisePool.execute(
            'DELETE FROM campagnes WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Campagne;
