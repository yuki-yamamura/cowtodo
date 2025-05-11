import React from "react";
import { Box, Text } from "ink";
import type { FileTask, TaskCollection } from "../utils/tasks.js";

interface TaskViewProps {
  tasks: TaskCollection;
  showDetails?: boolean;
}

/**
 * Component to display a single task
 */
const TaskItem: React.FC<{ task: FileTask; showFileName?: boolean }> = ({
  task,
  showFileName = false,
}) => {
  // Checkbox indicator for task status
  const checkbox = task.completed ? "[x]" : "[ ]";

  // Calculate total indentation (based on task's original indent + our presentation)
  const indentSize = 2 + task.indent * 2;
  const indent = " ".repeat(indentSize);

  return (
    <Box flexDirection="column">
      <Box>
        <Text>
          <Text color={task.completed ? "green" : "yellow"}>{checkbox}</Text>
          <Text>
            {" "}
            {indent}
            {task.content}
          </Text>
        </Text>
      </Box>
      {showFileName && (
        <Box marginLeft={4}>
          <Text color="gray">📄 {task.fileName}</Text>
        </Box>
      )}
    </Box>
  );
};

/**
 * Component to display a task group with heading
 */
const TaskGroup: React.FC<{
  title: string;
  tasks: FileTask[];
  showFileNames?: boolean;
}> = ({ title, tasks, showFileNames = false }) => {
  // Skip empty groups
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box marginBottom={1}>
        <Text bold color="blue">
          {title} ({tasks.length})
        </Text>
      </Box>

      {tasks.map((task, index) => (
        <TaskItem key={index} task={task} showFileName={showFileNames} />
      ))}
    </Box>
  );
};

/**
 * Component to display task summary
 */
const TaskSummary: React.FC<{ summary: TaskCollection["summary"] }> = ({ summary }) => {
  const { totalFiles, totalTasks, completedTasks, completionPercentage } = summary;

  return (
    <Box flexDirection="column" marginBottom={1} borderStyle="round" paddingX={1}>
      <Text bold>Task Summary</Text>
      <Text>Files: {totalFiles}</Text>
      <Text>
        Tasks: {completedTasks}/{totalTasks} ({completionPercentage}% complete)
      </Text>
    </Box>
  );
};

/**
 * Main component to display all tasks
 */
export const TaskView: React.FC<TaskViewProps> = ({ tasks, showDetails = false }) => {
  // Get tasks grouped by files
  const { tasksByFile, summary, allTasks } = tasks;

  // Get completed and pending tasks
  const completedTasks = allTasks.filter((task) => task.completed);
  const pendingTasks = allTasks.filter((task) => !task.completed);

  // If there are no tasks, show a message
  if (allTasks.length === 0) {
    return (
      <Box>
        <Text>No tasks found in the provided files.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <TaskSummary summary={summary} />

      {showDetails ? (
        // Detailed view: Show by file
        <Box flexDirection="column">
          {Array.from(tasksByFile.entries()).map(([filePath, fileTasks], index) => (
            <TaskGroup key={index} title={`${filePath} (${fileTasks.length})`} tasks={fileTasks} />
          ))}
        </Box>
      ) : (
        // Simple view: Just pending and completed
        <Box flexDirection="column">
          <TaskGroup title="Pending Tasks" tasks={pendingTasks} showFileNames={true} />

          <TaskGroup title="Completed Tasks" tasks={completedTasks} showFileNames={true} />
        </Box>
      )}
    </Box>
  );
};
