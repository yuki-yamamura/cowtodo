import React, { type ReactNode } from "react";
import { Box, Text } from "ink";
import cowsay from "cowsay";
import { FileViewer } from "./FileViewer.js";
import type { CliOptions } from "../types/cli.js";

interface AppProps {
  options: CliOptions;
}

export const App = ({ options }: AppProps): ReactNode => {
  const { input, flags } = options;

  // Show welcome message if no files are provided
  if (input.length === 0) {
    const message = "Welcome to CowTodo! Please provide a file path to read.";
    const cowOutput = cowsay.say({
      text: message,
      e: "^^",
      T: "U ",
    });

    return (
      <Box flexDirection="column">
        <Text>{cowOutput}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {flags.verbose && (
        <Box marginBottom={1}>
          <Text>Running in verbose mode</Text>
        </Box>
      )}

      {input.map((filePath, index) => (
        <Box key={index} flexDirection="column" marginBottom={1}>
          <FileViewer filePath={filePath} verbose={flags.verbose} />
        </Box>
      ))}
    </Box>
  );
};
