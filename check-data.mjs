import pg from 'pg';

const { Client } = pg;

const connectionString = "postgresql://postgres:5nznyls0bzPdhRudGmLiOOf9634E4Gid@187.77.120.188:5432/postgres";

async function checkData() {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT count(*) as count FROM outlets`);
        console.log("Total outlets:", res.rows[0].count);
        
        const res2 = await client.query(`SELECT count(*) as count FROM profiles`);
        console.log("Total profiles:", res2.rows[0].count);
        
        const res3 = await client.query(`SELECT count(*) as count FROM services`);
        console.log("Total services:", res3.rows[0].count);
    } catch (e) {
        console.error("Terjadi kesalahan:", e);
    } finally {
        await client.end();
    }
}

checkData();
