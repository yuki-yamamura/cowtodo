declare module 'cowsay' {
  interface CowsayOptions {
    text: string;
    e?: string;
    T?: string;
    f?: string;
    r?: boolean;
    n?: boolean;
  }

  export function say(options: CowsayOptions): string;
  export function think(options: CowsayOptions): string;
  export const list: string[];
}