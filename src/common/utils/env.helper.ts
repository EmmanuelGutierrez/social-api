import { existsSync } from 'fs';
import { resolve } from 'path';

export const getEnvPath = (dest: string) => {
  const env: string | undefined = process.env.API_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : 'development.env';
  let filepath = resolve(`${dest}/${filename}`);
  if (!existsSync(filepath)) {
    filepath = fallback;
  }
  console.log('filepath', filepath);
  return filepath;
};
