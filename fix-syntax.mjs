import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // match supabase.database.from even with newlines and spaces
        if (/supabase\.database\s*\.\s*from/g.test(content)) {
            content = content.replace(/supabase\.database\s*\.\s*from/g, 'supabase.from');
            modified = true;
        }
        
        // fix resetPasswordForEmail({ email }) -> resetPasswordForEmail(email)
        if (content.includes('supabase.auth.resetPasswordForEmail({ email })')) {
            content = content.replace(/supabase\.auth\.resetPasswordForEmail\(\{ email \}\)/g, 'supabase.auth.resetPasswordForEmail(email)');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed', filePath);
        }
    }
});
