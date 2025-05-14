
/// <reference types="vite/client" />

declare namespace React {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

declare module JSX {
  interface IntrinsicElements {
    input: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >;
  }
}
