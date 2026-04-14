import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, copyFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const sourceHtmlPath = path.join(root, 'src', 'index.html');
const imagesSourceDir = path.join(root, 'images_optimized');
const imagesDir = path.join(distDir, 'images');
const webpDir = path.join(imagesDir, 'webp');
const assetsDir = path.join(root, 'assets');
const staticDir = path.join(root, 'static');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.status !== 0 && !options.allowFailure) {
    process.exit(result.status ?? 1);
  }
  return result;
}

function resolveCommand(command, fallbacks = [], { required = true } = {}) {
  for (const candidate of [command, ...fallbacks]) {
    const result = spawnSync('bash', ['-lc', `command -v ${candidate}`], {
      cwd: root,
      encoding: 'utf8',
    });
    if (result.status === 0) {
      return result.stdout.trim();
    }
  }

  if (!required) {
    return null;
  }

  throw new Error(`Required command not found: ${command}`);
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function copyDirContents(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) return;
  ensureDir(targetDir);
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      cpSync(source, target, { recursive: true });
    } else {
      copyFileSync(source, target);
    }
  }
}

function extractReferencedAssets(html) {
  const jpgs = new Set();
  const pngs = new Set();
  const webps = new Set();
  const jpgPattern = /images\/([^\s",'?]+\.jpg)/g;
  const pngPattern = /images\/([^\s",'?]+\.png)/g;
  const webpPattern = /images\/webp\/([^\s",'?]+\.webp)/g;

  for (const match of html.matchAll(jpgPattern)) {
    jpgs.add(match[1]);
  }

  for (const match of html.matchAll(pngPattern)) {
    pngs.add(match[1]);
  }

  for (const match of html.matchAll(webpPattern)) {
    webps.add(match[1]);
  }

  return { jpgs, pngs, webps };
}

function makeWebp(sourceFile, outputFile, width, quality = 82) {
  if (!cwebpCommand) return;
  run(cwebpCommand, ['-quiet', '-q', String(quality), sourceFile, '-resize', String(width), '0', '-o', outputFile]);
}

function makeJpg(sourceFile, outputFile, quality = 88) {
  if (!magickCommand) return;
  run(magickCommand, [sourceFile, '-strip', '-quality', String(quality), outputFile]);
}

function getWebpQuality(base) {
  if (base === 'header') return 38;
  if (base === 'flowchart-time-mojito') return 84;
  if (base === 'cocktail-setup-mixed-drinks-mint-lime-ice-glasses-gin-rum-lemonade-hawaiian-punch') return 70;
  if (base === 'refreshing-mint-lemonade-summer-drink-homemade-cocktail-garnished-lime-lemons-fresh-herbs-sprinkle-ice-cool-beverage-happy-hour-socializing') return 72;
  return 80;
}

function getJpgQuality(base) {
  if (base === 'flowchart-time-mojito') return 88;
  return 90;
}

const tailwindCommand = resolveCommand('tailwindcss', [path.join(root, 'node_modules', '.bin', 'tailwindcss')]);
const cwebpCommand = resolveCommand('cwebp', ['/opt/homebrew/bin/cwebp'], { required: false });
const magickCommand = resolveCommand('magick', ['/opt/homebrew/bin/magick'], { required: false });
const sipsCommand = resolveCommand('sips', ['/usr/bin/sips'], { required: false });
const sourceHtml = readFileSync(sourceHtmlPath, 'utf8');
const referencedAssets = extractReferencedAssets(sourceHtml);

rmSync(distDir, { recursive: true, force: true });
ensureDir(distDir);
ensureDir(imagesDir);
ensureDir(webpDir);

run(tailwindCommand, ['-i', './src/input.css', '-o', './dist/output.css', '--minify']);

copyFileSync(sourceHtmlPath, path.join(distDir, 'index.html'));
copyDirContents(staticDir, distDir);

for (const name of [
  'apple-touch-icon.png',
  'favicon-16.png',
  'favicon-32.png',
  'favicon-192.png',
  'favicon-512.png',
  'favicon.ico',
]) {
  copyFileSync(path.join(assetsDir, name), path.join(distDir, name));
}

if (sipsCommand) {
  run(sipsCommand, ['-Z', '300', path.join(assetsDir, 'logo.png'), '--out', path.join(distDir, 'logo.png')]);
} else {
  console.warn('[build] sips not found; copying original logo.png without resizing.');
  copyFileSync(path.join(assetsDir, 'logo.png'), path.join(distDir, 'logo.png'));
}

for (const file of referencedAssets.jpgs) {
  const source = path.join(imagesSourceDir, file);
  if (existsSync(source)) {
    copyFileSync(source, path.join(imagesDir, file));
    continue;
  }

  const pngSource = path.join(root, 'images', file.replace(/\.jpg$/, '.png'));
  if (existsSync(pngSource)) {
    makeJpg(pngSource, path.join(imagesDir, file), getJpgQuality(path.parse(file).name));
    continue;
  }

  console.warn(`[build] Referenced image missing: ${file}`);
}

for (const file of referencedAssets.pngs) {
  const source = path.join(root, 'images', file);
  if (!existsSync(source)) {
    console.warn(`[build] Referenced PNG missing: ${file}`);
    continue;
  }
  copyFileSync(source, path.join(imagesDir, file));
}

if (cwebpCommand) {
  for (const variant of referencedAssets.webps) {
    const match = variant.match(/^(.*)-(\d+)\.webp$/);
    if (!match) {
      console.warn(`[build] Unsupported WebP variant name: ${variant}`);
      continue;
    }

    const [, base, width] = match;
    const jpgSource = path.join(imagesSourceDir, `${base}.jpg`);
    const pngSource = path.join(root, 'images', `${base}.png`);
    const source = existsSync(jpgSource) ? jpgSource : pngSource;
    if (!existsSync(source) && base !== 'logo') {
      console.warn(`[build] Missing source for WebP variant: ${variant}`);
      continue;
    }

    if (base === 'logo') {
      makeWebp(path.join(assetsDir, 'logo.png'), path.join(webpDir, variant), Number(width));
      continue;
    }

    makeWebp(source, path.join(webpDir, variant), Number(width), getWebpQuality(base));
  }
} else {
  console.warn('[build] cwebp not found; skipping WebP generation and relying on JPG/PNG fallbacks.');
}
