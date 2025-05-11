import React, { useState, useEffect, type ReactNode } from "react";
import { Box, Text } from "ink";
import cowsay from "cowsay";
import { readFileContent } from "../utils/file.js";
import { collectTasks } from "../utils/tasks.js";
import { TaskView } from "./TaskView.js";
import type { CliOptions } from "../types/cli.js";

interface AppProps {
  options: CliOptions;
}

export const App = ({ options }: AppProps): ReactNode => {
  const { input, flags } = options;
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load all files
  useEffect(() => {
    const loadFiles = async () => {
      if (input.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const newFileContents = new Map<string, string>();
      const newErrors = new Map<string, string>();

      // Load all files in parallel
      await Promise.all(
        input.map(async (filePath) => {
          try {
            const content = await readFileContent(filePath);
            newFileContents.set(filePath, content);
          } catch (err) {
            newErrors.set(filePath, (err as Error).message);
          }
        })
      );

      setFileContents(newFileContents);
      setErrors(newErrors);
      setLoading(false);
    };

    loadFiles();
  }, [input]);

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

  // Show loading state
  if (loading) {
    return (
      <Box>
        <Text>Loading files...</Text>
      </Box>
    );
  }

  // Extract and display tasks if task mode is enabled
  if (flags.tasks) {
    // Collect tasks from all files
    const taskCollection = collectTasks(fileContents);

    // Display tasks
    return (
      <Box flexDirection="column">
        {flags.verbose && (
          <Box marginBottom={1}>
            <Text>Running in verbose mode</Text>
          </Box>
        )}
        <TaskView tasks={taskCollection} showDetails={flags.detailed} />

        {/* Show errors if any */}
        {errors.size > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="red">
              Errors:
            </Text>
            {Array.from(errors.entries()).map(([filePath, errorMsg], index) => (
              <Text key={index} color="red">
                - {filePath}: {errorMsg}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    );
  }

  // Default mode: Display file contents through cowsay
  // Combine all file contents
  let combinedText = "";

  for (const [filePath, content] of fileContents.entries()) {
    if (combinedText) combinedText += "\n\n";

    if (flags.verbose) {
      combinedText += `File: ${filePath}\n`;
    }

    combinedText += content;
  }

  // Add any errors
  if (errors.size > 0) {
    if (combinedText) combinedText += "\n\n";
    combinedText += "ERRORS:\n";

    for (const [filePath, errorMsg] of errors.entries()) {
      combinedText += `- ${filePath}: ${errorMsg}\n`;
    }
  }

  // Display the combined content through cowsay
  const cowOptions = {
    text: combinedText || "No content found",
    e: "oo",
    r: false,
  };

  const cowOutput = cowsay.say(cowOptions);

  return (
    <Box flexDirection="column">
      {flags.verbose && (
        <Box marginBottom={1}>
          <Text>Running in verbose mode</Text>
        </Box>
      )}
      <Box>
        <Text>{cowOutput}</Text>
      </Box>
    </Box>
  );
};
