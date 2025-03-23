import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { getDb } from "./plugins/db.js";

const app = new Hono();

app.get(
  "*",
  cache({ cacheName: "my-app", cacheControl: "max-age=3600", wait: true })
);

app.get("/", async (c) => {
  const db = await getDb(c);
  const result = await db.collection("collections").find({}).toArray();
  return c.json(result);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
