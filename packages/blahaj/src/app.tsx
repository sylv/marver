import { type FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Sidebar } from './components/sidebar';
import { ThemeProvider } from './components/theme-provider';
import './globals.css';

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
