import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async ({ to, subject, html, text }) => {
    let lastError = 'No credentials found';
    
    // 1. Try Resend API (Professional Way - Works on Render Port 443)
    const resendKey = process.env.RESEND_API_KEY;
    
    if (resendKey) {
        const maskedKey = resendKey.substring(0, 5) + '...' + resendKey.slice(-4);
        console.log(`🚀 Trying Resend API (Key: ${maskedKey}) for ${to}...`);
        try {
            const response = await axios.post('https://api.resend.com/emails', {
                from: 'CastUp <onboarding@resend.dev>',
                to: [to],
                subject,
                html: html || (text ? `<p style="white-space: pre-wrap;">${text}</p>` : '')
            }, {
                headers: { 
                    'Authorization': `Bearer ${resendKey}`, 
                    'Content-Type': 'application/json' 
                },
                timeout: 10000
            });
            console.log(`✅ Resend API success! ID: ${response.data.id}`);
            return { success: true };
        } catch (err) {
            const detail = err.response?.data || err.message;
            console.error('❌ Resend API Error:', detail);
            lastError = `Resend: ${JSON.stringify(detail)}`;
            // Fall through to SMTP
        }
    }

    // 2. Fallback to SMTP
    const user = process.env.SMTP_USER || 'castupaiapp@gmail.com';
    let pass = process.env.SMTP_PASS;
    if (pass) pass = pass.replace(/\s+/g, '');
    
    if (!pass) return { success: false, error: 'No email credentials (RESEND_API_KEY or SMTP_PASS missing)' };

    const trySend = async (port, secure) => {
        console.log(`✉️ Trying SMTP via Port ${port}...`);
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port, secure,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });

        try {
            const info = await Promise.race([
                transporter.sendMail({ from: `"CastUp Support" <${user}>`, to, subject, html, text }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 20000))
            ]);
            return { success: true, messageId: info.messageId };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const res1 = await trySend(465, true);
    if (res1.success) return { success: true };
    lastError += ` | SMTP 465: ${res1.error}`;

    const res2 = await trySend(587, false);
    if (res2.success) return { success: true };
    lastError += ` | SMTP 587: ${res2.error}`;

    return { 
        success: false, 
        error: lastError
    };
};
