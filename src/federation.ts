import { createFederation } from "@fedify/fedify";
import { Endpoints, Person } from "@fedify/vocab";
import db from "./db.ts";
import type { Actor, User } from "./schema.ts";
import { getLogger } from "@logtape/logtape";
import { InProcessMessageQueue, MemoryKvStore } from "@fedify/fedify";

const logger = getLogger("microblog");

const federation = createFederation({
  kv: new MemoryKvStore(),
  queue: new InProcessMessageQueue(),
});


//  양쪽에 정의

federation.setActorDispatcher(
  "/users/{identifier}",
  async (ctx, identifier) => {
    try {
      const user = db
        .prepare<unknown[], User & Actor>(
          `
  SELECT * FROM users
  JOIN actors ON (users.id = actors.user_id)
  WHERE users.username = ?
  `,
        )
        .get(identifier);

      if (user == null) return null;
      logger.info("Dispatching actor {identifier}", { identifier });
      return new Person({
        id: ctx.getActorUri(identifier),
        preferredUsername: identifier,
        name: identifier,
        inbox: ctx.getInboxUri(identifier),
        endpoints: new Endpoints({
          sharedInbox: ctx.getInboxUri()
        }),
        url:ctx.getActorUri(identifier)
      });
    } catch (e) {
      console.error(e);
    }
  },
);

federation.setInboxListeners("/users/{identifier}/inbox", "/inbox");

export default federation;
