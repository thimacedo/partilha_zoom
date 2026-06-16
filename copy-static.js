const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  try {
    fs.mkdirSync(to, { recursive: true });
    fs.cpSync(from, to, { recursive: true });
    console.log(`Successfully copied ${from} to ${to}`);
  } catch (err) {
    console.error(`Error copying ${from} to ${to}:`, err);
  }
}

const staticFrom = path.join(__dirname, '.next', 'static');
const staticTo = path.join(__dirname, '.next', 'standalone', '.next', 'static');
const publicFrom = path.join(__dirname, 'public');
const publicTo = path.join(__dirname, '.next', 'standalone', 'public');

copyFolderSync(staticFrom, staticTo);
copyFolderSync(publicFrom, publicTo);
