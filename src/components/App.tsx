import { useState, useEffect, type ReactNode } from 'react';
import { Box, Text } from 'ink';
import cowsay from 'cowsay';
import { readFileContent, watchFile } from '@/utils/file.js';
import { collectTasks } from '@/utils/tasks.js';
import { TaskView } from '@/components/TaskView.js';
import type { CliOptions } from '@/types/cli.js';
import type { FileTask } from '@/utils/tasks.js';

/**
 * Returns an array of tasks with their children (deep) in the correct order,
 * preserving the original order of root tasks
 * @param rootTasks The root tasks to process, already sorted in desired order
 * @returns An ordered list of tasks with their children
 */
const getTasksWithChildren = (rootTasks: FileTask[]): FileTask[] => {
  // Create the result array
  const result: FileTask[] = [];

  // Use the existing order of root tasks - don't sort here!
  const sortedRoots = [...rootTasks];

  // For each root task, add it and all its children
  for (const root of sortedRoots) {
    // Add the root first
    result.push(root);

    // Get all child tasks
    const childTasks = getChildTasksOrdered(root);

    // Add all children
    result.push(...childTasks);
  }

  return result;
};

/**
 * Gets all child tasks in the correct order
 * @param parent The parent task
 * @returns An ordered list of all child tasks
 */
const getChildTasksOrdered = (parent: FileTask): FileTask[] => {
  // Start with the direct children - ensure we cast to FileTask[] since we know they will be FileTask objects
  const directChildren = (parent.childTasks || []) as FileTask[];

  // Sort children by line number
  const sortedChildren = [...directChildren].sort((a, b) => a.lineNumber - b.lineNumber);

  // Create the result array
  const result: FileTask[] = [];

  // For each child, add it and its children
  for (const child of sortedChildren) {
    result.push(child);

    // Recursively add grandchildren
    const grandchildren = getChildTasksOrdered(child);
    result.push(...grandchildren);
  }

  return result;
};

type AppProps = {
  options: CliOptions;
};

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
    // Use OrderedMap to maintain input file order
    const newFileContents = new Map<string, string>();
    const newErrors = new Map<string, string>();

    // Load all files in sequence to maintain order
    for (const filePath of input) {
      try {
        const content = await readFileContent(filePath);
        newFileContents.set(filePath, content);
      } catch (err) {
        newErrors.set(filePath, (err as Error).message);
      }
    }

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
    const message = 'Welcome to CowTodo! Please provide a file path to read.';
    const cowOutput = cowsay.say({
      text: message,
      e: '^^',
      T: 'U ',
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
    // Collect tasks from all files - pass input array to preserve CLI order
    const taskCollection = collectTasks(fileContents, input);

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

  // Default mode: Extract tasks and display through cowsay
  // Collect tasks from all files - pass input array to preserve CLI order
  const taskCollection = collectTasks(fileContents, input);

  // Format task content for cowsay
  let combinedText = '';

  // Remove debug logging

  // Get all root tasks or tasks without a parent
  const rootTasks = taskCollection.allTasks.filter((task) => !task.parentTask);

  // Sort root tasks by file order from CLI arguments
  rootTasks.sort((a, b) => {
    // First sort by file path using the original file order
    if (a.filePath !== b.filePath) {
      const aIndex = taskCollection.fileOrder.indexOf(a.filePath);
      const bIndex = taskCollection.fileOrder.indexOf(b.filePath);
      return aIndex - bIndex;
    }
    // Then sort by line number within the same file
    return a.lineNumber - b.lineNumber;
  });

  // Filter effectively incomplete root tasks for Backlog section
  const backlogTasks = rootTasks.filter((task) => !task.effectivelyComplete);

  // Get all incomplete tasks (including parents + children) in order
  const allBacklogTasks = getTasksWithChildren(backlogTasks);

  // Add Backlog section
  if (allBacklogTasks.length > 0 || errors.size > 0) {
    combinedText += '## Backlog\n\n';

    // Add backlog tasks with their completion status
    allBacklogTasks.forEach((task) => {
      const indent = ' '.repeat(task.indent * 2);
      const checkbox = task.completed ? '[x]' : '[ ]';
      combinedText += `${indent}- ${checkbox} ${task.content}\n`;
    });
  }

  // Add an empty line between sections
  if (allBacklogTasks.length > 0 && rootTasks.some((task) => task.effectivelyComplete)) {
    combinedText += '\n';
  }

  // Filter effectively complete root tasks for Done section
  const doneTasks = rootTasks.filter((task) => task.effectivelyComplete);

  // Sort done tasks by the same ordering as backlog tasks - first by file order, then by line number
  doneTasks.sort((a, b) => {
    // First sort by file path using the original file order
    if (a.filePath !== b.filePath) {
      const aIndex = taskCollection.fileOrder.indexOf(a.filePath);
      const bIndex = taskCollection.fileOrder.indexOf(b.filePath);
      return aIndex - bIndex;
    }
    // Then sort by line number within the same file
    return a.lineNumber - b.lineNumber;
  });

  // Add Done section
  if (doneTasks.length > 0) {
    combinedText += '## Done\n\n';

    // Add done tasks - only include effectively complete root tasks
    doneTasks.forEach((task) => {
      const indent = ' '.repeat(task.indent * 2);
      combinedText += `${indent}- [x] ${task.content}\n`;
    });
  }

  // If no tasks found, show a message
  if (taskCollection.allTasks.length === 0) {
    combinedText = 'No tasks found in the provided files.';
  }

  // Add any errors
  if (errors.size > 0) {
    if (combinedText) combinedText += '\n\n';
    combinedText += 'ERRORS:\n';

    for (const [filePath, errorMsg] of errors.entries()) {
      combinedText += `- ${filePath}: ${errorMsg}\n`;
    }
  }

  // Display the combined content through cowsay
  const cowOptions = {
    text: combinedText || 'No content found',
    e: updatedFiles.size > 0 ? 'OO' : 'oo', // Change eyes when files are updated
    r: false,
  };

  const cowOutput = cowsay.say(cowOptions);

  // Format the file list with highlights for updated files
  const renderFileList = () => {
    return input.map((filePath, index) => (
      <Box key={index} marginRight={1}>
        <Text color={updatedFiles.has(filePath) ? 'green' : 'white'} bold={updatedFiles.has(filePath)}>
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
