import path from 'path';
import dotenv from 'dotenv';

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env')
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function optionalEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : fallback;
}
