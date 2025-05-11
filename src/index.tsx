import { render, Text, Box } from "ink";
import cowsay from "cowsay";

// Simple component that wraps cowsay
function App() {
  // Get the cowsay output
  const message = "Hello from Cowtodo!";
  const options = {
    text: message,
  };

  const cowOutput = cowsay.say(options);

  return (
    <Box flexDirection="column">
      <Text>{cowOutput}</Text>
    </Box>
  );
}

// Render the app
render(<App />);
