import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

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
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // Read file content
    const content = await readFile(absolutePath, "utf-8");
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath} - ${(error as Error).message}`);
  }
}
