declare module 'cowsay' {
  type CowsayOptions = {
    text: string;
    e?: string;
    T?: string;
    f?: string;
    r?: boolean;
    n?: boolean;
  };

  // eslint-disable-next-line no-unused-vars
  export function say(options: CowsayOptions): string;
  // eslint-disable-next-line no-unused-vars
  export function think(options: CowsayOptions): string;
  export const list: string[];
}
