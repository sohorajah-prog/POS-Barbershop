import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  if (content.includes('supabase')) {
    content = content.replace(/supabase/g, 'supabase');
    changed = true;
  }
  if (content.includes('Supabase')) {
    content = content.replace(/Supabase/g, 'Supabase');
    changed = true;
  }
  if (content.includes('SUPABASE')) {
    content = content.replace(/SUPABASE/g, 'SUPABASE');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.gemini')) {
        traverseAndReplace(fullPath);
      }
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.mjs') || fullPath.endsWith('.local')) {
        replaceInFile(fullPath);
      }
    }
  }
}

traverseAndReplace(process.cwd());
