import { render } from 'ink';
import meow from 'meow';
import { App } from '@/components/app.js';

// Parse command line arguments
const cli = meow(
  `
  Usage
    $ cowtodo <file> [options]

  Arguments
    <file>  Path to a markdown file to read

  Options
    --tasks    Show tasks in structured view (default: cowsay view)
    --detailed Show task details by file (with --tasks)
    --verbose  Show verbose output
    --version  Show version
    --help     Show this help message

  Examples
    $ cowtodo README.md
    $ cowtodo docs/todo.md --verbose
    $ cowtodo docs/todo.md --tasks
    $ cowtodo docs/todo.md --tasks --detailed
`,
  {
    importMeta: import.meta,
    flags: {
      tasks: {
        type: 'boolean',
        default: false,
      },
      detailed: {
        type: 'boolean',
        default: false,
      },
      verbose: {
        type: 'boolean',
        default: false,
      },
      version: {
        type: 'boolean',
        default: false,
        shortFlag: 'v',
      },
      help: {
        type: 'boolean',
        default: false,
        shortFlag: 'h',
      },
    },
  },
);

// Render the app
render(<App options={cli} />);
