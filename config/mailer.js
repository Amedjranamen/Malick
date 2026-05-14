const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Code de vérification - Inscription',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e40af;">Vérification de votre email</h2>
                    <p>Bonjour,</p>
                    <p>Voici votre code de vérification : <strong style="font-size: 24px; color: #1e40af;">${code}</strong></p>
                    <p>Ce code expire dans 15 minutes.</p>
                    <p>Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email de vérification envoyé à:', email);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };
