// @ts-nocheck this file is just a template
import { Hono } from "hono";
import { federation } from "@fedify/hono";
import fedi from "./federation.ts";
import { Layout, Setup } from "./views";
import db from "./db.ts";
import type { User } from "./schema.ts";

const app = new Hono();
app.use(federation(fedi, () => undefined));

app.get("/", (c) => c.text("Hello, Fedify!"));
app.get("/setup", (c) => {
  const user = db.prepare<unknown[], User>("SELECT * FROM users LIMIT 1").get();
  if (user != null) {
    return c.redirect("/");
  }
  return c.html(
    <Layout>
      <Setup />
    </Layout>,
  );
});

app.post("/setup", async (c) => {
  const user = db.prepare<unknown[], User>("SELECT * FROM users LIMIT 1").get();
  if (user != null) return c.redirect("/");

  const form = await c.req.formData();
  const username = form.get("username");
  if (typeof username !== "string" || !username.match(/[a-z0-9_-]{1,50}$/)) {
    return c.redirect("/setup");
  }

  db.prepare("INSERT INTO users (username) VALUES (?)").run(username);
  return c.redirect("/");
});

export default app;
