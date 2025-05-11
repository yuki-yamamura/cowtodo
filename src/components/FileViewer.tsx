import React, { useState, useEffect, type ReactNode } from "react";
import { Box, Text } from "ink";
import cowsay from "cowsay";
import { readFileContent } from "../utils/file.js";

interface FileViewerProps {
  filePath: string;
  verbose?: boolean;
}

export const FileViewer = ({ filePath, verbose = false }: FileViewerProps): ReactNode => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const fileContent = await readFileContent(filePath);
        setContent(fileContent);
      } catch (err) {
        setError((err as Error).message);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [filePath]);

  if (loading) {
    return (
      <Box>
        <Text>Loading file: {filePath}...</Text>
      </Box>
    );
  }

  if (error) {
    const errorMessage = cowsay.say({
      text: `Error: ${error}`,
      e: "xx",
      T: "U ",
    });

    return (
      <Box>
        <Text color="red">{errorMessage}</Text>
      </Box>
    );
  }

  // Show file content through cowsay
  const cowOptions = {
    text: verbose ? `File: ${filePath}\n\n${content}` : content || "",
    e: "oo",
    r: false,
  };

  const cowOutput = cowsay.say(cowOptions);

  return (
    <Box flexDirection="column">
      {verbose && (
        <Box marginBottom={1}>
          <Text bold>File: {filePath}</Text>
        </Box>
      )}
      <Box>
        <Text>{cowOutput}</Text>
      </Box>
    </Box>
  );
};
