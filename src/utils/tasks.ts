import { TodoTaskWithContext, processTasks } from './markdown.js';

/**
 * Task information with file source
 */
export type FileTask = TodoTaskWithContext & {
  // Source file path
  filePath: string;
  // File name (without path)
  fileName: string;
};

/**
 * Task collection organized by file
 */
export type TaskCollection = {
  // All tasks, flattened
  allTasks: FileTask[];
  // Tasks grouped by file
  tasksByFile: Map<string, FileTask[]>;
  // Original file order from CLI arguments
  fileOrder: string[];
  // Summary of task counts
  summary: {
    totalFiles: number;
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
  };
};

/**
 * Process multiple files and collect their tasks
 * @param fileContents Map of file paths to their contents
 * @param fileOrder Optional array specifying the order of files to process (if not provided, will use Map keys order)
 * @returns Organized task collection
 */
export function collectTasks(fileContents: Map<string, string>, fileOrder?: string[]): TaskCollection {
  const allTasks: FileTask[] = [];
  const tasksByFile = new Map<string, FileTask[]>();

  // Use explicit fileOrder if provided, otherwise use Map entries order
  let processOrder: string[] = [];

  if (fileOrder && fileOrder.length > 0) {
    // Filter out any files that don't exist in fileContents
    processOrder = fileOrder.filter((path) => fileContents.has(path));
  } else {
    // Use Map keys as fallback
    processOrder = Array.from(fileContents.keys());
  }

  // Process files in the specified order
  const fileEntries = processOrder.map((filePath) => [filePath, fileContents.get(filePath)!] as [string, string]);

  let totalTasks = 0;
  let completedTasks = 0;

  // Process each file in order
  for (const [filePath, content] of fileEntries) {
    // Extract the file name from the path
    const fileName = filePath.split('/').pop() || filePath;

    // Process tasks in this file
    const { tasks, counts } = processTasks(content);

    // Add file information to tasks
    const fileTasks = tasks.map((task) => ({
      ...task,
      filePath,
      fileName,
    }));

    // Add to collections in original order
    allTasks.push(...fileTasks);
    tasksByFile.set(filePath, fileTasks);

    // Update counts
    totalTasks += counts.total;
    completedTasks += counts.completed;
  }

  // Calculate completion percentage
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Use the processOrder as our fileOrder
  // This preserves the exact order specified in the input

  // Create ordered allTasks - sort tasks by file order first, then by line number
  allTasks.sort((a, b) => {
    // First by file order
    const aIndex = processOrder.indexOf(a.filePath);
    const bIndex = processOrder.indexOf(b.filePath);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    // Then by line number
    return a.lineNumber - b.lineNumber;
  });

  return {
    allTasks,
    tasksByFile,
    fileOrder: processOrder,
    summary: {
      totalFiles: fileContents.size,
      totalTasks,
      completedTasks,
      completionPercentage,
    },
  };
}

/**
 * Group tasks by their context (heading)
 * @param tasks Array of tasks
 * @returns Map of context to tasks
 */
export function groupTasksByContext(tasks: FileTask[]): Map<string, FileTask[]> {
  const tasksByContext = new Map<string, FileTask[]>();

  tasks.forEach((task) => {
    const context = task.context || 'No Context';

    if (!tasksByContext.has(context)) {
      tasksByContext.set(context, []);
    }

    tasksByContext.get(context)?.push(task);
  });

  return tasksByContext;
}

/**
 * Filter tasks by completion status
 * @param tasks Array of tasks
 * @param completed Whether to return completed tasks (true) or incomplete tasks (false)
 * @returns Filtered tasks
 */
export function filterTasksByCompletion(tasks: FileTask[], completed: boolean): FileTask[] {
  return tasks.filter((task) => task.completed === completed);
}

/**
 * Sort tasks by different criteria
 * @param tasks Array of tasks
 * @param sortBy Sort criterion
 * @returns Sorted tasks
 */
export function sortTasks(tasks: FileTask[], sortBy: 'file' | 'context' | 'completion' = 'file'): FileTask[] {
  const tasksCopy = [...tasks];

  switch (sortBy) {
    case 'file':
      return tasksCopy.sort((a, b) => a.fileName.localeCompare(b.fileName));

    case 'context':
      return tasksCopy.sort((a, b) => a.context.localeCompare(b.context));

    case 'completion':
      return tasksCopy.sort((a, b) => {
        // Sort by completion status first (incomplete first)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // Then sort by file name
        return a.fileName.localeCompare(b.fileName);
      });

    default:
      return tasksCopy;
  }
}
