#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, 'apps', 'web', '.env.local');

console.log('AI Nexus Setup Helper\n');

console.log('This will help you set up your environment variables.\n');

console.log('You will need:');
console.log('1. OpenAI API key (get from https://platform.openai.com/api-keys)');
console.log('2. InstantDB App ID (create at https://instantdb.com)\n');

rl.question('Enter your OpenAI API key: ', (openaiKey) => {
  rl.question('Enter your InstantDB App ID: ', (instantdbId) => {
    rl.question('Enter your InstantDB Admin Secret (optional, press Enter to skip): ', (adminSecret) => {
      
      const envContent = `# OpenAI API Key
# Get your key at: https://platform.openai.com/api-keys
OPENAI_API_KEY=${openaiKey}

# InstantDB Configuration
# Create your own app at: https://instantdb.com
NEXT_PUBLIC_INSTANTDB_ID=${instantdbId}
${adminSecret ? `INSTANTDB_ADMIN_SECRET=${adminSecret}` : '# INSTANTDB_ADMIN_SECRET=your-admin-secret-here'}

# Note: NEXT_PUBLIC_* variables are exposed to the browser
# Never commit the actual .env.local file to version control
`;

      try {
        fs.writeFileSync(envPath, envContent);
        console.log('\nEnvironment file updated successfully!');
        console.log('\nSetup complete! You can now run:');
        console.log('   pnpm dev');
        console.log('\nThen open http://localhost:1290 in your browser.');
      } catch (error) {
        console.error('\nError writing environment file:', error.message);
      }
      
      rl.close();
    });
  });
});
