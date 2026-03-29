const { spawn } = require('child_process');
const path = require('path');

// Use relative path to avoid \F issue
const mainPath = path.join(__dirname, 'dist', 'main.js');
console.log('Starting application at:', mainPath);

const child = spawn('node', [mainPath], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start child process:', err);
});
