/**
 * Command line options type
 */
export type CliOptions = {
  input: string[];
  flags: {
    verbose: boolean;
    version: boolean;
    help: boolean;
    tasks?: boolean;
    detailed?: boolean;
    [key: string]: unknown;
  };
};
