import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const sourceConnectionString = "postgresql://postgres:07d18f5683ebe17fa2f3adbe05a9c00d@yhzh88c5.ap-southeast.database.insforge.app:5432/insforge?sslmode=require";

async function dumpData() {
    console.log("Menghubungkan ke database lama (InsForge)...");
    const client = new Client({
        connectionString: sourceConnectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const tables = ['outlets', 'profiles', 'services', 'products', 'kapsters', 'shifts', 'transactions', 'transaction_items', 'walkin_queue'];
        let sqlFileContent = "-- DUMP DATA UNTUK MIGRASI\n\n";
        
        // Disable foreign key untuk profiles sementara agar data historis transaksi lama bisa masuk
        sqlFileContent += "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;\n\n";

        for (const table of tables) {
            console.log(`Mengambil data dari tabel ${table}...`);
            const res = await client.query(`SELECT * FROM ${table}`);
            
            if (res.rows.length === 0) continue;

            const columns = Object.keys(res.rows[0]);
            
            for (const row of res.rows) {
                const values = columns.map(col => {
                    const val = row[col];
                    if (val === null || val === undefined) return 'NULL';
                    if (typeof val === 'number') return val;
                    if (typeof val === 'boolean') return val;
                    if (val instanceof Date) return `'${val.toISOString()}'`;
                    return `'${String(val).replace(/'/g, "''")}'`;
                });
                
                // Use ON CONFLICT DO NOTHING for profiles in case they already created a new one with same ID (unlikely but safe)
                if (table === 'profiles') {
                    sqlFileContent += `INSERT INTO ${table} (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
                } else {
                    sqlFileContent += `INSERT INTO ${table} (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
                }
            }
            sqlFileContent += "\n";
        }

        fs.writeFileSync('data-migration.sql', sqlFileContent);
        console.log("\nBERHASIL! Data telah disimpan ke dalam file 'data-migration.sql'.");
        
    } catch (e) {
        console.error("Terjadi kesalahan:", e);
    } finally {
        await client.end();
    }
}

dumpData();
