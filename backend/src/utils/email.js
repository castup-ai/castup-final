import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
    const user = process.env.SMTP_USER || 'castupaiapp@gmail.com';
    let pass = process.env.SMTP_PASS;
    if (pass) pass = pass.replace(/\s+/g, '');

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user,
            pass
        }
    });
};

export const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = createTransporter();
    const from = process.env.SMTP_USER || 'castupaiapp@gmail.com';

    try {
        const info = await transporter.sendMail({
            from: `"CastUp Support" <${from}>`,
            to,
            subject,
            text,
            html
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};
