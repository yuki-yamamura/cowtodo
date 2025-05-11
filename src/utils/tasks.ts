import { TodoTaskWithContext, processTasks } from "./markdown.js";

/**
 * Task information with file source
 */
export interface FileTask extends TodoTaskWithContext {
  // Source file path
  filePath: string;
  // File name (without path)
  fileName: string;
}

/**
 * Task collection organized by file
 */
export interface TaskCollection {
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
}

/**
 * Process multiple files and collect their tasks
 * @param fileContents Map of file paths to their contents
 * @returns Organized task collection
 */
export function collectTasks(fileContents: Map<string, string>): TaskCollection {
  const allTasks: FileTask[] = [];
  const tasksByFile = new Map<string, FileTask[]>();

  // Use fileContents keys to preserve original order
  const fileEntries = Array.from(fileContents.entries());

  let totalTasks = 0;
  let completedTasks = 0;

  // Process each file in order
  for (const [filePath, content] of fileEntries) {
    // Extract the file name from the path
    const fileName = filePath.split("/").pop() || filePath;

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
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    allTasks,
    tasksByFile,
    fileOrder: fileEntries.map(([filePath]) => filePath),
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
    const context = task.context || "No Context";

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
export function sortTasks(
  tasks: FileTask[],
  sortBy: "file" | "context" | "completion" = "file"
): FileTask[] {
  const tasksCopy = [...tasks];

  switch (sortBy) {
    case "file":
      return tasksCopy.sort((a, b) => a.fileName.localeCompare(b.fileName));

    case "context":
      return tasksCopy.sort((a, b) => a.context.localeCompare(b.context));

    case "completion":
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
