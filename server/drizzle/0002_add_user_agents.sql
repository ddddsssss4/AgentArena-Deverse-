CREATE TABLE IF NOT EXISTS user_agents (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()) NOT NULL
);
