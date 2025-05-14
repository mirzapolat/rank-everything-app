
/// <reference types="vite/client" />

declare namespace JSX {
  interface InputHTMLAttributes extends React.HTMLAttributes<HTMLInputElement> {
    directory?: string;
    webkitdirectory?: string;
  }
}
