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

  // Calculate indentation (2 spaces per level)
  const indent = " ".repeat(task.indent * 2);

  return (
    <Box flexDirection="column">
      <Box>
        <Text>
          {/* Use plain text without color to match spec */}
          <Text>
            {indent}- {checkbox} {task.content}
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

// TaskSummary component has been removed as it's no longer used

/**
 * Main component to display all tasks
 */
export const TaskView: React.FC<TaskViewProps> = ({ tasks, showDetails = false }) => {
  // Get tasks grouped by files
  const { tasksByFile, allTasks } = tasks;

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
      {showDetails ? (
        // Detailed view: Show by file
        <Box flexDirection="column">
          {Array.from(tasksByFile.entries()).map(([filePath, fileTasks], index) => (
            <TaskGroup key={index} title={`${filePath} (${fileTasks.length})`} tasks={fileTasks} />
          ))}
        </Box>
      ) : (
        // Standard view with Backlog and Done sections
        <Box flexDirection="column">
          <Box>
            <Text bold>## Backlog</Text>
          </Box>
          <Box marginY={1}>
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task, index) => (
                <TaskItem key={index} task={task} showFileName={false} />
              ))
            ) : (
              <Text>No pending tasks</Text>
            )}
          </Box>

          <Box marginTop={1}>
            <Text bold>## Done</Text>
          </Box>
          <Box marginY={1}>
            {completedTasks.length > 0 ? (
              completedTasks.map((task, index) => (
                <TaskItem key={index} task={task} showFileName={false} />
              ))
            ) : (
              <Text>No completed tasks</Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
