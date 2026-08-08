// @ts-nocheck this file is just a template
import { Hono } from "hono";
import { federation } from "@fedify/hono";
import fedi from "./federation.ts";
import { Layout, SetupForm, Profile } from "./views";
import db from "./db.ts";
import type { Actor, User } from "./schema.ts";

const app = new Hono();
app.use(federation(fedi, () => undefined));

app.get("/", (c) => c.text("Hello, Fedify!"));
app.get("/setup", (c) => {
  try {
    const user = db
      .prepare<unknown[], User>(`
                                           SELECT * FROM users
                                           JOIN actors ON (users.id = actors.user_id)
                                           LIMIT 1
                                           `)
      .get();
    if (user != null) {
      return c.redirect("/");
    }
  return c.html(
    <Layout>
      <SetupForm />
    </Layout>,
  );

  } catch (e) {
    console.error(e);
    return c.text(e)
  }
});

app.post("/setup", async (c) => {
  try {
    const user = db
      .prepare<unknown[], User>(
        `
                                           SELECT * FROM users
                                           JOIN actors ON (users.id = actors.user_id)
                                           LIMIT 1
                                           `,
      )
      .get();
    if (user != null) return c.redirect("/");

    const form = await c.req.formData();
    const username = form.get("username");

    if (typeof username !== "string" || !username.match(/[a-z0-9_-]{1,50}$/)) {
      return c.redirect("/setup");
    }

    const name = form.get("name");
    if (typeof name !== "string" || name.trim() === "") {
      return c.redirect("/setup");
    }

    const url = new URL(c.req.url);
    const handle = `@${username}@${url.host}`;
    const ctx = fedi.createContext(c.req.raw, undefined);

    db.transaction(() => {
      db.prepare(
        "INSERT OR REPLACE INTO users (id, username) VALUES (1, ?)",
      ).run(username);

      db.prepare(`
               INSERT OR REPLACE INTO actors
                (user_id, uri, handle, name, inbox_url, shared_inbox_url, url)
               VALUES (1, ?, ?, ?, ?, ?, ?)
               `).run(
        ctx.getActorUri(username).href,
        handle,
        name,
        ctx.getInboxUri(username).href,
        ctx.getInboxUri().href,
        ctx.getActorUri(username).href,
      );
    })();

    return c.redirect("/");
  } catch (e) {
    console.error(e);
    return c.text(e)
  }
});

app.get("/users/:username", async (c) => {
  try {
    const user = db // A & B => A이면서 B타입 교집합?
      .prepare<unknown[], User & Actor>(`
                                       SELECT * FROM users
                                       JOIN actors ON (users.id = actors.user_id)  
                                       WHERE username = ?
                                         `)
      .get(c.req.param("username"));

    if (user == null) {
      return c.notFound;
    }

    const url = new URL(c.req.url);
    const handle = `@${user.username}@${url.host}`;


  return c.html(
    <Layout>
      <Profile name={user.name ?? user.username} handle={handle} />
    </Layout>,
  );
  } catch (e) {
    console.error(e);
    return c.text(e)
  }

});

export default app;
