import type { FC } from "hono/jsx";

export const Layout: FC = (props) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>title</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
    </head>
    <body>{props.children}</body>
  </html>
);

export const Setup: FC = () => (
  <>
    <h1>Set up your microblog</h1>
    <form method="post" action="/setup">
      <fieldset>
        <label>
          Username{" "}
          <input type="text" name="username" required maxlength={50} pattern="^[a-z0-9_\-]+$" />
        </label>
      </fieldset>
      <input type="submit" value="Setup" />
    </form>
  </>
);
