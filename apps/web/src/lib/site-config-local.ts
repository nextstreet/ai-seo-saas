import { dirname, resolve } from 'node:path';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';

const configuredPath = () => process.env.LOCAL_SITE_CONFIG_PATH?.trim();

export async function readLocalSiteConfig() {
  const path = configuredPath();
  if (!path) return null;
  try {
    return JSON.parse(await readFile(resolve(path), 'utf8')) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.warn(`[site-config] Unable to read local settings: ${(error as Error).message}`);
    return null;
  }
}

export async function writeLocalSiteConfig(config: unknown) {
  const path = configuredPath();
  if (!path) return false;
  const target = resolve(path);
  const temporary = `${target}.tmp`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(temporary, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  await rename(temporary, target);
  return true;
}
