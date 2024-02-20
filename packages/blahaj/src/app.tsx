import { type FC } from 'react';
import './globals.css';
import { ModeToggle } from './components/mode-toggle';
import { ThemeProvider } from './components/theme-provider';
import { Helmet } from 'react-helmet-async';

interface AppProps {
  children: React.ReactNode;
}

export const App: FC<AppProps> = ({ children }) => (
  <ThemeProvider>
    <Helmet>
      <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png" />
      <link rel="shortcut icon" href="/icon/favicon.ico" />
      <link type="text/plain" rel="author" href="/humans.txt" />
      <title>marver</title>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
          const theme=localStorage.getItem("ui-theme");
          switch(theme){
            case "dark":
              document.documentElement.classList.add("dark");
              break;
            case "light":
              document.documentElement.classList.add("light");
              break;
            default:
              const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              document.documentElement.classList.add(prefers)}
          `,
        }}
      />
    </Helmet>
    <div className="flex">
      <Sidebar />
      {children}
    </div>
  </ThemeProvider>
);

const Sidebar: FC = () => {
  return (
    <div className="w-[300px] min-h-dvh bottom-0 top-0 bg-zinc-100 border-zinc-200 dark:bg-zinc-900 border-r dark:border-zinc-800 relative">
      <a href="/" className="block p-4 dark:text-white">
        marver
      </a>
      <ModeToggle />
    </div>
  );
};
