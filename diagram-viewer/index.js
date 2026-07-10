import express from 'express';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const BASE_PATH = '/diagram-viewer';
const DOCS_PATH = path.resolve(__dirname, '..', 'docs');
const DIST_PATH = path.resolve(__dirname, 'dist');

const MERMAID_BLOCK = /```mermaid\r?\n([\s\S]*?)\r?\n```/;
const HEADING = /^#\s+(.+)$/m;

function prettifyFilename(name) {
  return name
    .replace(/\.md$/i, '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function loadDiagrams() {
  const entries = await readdir(DOCS_PATH, { withFileTypes: true });
  const mdFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
    .map((e) => e.name)
    .sort();

  const diagrams = [];
  for (const filename of mdFiles) {
    const fullPath = path.join(DOCS_PATH, filename);
    const content = await readFile(fullPath, 'utf-8');
    const match = content.match(MERMAID_BLOCK);
    if (!match) continue;
    const code = match[1];
    const headingMatch = content.match(HEADING);
    const title = headingMatch ? headingMatch[1].trim() : prettifyFilename(filename);
    diagrams.push({
      id: filename.replace(/\.md$/i, ''),
      filename,
      title,
      code,
    });
  }
  return diagrams;
}

const diagrams = await loadDiagrams();
console.log(`[diagram-viewer] Loaded ${diagrams.length} diagram(s) from ${DOCS_PATH}`);

const app = express();

app.get(`${BASE_PATH}/api/diagrams`, (req, res) => {
  res.json(diagrams);
});

app.use(BASE_PATH, express.static(DIST_PATH, { index: 'index.html' }));

app.get('/', (req, res) => {
  res.redirect(`${BASE_PATH}/`);
});

app.get(`${BASE_PATH}/*`, (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[diagram-viewer] Server on http://localhost:${PORT}${BASE_PATH}/`);
});
