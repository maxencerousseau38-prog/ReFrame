import { promises as fs } from "fs";
import path from "path";
import type { PublishedSite, StoreBackend } from "./types";

/**
 * Filesystem backend — the zero-config default.
 *
 * Persists one JSON file per site under a data dir. Works for local/dev and
 * single-instance deployments. Not suitable for serverless (ephemeral, often
 * read-only filesystem) or multi-instance — use the KV backend there.
 */

const DATA_DIR = process.env.REFRAME_DATA_DIR
  ? path.resolve(process.env.REFRAME_DATA_DIR)
  : path.join(process.cwd(), ".data", "sites");

function fileFor(slug: string): string {
  return path.join(DATA_DIR, `${slug}.json`);
}

export const fsBackend: StoreBackend = {
  name: "filesystem",

  async read(slug) {
    try {
      const raw = await fs.readFile(fileFor(slug), "utf8");
      return JSON.parse(raw) as PublishedSite;
    } catch {
      return null;
    }
  },

  async write(record) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(fileFor(record.slug), JSON.stringify(record), "utf8");
  },

  async list() {
    let names: string[];
    try {
      names = await fs.readdir(DATA_DIR);
    } catch {
      return [];
    }
    const records = await Promise.all(
      names
        .filter((n) => n.endsWith(".json"))
        .map(async (n) => {
          try {
            return JSON.parse(
              await fs.readFile(path.join(DATA_DIR, n), "utf8")
            ) as PublishedSite;
          } catch {
            return null;
          }
        })
    );
    return records
      .filter((s): s is PublishedSite => s !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
