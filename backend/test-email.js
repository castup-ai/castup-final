import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const testEmail = async () => {
    console.log('Testing email transport...');
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '********' : 'MISSING');

    const transporter = createTransporter();
    
    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('✅ Transporter is ready');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"CastUp Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: 'CastUp SMTP Test',
            text: 'This is a test email to verify SMTP configuration.'
        });
        console.log('✅ Email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Email test failed:', error);
    }
};

testEmail();
