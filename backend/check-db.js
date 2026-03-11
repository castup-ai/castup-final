import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function removeOld() {
  try {
    const result = await pool.query('SELECT user_id, media FROM portfolios');
    for (const row of result.rows) {
      let mediaParsed = row.media;
      if (typeof mediaParsed === 'string') {
        try { mediaParsed = JSON.parse(mediaParsed); } catch(e) {}
      }
      if (Array.isArray(mediaParsed)) {
        // filter out any media that doesn't have 'data' in its first file
        const newMedia = mediaParsed.filter(proj => {
          if (proj.files && proj.files.length > 0) {
            return !!proj.files[0].data;
          }
          return false;
        });
        
        await pool.query('UPDATE portfolios SET media = $1 WHERE user_id = $2', [JSON.stringify(newMedia), row.user_id]);
      }
    }
    console.log("Cleaned up old empty projects!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
removeOld();
