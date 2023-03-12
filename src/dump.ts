import fs from 'fs';
import path from 'path';

const { readFile } = fs.promises;

export async function readJsonFile(fileName: string) {
  const file = await readFile(fileName, 'utf-8');
  return JSON.parse(file);
}

/**
 * Restore dump content as file
 * 
 * @param dumpType Type of dump which is used to resolve dump file name
 * @param cPath Location of saved dump file
 * @returns JSON object or undefined
 */
export function loadDump(
  dumpType: string,
  cPath: string = './',
) {
  const path = getDumpPath(dumpType, cPath);
  return fs.existsSync(path)
    ? JSON.parse(fs.readFileSync(path).toString())
    : undefined;
}

export function loadRawDump(
  dumpType: string,
  cPath: string = './',
) {
  const path = getDumpPath(dumpType, cPath);
  return fs.existsSync(path)
    ? fs.readFileSync(path).toString()
    : undefined;
}
/**
 * Save dump content as file
 * 
 * @param dumpType Type of dump which is used to resolve dump file name
 * @param content Dump content
 * @param cPath Location of saved dump file
 * @param infos Optional param for track transactions. Save period info in the dump file name
 */
export async function saveDump(
  dumpType: string,
  content: any,
  cPath: string = './',
  infos: any = {},
) {
  const filePath = getDumpPath(dumpType, cPath, infos);
  fs.writeFileSync(
    filePath,
    JSON.stringify(content) + '\n',
    {
      flag: 'a',
    }
  );
}

/**
 * Resolve dump file path from dumpType
 * 
 * @param dumpType Type of dump which is used to resolve dump file name
 * @param cPath Location of saved dump file
 * @param infos Optional param for track transactions. Save period info in the dump file name
 * @returns Location of subdirectory of exact dump file
 */
export function getDumpPath(
  dumpType: string,
  cPath: string = './',
  infos: any = {},
) {
  if (cPath != '' && !fs.existsSync(cPath)) fs.mkdirSync(cPath, { recursive: true });
  return path.join(cPath, dumpType);
}
