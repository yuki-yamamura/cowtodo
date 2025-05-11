/**
 * Represents a task item in markdown
 */
export type TodoTask = {
  // The full text of the task
  text: string;
  // The raw content of the task (excluding checkbox)
  content: string;
  // Whether the task is completed
  completed: boolean;
  // Line number in the original file
  lineNumber: number;
  // Indentation level (0 for top level)
  indent: number;
  // Reference to parent task (if any)
  parentTask?: TodoTask;
  // Child tasks
  childTasks: TodoTask[];
  // Whether all child tasks are complete (if has children)
  allChildrenComplete: boolean;
  // Effective completion status (considering children)
  effectivelyComplete: boolean;
};

/**
 * Extracts task items from markdown text
 * @param markdownText The markdown text to parse
 * @returns Array of task items
 */
export const extractTasks = (markdownText: string): TodoTask[] => {
  // Split the text into lines
  const lines = markdownText.split('\n');
  const rawTasks: TodoTask[] = [];

  // Regular expression for markdown task items
  // Matches:
  // - [ ] Task content
  // - [x] Completed task
  // - [X] Also completed task
  // Also captures indentation
  const taskRegex = /^(\s*)[-*] \[([ xX])\] (.+)$/;

  // Process each line to extract raw tasks
  lines.forEach((line, index) => {
    const match = line.match(taskRegex);
    if (match) {
      const [, indentation, checkmark, content] = match;

      // Calculate indentation level (number of spaces / 2)
      // This is an approximation - proper markdown parsers would take list structure into account
      const indent = Math.floor(indentation.length / 2);

      rawTasks.push({
        text: line.trim(),
        content: content.trim(),
        completed: checkmark.toLowerCase() === 'x',
        lineNumber: index + 1, // Line numbers are 1-based
        indent,
        childTasks: [],
        allChildrenComplete: true, // Default true, will be updated later
        effectivelyComplete: checkmark.toLowerCase() === 'x', // Initially same as completed, will be updated
      });
    }
  });

  // Build task hierarchy
  const taskStack: TodoTask[] = [];
  const rootTasks: TodoTask[] = [];

  // Process tasks in order
  for (const task of rawTasks) {
    // Pop tasks from stack until we find a parent with lower indent
    while (taskStack.length > 0 && taskStack[taskStack.length - 1].indent >= task.indent) {
      taskStack.pop();
    }

    if (taskStack.length === 0) {
      // This is a root task
      rootTasks.push(task);
    } else {
      // This is a child task, assign to its parent
      const parent = taskStack[taskStack.length - 1];
      task.parentTask = parent;
      parent.childTasks.push(task);
    }

    // Push this task onto the stack for potential children
    taskStack.push(task);
  }

  // Calculate allChildrenComplete and effectivelyComplete for each task
  updateCompletionStatus(rootTasks);

  // Return all tasks
  return rawTasks;
};

/**
 * Recursively updates the completion status of tasks and their children
 * @param tasks Array of tasks to update
 * @returns true if all tasks are effectively complete
 */
const updateCompletionStatus = (tasks: TodoTask[]): boolean => {
  let allComplete = true;

  for (const task of tasks) {
    // First, recursively check children
    const childrenComplete = task.childTasks.length > 0 ? updateCompletionStatus(task.childTasks) : true;

    // Update child completion flag
    task.allChildrenComplete = childrenComplete;

    // A task is effectively complete if:
    // 1. It is marked as complete itself
    // 2. AND all its children are effectively complete
    task.effectivelyComplete = task.completed && task.allChildrenComplete;

    // Update the aggregate result
    allComplete = allComplete && task.effectivelyComplete;
  }

  return allComplete;
};

/**
 * Extracts heading context for tasks
 * @param markdownText The markdown text to parse
 * @returns Map of line numbers to heading context
 */
export const extractHeadingContext = (markdownText: string): Map<number, string> => {
  const lines = markdownText.split('\n');
  const headingContext = new Map<number, string>();
  let currentHeading = '';
  let currentHeadingLevel = 0;

  // Regular expression for markdown headings
  const headingRegex = /^(#{1,6})\s+(.+)$/;

  lines.forEach((line, index) => {
    const match = line.match(headingRegex);
    if (match) {
      const [, hashes, heading] = match;
      const level = hashes.length;

      // If this heading is at the same or higher level than the current one,
      // it replaces the current heading
      if (level <= currentHeadingLevel || currentHeadingLevel === 0) {
        currentHeading = heading.trim();
        currentHeadingLevel = level;
      }
    }

    // Store the current heading for this line
    headingContext.set(index + 1, currentHeading);
  });

  return headingContext;
};

/**
 * Combines task information with heading context
 * @param tasks Array of task items
 * @param headingContext Map of line numbers to heading context
 * @returns Array of tasks with context
 */
export type TodoTaskWithContext = TodoTask & {
  // Heading context for the task
  context: string;
};

export const addContextToTasks = (tasks: TodoTask[], headingContext: Map<number, string>): TodoTaskWithContext[] => {
  // Add context to each task
  const result = tasks.map((task) => ({
    ...task,
    context: headingContext.get(task.lineNumber) || '',
  }));

  // All other properties (parentTask, childTasks, etc.) are already part of the task object
  return result;
};

/**
 * Count completed and total tasks
 * @param tasks Array of task items
 * @returns Object with counts
 */
export const countTasks = (tasks: TodoTask[]): { completed: number; total: number } => {
  const completed = tasks.filter((task) => task.completed).length;
  return {
    completed,
    total: tasks.length,
  };
};

/**
 * Process markdown text to extract tasks with context
 * @param markdownText The markdown text to parse
 * @returns Array of tasks with context and count information
 */
export const processTasks = (
  markdownText: string,
): {
  tasks: TodoTaskWithContext[];
  counts: { completed: number; total: number };
} => {
  const tasks = extractTasks(markdownText);
  const headingContext = extractHeadingContext(markdownText);
  const tasksWithContext = addContextToTasks(tasks, headingContext);
  const counts = countTasks(tasks);

  return {
    tasks: tasksWithContext,
    counts,
  };
};
