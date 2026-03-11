import pool from './src/config/database.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function testUpdate() {
    try {
        const res = await pool.query('SELECT id FROM users LIMIT 1');
        if(res.rows.length === 0) return;
        const userId = res.rows[0].id;
        
        const body = {
            firstName: 'sabareesh', lastName: 'k', email: 'sabareesh@example.com', phone: '', country: '',
            role: '', category: 'Artist', experience: '', availability: '', location: '',
            languages: [], age: null, gender: '', height: '', weight: '', nextAvailable: '', bio: '',
            yearsOfExperience: 0, awards: '', skills: [], portfolioLink: '', socialMedia: '', projectType: '',
            name: 'sabareesh k'
        };

        const fieldMap = {
            name: 'name', department: 'department', country: 'country', phone: 'phone',
            role: 'role', category: 'category', experience: 'experience', availability: 'availability', 
            location: 'location', languages: 'languages', age: 'age', gender: 'gender', 
            height: 'height', weight: 'weight', nextAvailable: 'next_available', bio: 'bio', 
            yearsOfExperience: 'years_of_experience', awards: 'awards', skills: 'skills', 
            portfolioLink: 'portfolio_link', socialMedia: 'social_media', projectType: 'project_type'
        };

        const updates = [];
        const values = [];
        let paramCount = 1;

        for (const [jsField, sqlCol] of Object.entries(fieldMap)) {
            if (body[jsField] !== undefined) {
                updates.push(`${sqlCol} = $${paramCount}`);
                values.push(body[jsField] === '' ? null : body[jsField]); 
                paramCount++;
            }
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);

        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, name
        `;
        
        const result = await pool.query(query, values);
        fs.writeFileSync('test-res.json', JSON.stringify({ success: true, user: result.rows[0] }, null, 2));
    } catch(e) {
        fs.writeFileSync('test-res.json', JSON.stringify({ success: false, error: e.message, hint: e.hint, detail: e.detail }, null, 2));
    } finally {
        pool.end();
    }
}
testUpdate();
