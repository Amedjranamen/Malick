const { pool, dbType } = require('../config/database');

class Campagne {
    static async create(campagneData) {
        const { admin_id, sujet, message, piece_jointe } = campagneData;
        let result;
        if (dbType === 'postgresql') {
            result = await pool.query(
                'INSERT INTO campagnes (envoye_par, titre, message, fichier_joint) VALUES ($1, $2, $3, $4) RETURNING id',
                [admin_id, sujet, message, piece_jointe]
            );
            return result.rows[0].id;
        } else {
            const [res] = await pool.execute(
                'INSERT INTO campagnes (envoye_par, titre, message, fichier_joint) VALUES (?, ?, ?, ?)',
                [admin_id, sujet, message, piece_jointe]
            );
            return res.insertId;
        }
    }

    static async getAll() {
        let result;
        if (dbType === 'postgresql') {
            result = await pool.query(
                'SELECT c.*, u.nom as admin_nom FROM campagnes c JOIN utilisateurs u ON c.envoye_par = u.id ORDER BY c.created_at DESC'
            );
            return result.rows;
        } else {
            const [rows] = await pool.execute(
                'SELECT c.*, u.nom as admin_nom FROM campagnes c JOIN utilisateurs u ON c.envoye_par = u.id ORDER BY c.created_at DESC'
            );
            return rows;
        }
    }

    static async findById(id) {
        let result;
        if (dbType === 'postgresql') {
            result = await pool.query(
                'SELECT * FROM campagnes WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } else {
            const [rows] = await pool.execute(
                'SELECT * FROM campagnes WHERE id = ?',
                [id]
            );
            return rows[0];
        }
    }

    static async delete(id) {
        let result;
        if (dbType === 'postgresql') {
            result = await pool.query(
                'DELETE FROM campagnes WHERE id = $1',
                [id]
            );
            return result.rowCount > 0;
        } else {
            const [res] = await pool.execute(
                'DELETE FROM campagnes WHERE id = ?',
                [id]
            );
            return res.affectedRows > 0;
        }
    }
}

module.exports = Campagne;
