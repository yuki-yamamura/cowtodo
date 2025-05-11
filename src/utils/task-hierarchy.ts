import type { FileTask } from './tasks.js';

/**
 * Returns an array of tasks with their children (deep) in the correct order,
 * preserving the original order of root tasks
 * @param rootTasks The root tasks to process, already sorted in desired order
 * @returns An ordered list of tasks with their children
 */
export const getTasksWithChildren = (rootTasks: FileTask[]): FileTask[] => {
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
export const getChildTasksOrdered = (parent: FileTask): FileTask[] => {
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
