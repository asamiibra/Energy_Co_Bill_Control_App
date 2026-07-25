import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const rawUrl = process.argv[2] || process.env.BASE_URL;
if (!rawUrl) {
  throw new Error('Provide a public HTTPS URL as an argument or BASE_URL.');
}

const mainUrl = new URL(rawUrl);
if (mainUrl.protocol !== 'https:') {
  throw new Error('Release URL must use HTTPS.');
}
mainUrl.search = '';
mainUrl.hash = '';

const directUrl = (scenario, presentation = false) => {
  const url = new URL(mainUrl);
  url.searchParams.set('scenario', scenario);
  if (presentation) {
    url.searchParams.set('presentation', 'true');
  }
  return url.toString();
};

const presentationUrl = directUrl('baseline', true);
const urlFile = [
  `Main prototype: ${mainUrl.toString()}`,
  `Baseline Forecast: ${directUrl('baseline')}`,
  `Material-Change Alert: ${directUrl('alert')}`,
  `Safety Guardrail: ${directUrl('safety')}`,
  `Presentation mode: ${presentationUrl}`,
  '',
].join('\n');

await mkdir('artifacts/interview-fallback', { recursive: true });
await writeFile('artifacts/prototype-url.txt', urlFile);
await QRCode.toFile('artifacts/prototype-qr.png', presentationUrl, {
  errorCorrectionLevel: 'H',
  margin: 4,
  width: 768,
  color: {
    dark: '#001F3FFF',
    light: '#FFFFFFFF',
  },
});

const png = PNG.sync.read(await readFile('artifacts/prototype-qr.png'));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
if (!decoded || decoded.data !== presentationUrl) {
  throw new Error('QR decode validation failed.');
}

await cp(
  'artifacts/prototype-url.txt',
  'artifacts/interview-fallback/prototype-url.txt'
);
await cp(
  'artifacts/prototype-qr.png',
  'artifacts/interview-fallback/prototype-qr.png'
);

console.log(`Generated and decoded release QR for ${presentationUrl}`);
