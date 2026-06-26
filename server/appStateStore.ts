import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Express, Request, Response } from "express";
import { initialMistakes, defaultProfile } from "../src/mockData";

type StateRow = {
  state_key: string;
  state_value: string;
  updated_at: string;
};

type StatePayload = Record<string, string>;

let database: DatabaseSync | null = null;
let databasePath = "";

const seedState: StatePayload = {
  clm_user_mistakes: JSON.stringify(initialMistakes),
  clm_user_profile: JSON.stringify(defaultProfile),
  clm_user_streak: "25",
  clm_is_logged_in: "false",
  clm_user_evaluations: "[]",
};

function getDatabasePath() {
  const configuredPath = process.env.DATABASE_PATH || "data/app.sqlite";
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);
}

function validateStateKey(key: unknown): key is string {
  return typeof key === "string" && key.length > 0 && key.length <= 160;
}

function getDatabase() {
  if (database) {
    return database;
  }

  databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS app_state (
      state_key TEXT PRIMARY KEY,
      state_value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;
  `);

  const existing = database
    .prepare("SELECT COUNT(*) AS count FROM app_state")
    .get() as { count: number };

  if (existing.count === 0) {
    const now = new Date().toISOString();
    const insert = database.prepare(
      "INSERT INTO app_state (state_key, state_value, updated_at) VALUES (?, ?, ?)",
    );

    for (const [key, value] of Object.entries(seedState)) {
      insert.run(key, value, now);
    }
  }

  return database;
}

export function getAppStateDatabaseInfo() {
  getDatabase();
  return {
    adapter: "sqlite",
    path: databasePath,
  };
}

export function getAllAppState() {
  const db = getDatabase();
  const rows = db
    .prepare("SELECT state_key, state_value, updated_at FROM app_state ORDER BY state_key")
    .all() as StateRow[];

  return rows.reduce<StatePayload>((result, row) => {
    result[row.state_key] = row.state_value;
    return result;
  }, {});
}

export function getAppStateValue(key: string) {
  const db = getDatabase();
  const row = db
    .prepare("SELECT state_key, state_value, updated_at FROM app_state WHERE state_key = ?")
    .get(key) as StateRow | undefined;

  return row || null;
}

export function setAppStateValue(key: string, value: string) {
  const db = getDatabase();
  const updatedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO app_state (state_key, state_value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(state_key) DO UPDATE SET
      state_value = excluded.state_value,
      updated_at = excluded.updated_at
  `).run(key, value, updatedAt);

  return {
    key,
    value,
    updatedAt,
  };
}

export function setManyAppStateValues(data: StatePayload) {
  const entries = Object.entries(data);
  const db = getDatabase();

  db.exec("BEGIN");
  try {
    for (const [key, value] of entries) {
      if (!validateStateKey(key) || typeof value !== "string") {
        throw new Error(`Invalid state payload for key: ${String(key)}`);
      }

      const updatedAt = new Date().toISOString();
      db.prepare(`
        INSERT INTO app_state (state_key, state_value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(state_key) DO UPDATE SET
          state_value = excluded.state_value,
          updated_at = excluded.updated_at
      `).run(key, value, updatedAt);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return entries.length;
}

export function deleteAppStateValue(key: string) {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM app_state WHERE state_key = ?").run(key);
  return result.changes || 0;
}

function handleRouteError(res: Response, error: unknown) {
  console.error("App state database error:", error);
  res.status(500).json({
    error: "DATABASE_ERROR",
    message: "数据库状态读写失败，请检查 DATABASE_PATH 配置和文件权限。",
  });
}

export function registerAppStateRoutes(app: Express) {
  const info = getAppStateDatabaseInfo();
  console.log(`SQLite app state database ready at ${info.path}`);

  app.get("/api/health", (_req: Request, res: Response) => {
    try {
      getDatabase();
      res.json({
        status: "ok",
        database: {
          adapter: "sqlite",
          connected: true,
        },
      });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/state", (_req: Request, res: Response) => {
    try {
      res.json({
        data: getAllAppState(),
      });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/state/:key", (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      if (!validateStateKey(key)) {
        res.status(400).json({ error: "INVALID_KEY" });
        return;
      }

      const row = getAppStateValue(key);
      if (!row) {
        res.status(404).json({ error: "NOT_FOUND" });
        return;
      }

      res.json({
        key: row.state_key,
        value: row.state_value,
        updatedAt: row.updated_at,
      });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/state/:key", (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value } = req.body || {};

      if (!validateStateKey(key)) {
        res.status(400).json({ error: "INVALID_KEY" });
        return;
      }

      if (typeof value !== "string") {
        res.status(400).json({ error: "INVALID_VALUE" });
        return;
      }

      res.json(setAppStateValue(key, value));
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/state/bulk", (req: Request, res: Response) => {
    try {
      const { data } = req.body || {};

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        res.status(400).json({ error: "INVALID_PAYLOAD" });
        return;
      }

      const saved = setManyAppStateValues(data as StatePayload);
      res.json({ saved });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/state/:key", (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      if (!validateStateKey(key)) {
        res.status(400).json({ error: "INVALID_KEY" });
        return;
      }

      const deleted = deleteAppStateValue(key);
      res.json({ deleted });
    } catch (error) {
      handleRouteError(res, error);
    }
  });
}
