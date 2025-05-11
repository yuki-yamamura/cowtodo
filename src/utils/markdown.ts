/**
 * Represents a task item in markdown
 */
export interface TodoTask {
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
}

/**
 * Extracts task items from markdown text
 * @param markdownText The markdown text to parse
 * @returns Array of task items
 */
export function extractTasks(markdownText: string): TodoTask[] {
  // Split the text into lines
  const lines = markdownText.split("\n");
  const tasks: TodoTask[] = [];

  // Regular expression for markdown task items
  // Matches:
  // - [ ] Task content
  // - [x] Completed task
  // - [X] Also completed task
  // Also captures indentation
  const taskRegex = /^(\s*)[-*] \[([ xX])\] (.+)$/;

  // Process each line
  lines.forEach((line, index) => {
    const match = line.match(taskRegex);
    if (match) {
      const [, indentation, checkmark, content] = match;

      // Calculate indentation level (number of spaces / 2)
      // This is an approximation - proper markdown parsers would take list structure into account
      const indent = Math.floor(indentation.length / 2);

      tasks.push({
        text: line.trim(),
        content: content.trim(),
        completed: checkmark.toLowerCase() === "x",
        lineNumber: index + 1, // Line numbers are 1-based
        indent,
      });
    }
  });

  return tasks;
}

/**
 * Extracts heading context for tasks
 * @param markdownText The markdown text to parse
 * @returns Map of line numbers to heading context
 */
export function extractHeadingContext(markdownText: string): Map<number, string> {
  const lines = markdownText.split("\n");
  const headingContext = new Map<number, string>();
  let currentHeading = "";
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
}

/**
 * Combines task information with heading context
 * @param tasks Array of task items
 * @param headingContext Map of line numbers to heading context
 * @returns Array of tasks with context
 */
export interface TodoTaskWithContext extends TodoTask {
  // Heading context for the task
  context: string;
}

export function addContextToTasks(
  tasks: TodoTask[],
  headingContext: Map<number, string>
): TodoTaskWithContext[] {
  return tasks.map((task) => ({
    ...task,
    context: headingContext.get(task.lineNumber) || "",
  }));
}

/**
 * Count completed and total tasks
 * @param tasks Array of task items
 * @returns Object with counts
 */
export function countTasks(tasks: TodoTask[]): { completed: number; total: number } {
  const completed = tasks.filter((task) => task.completed).length;
  return {
    completed,
    total: tasks.length,
  };
}

/**
 * Process markdown text to extract tasks with context
 * @param markdownText The markdown text to parse
 * @returns Array of tasks with context and count information
 */
export function processTasks(markdownText: string): {
  tasks: TodoTaskWithContext[];
  counts: { completed: number; total: number };
} {
  const tasks = extractTasks(markdownText);
  const headingContext = extractHeadingContext(markdownText);
  const tasksWithContext = addContextToTasks(tasks, headingContext);
  const counts = countTasks(tasks);

  return {
    tasks: tasksWithContext,
    counts,
  };
}
