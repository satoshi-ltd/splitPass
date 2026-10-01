import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DESIGN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = path.resolve(DESIGN, '..');

export const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
