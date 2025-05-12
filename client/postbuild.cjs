// CommonJS build script
const fs = require('fs');
const path = require('path');

console.log('Running post-build tasks...');

// Ensure _redirects file is copied to the dist folder
console.log('Copying _redirects file...');
try {
  if (fs.existsSync(path.join(__dirname, 'public', '_redirects'))) {
    fs.copyFileSync(
      path.join(__dirname, 'public', '_redirects'),
      path.join(__dirname, 'dist', '_redirects')
    );
    console.log('_redirects file copied successfully');
  } else {
    console.log('No _redirects file found in public directory');
  }
} catch (err) {
  console.error('Error copying _redirects file:', err);
}

// Create a netlify.toml file in the dist folder if it doesn't exist
console.log('Ensuring netlify.toml is in the dist folder...');
try {
  if (fs.existsSync(path.join(__dirname, 'netlify.toml'))) {
    fs.copyFileSync(
      path.join(__dirname, 'netlify.toml'),
      path.join(__dirname, 'dist', 'netlify.toml')
    );
    console.log('netlify.toml file copied successfully');
  } else {
    console.log('No netlify.toml file found in root directory');
  }
} catch (err) {
  console.error('Error copying netlify.toml file:', err);
}

console.log('Post-build tasks completed successfully!');
