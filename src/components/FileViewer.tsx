import React, { useState, useEffect, type ReactNode } from "react";
import { Box, Text } from "ink";
import { readFileContent } from "../utils/file.js";

interface FileViewerProps {
  filePath: string;
}

export const FileViewer = ({ filePath }: FileViewerProps): ReactNode => {
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
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>File: {filePath}</Text>
      </Box>
      <Box>
        <Text>{content}</Text>
      </Box>
    </Box>
  );
};
