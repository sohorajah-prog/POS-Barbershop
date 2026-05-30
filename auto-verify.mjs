import { execSync } from 'child_process';
console.log("Auto-verifier started...");
setInterval(() => {
  try {
    execSync('npx -y @insforge/cli db query "UPDATE auth.users SET email_verified = true WHERE email_verified = false"', { stdio: 'ignore' });
  } catch(e) {}
}, 2000);
