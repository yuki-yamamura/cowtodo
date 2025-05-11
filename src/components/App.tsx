import React, { useState, useEffect, type ReactNode } from "react";
import { Box, Text } from "ink";
import cowsay from "cowsay";
import { readFileContent, watchFile } from "../utils/file.js";
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
  const [updatedFiles, setUpdatedFiles] = useState<Set<string>>(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Load all files
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

  // Initial load of files
  useEffect(() => {
    loadFiles();
  }, [input]);

  // Set up file watchers
  useEffect(() => {
    // Skip if no files are provided
    if (input.length === 0) {
      return;
    }

    // Create an array to hold cleanup functions
    const cleanupFunctions: Array<() => void> = [];

    // Set up a watcher for each file
    input.forEach((filePath) => {
      try {
        const cleanup = watchFile(filePath, async (eventType) => {
          // File has changed, update the UI
          console.log(`File changed: ${filePath} (${eventType})`);

          try {
            // Read the updated file content
            const content = await readFileContent(filePath);

            // Update the content in our state maps
            setFileContents((prev) => new Map(prev).set(filePath, content));

            // Mark this file as recently updated
            setUpdatedFiles((prev) => {
              const newSet = new Set(prev);
              newSet.add(filePath);
              return newSet;
            });

            // Update the timestamp
            setLastUpdateTime(Date.now());

            // Remove any errors for this file
            setErrors((prev) => {
              const newErrors = new Map(prev);
              newErrors.delete(filePath);
              return newErrors;
            });
          } catch (err) {
            // If there's an error reading the file, update the errors map
            setErrors((prev) => new Map(prev).set(filePath, (err as Error).message));
          }
        });

        // Save the cleanup function
        cleanupFunctions.push(cleanup);
      } catch (err) {
        console.error(`Failed to watch file: ${filePath}`, err);
      }
    });

    // Clean up function to remove all watchers when component unmounts
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [input]); // Only re-run if the input files change

  // Reset the updated files highlight after 2 seconds
  useEffect(() => {
    if (updatedFiles.size === 0) {
      return;
    }

    const timer = setTimeout(() => {
      setUpdatedFiles(new Set());
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [lastUpdateTime]);

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
    e: updatedFiles.size > 0 ? "OO" : "oo", // Change eyes when files are updated
    r: false,
  };

  const cowOutput = cowsay.say(cowOptions);

  // Format the file list with highlights for updated files
  const renderFileList = () => {
    return input.map((filePath, index) => (
      <Box key={index} marginRight={1}>
        <Text
          color={updatedFiles.has(filePath) ? "green" : "white"}
          bold={updatedFiles.has(filePath)}
        >
          {updatedFiles.has(filePath) ? `[${filePath}]` : filePath}
        </Text>
      </Box>
    ));
  };

  return (
    <Box flexDirection="column">
      {/* Display monitoring info */}
      <Box marginBottom={1}>
        <Text>Monitoring files: </Text>
        {renderFileList()}
      </Box>

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
