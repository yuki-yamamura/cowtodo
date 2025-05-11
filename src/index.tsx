import { render } from "ink";
import meow from "meow";
import { App } from "./components/App.js";

// Parse command line arguments
const cli = meow(
  `
  Usage
    $ cowtodo <file> [options]

  Arguments
    <file>  Path to a markdown file to read

  Options
    --verbose  Show verbose output
    --version  Show version
    --help     Show this help message

  Examples
    $ cowtodo README.md
    $ cowtodo docs/todo.md --verbose
`,
  {
    importMeta: import.meta,
    flags: {
      verbose: {
        type: "boolean",
        default: false,
      },
      version: {
        type: "boolean",
        default: false,
        shortFlag: "v",
      },
      help: {
        type: "boolean",
        default: false,
        shortFlag: "h",
      },
    },
  }
);

// Render the app
render(<App options={cli} />);
