import { ScrollViewStyleReset } from 'expo-router/html';

/** Matches `constants/theme.ts` — keeps web shell from flashing white behind the app */
const APP_BG = '#0c0f14';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalShellCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalShellCss = `
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: ${APP_BG};
}
/* Expo web root */
#root, [data-expo-root] {
  min-height: 100%;
  background-color: ${APP_BG};
}
body {
  background-color: ${APP_BG} !important;
}
`;
