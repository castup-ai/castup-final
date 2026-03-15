const checkRecentFiles = async () => {
    try {
        const res = await pool.query(`
            SELECT f.*, u.name as owner 
            FROM files f 
            JOIN users u ON f.user_id = u.id 
            ORDER BY f.created_at DESC 
            LIMIT 5
        `);
        console.log('--- RECENT FILES ---');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        process.exit();
    }
};

checkRecentFiles();
