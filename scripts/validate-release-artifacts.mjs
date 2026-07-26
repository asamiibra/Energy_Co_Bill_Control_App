import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'public/fallback/baseline.png',
  'public/fallback/alert.png',
  'public/fallback/safety.png',
  'artifacts/screenshots/baseline-deck.png',
  'artifacts/screenshots/alert-deck.png',
  'artifacts/screenshots/safety-deck.png',
  'artifacts/prototype-url.txt',
  'artifacts/prototype-qr.png',
  'artifacts/interview-fallback/baseline.png',
  'artifacts/interview-fallback/alert.png',
  'artifacts/interview-fallback/safety.png',
  'artifacts/interview-fallback/prototype-url.txt',
  'artifacts/interview-fallback/prototype-qr.png',
  'artifacts/interview-fallback/demo-runbook.md',
  'artifacts/interview-fallback/technical-recovery.md',
];

await Promise.all(requiredFiles.map((file) => access(file)));

const urlText = await readFile('artifacts/prototype-url.txt', 'utf8');
const demoLine = urlText
  .split('\n')
  .find((line) => line.startsWith('Demo overview: '));
if (!demoLine) {
  throw new Error('Demo overview URL is missing.');
}
const demoUrl = demoLine.replace('Demo overview: ', '');
if (!demoUrl.startsWith('https://') || !demoUrl.endsWith('/demo')) {
  throw new Error('Demo overview URL is not the public HTTPS /demo route.');
}

const png = PNG.sync.read(await readFile('artifacts/prototype-qr.png'));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
if (!decoded || decoded.data !== demoUrl) {
  throw new Error('QR code does not match the demo overview URL.');
}

console.log('Release artifacts and QR decode validation passed.');
