import { chmodSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '..', 'build');
const entryPoint = path.join(buildDir, 'index.js');
const scriptsDir = path.join(buildDir, 'scripts');
const sourceScript = path.join(__dirname, '..', 'src', 'scripts', 'godot_operations.gd');

// Make the build/index.js file executable (only if it exists — tsc runs first in `npm run build`)
if (existsSync(entryPoint)) {
  chmodSync(entryPoint, '755');
}

// Copy the GDScript helper to the build output
try {
  mkdirSync(scriptsDir, { recursive: true });
  copyFileSync(sourceScript, path.join(scriptsDir, 'godot_operations.gd'));
  console.log('Successfully copied godot_operations.gd to build/scripts');
} catch (error) {
  console.error('Error copying scripts:', error);
  process.exit(1);
}

console.log('Build scripts completed successfully!');
