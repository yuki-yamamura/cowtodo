/**
 * Command line options interface
 */
export interface CliOptions {
  input: string[];
  flags: {
    verbose: boolean;
    version: boolean;
    help: boolean;
    [key: string]: unknown;
  };
}
