import { readFile } from 'fs/promises';
import { existsSync, watch } from 'fs';
import path from 'path';

/**
 * Reads the content of a file
 * @param filePath Path to the file
 * @returns File content as string
 */
export async function readFileContent(filePath: string): Promise<string> {
  // Check if the file exists
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    // Resolve to absolute path if it's relative
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

    // Read file content
    const content = await readFile(absolutePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath} - ${(error as Error).message}`);
  }
}

/**
 * Returns the absolute path for a file
 * @param filePath Path to the file
 * @returns Absolute path
 */
export function getAbsolutePath(filePath: string): string {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

/**
 * Watch a file for changes
 * @param filePath Path to the file to watch
 * @param onChange Callback function called when file changes
 * @returns Function to stop watching
 */
export function watchFile(
  filePath: string,
  // eslint-disable-next-line no-unused-vars
  onChange: (eventType: string, filename: string | null) => void,
): () => void {
  // Check if the file exists
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Resolve to absolute path
  const absolutePath = getAbsolutePath(filePath);

  // Get the directory and filename
  const directory = path.dirname(absolutePath);
  const filename = path.basename(absolutePath);

  // Watch the directory for changes to the file
  // This is more reliable on macOS than watching the file directly
  const watcher = watch(directory, { persistent: true }, (eventType, changedFilename) => {
    // Only trigger for our target file
    if (changedFilename === filename) {
      onChange(eventType, changedFilename);
    }
  });

  // Return a function to stop watching
  return () => {
    watcher.close();
  };
}
