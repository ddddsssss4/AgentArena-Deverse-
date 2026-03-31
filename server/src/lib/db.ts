import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc } from "drizzle-orm";
import { users, sessions, chatTurns, npcKnowledge, userNpcSettings } from "../db/schema";
import type { User, UserNpcSetting, NpcKnowledge } from "../db/schema";

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema: { users, sessions, chatTurns, npcKnowledge, userNpcSettings } });
}

// ─── User helpers ───────────────────────────────────────────────────────────

export async function upsertUser(
  d1: D1Database,
  data: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }
): Promise<User> {
  const db = getDb(d1);

  // Try to find existing user by googleId
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.googleId, data.googleId))
    .limit(1);

  if (existing.length > 0) {
    // Update name/avatar in case they changed
    const updated = await db
      .update(users)
      .set({ name: data.name, avatarUrl: data.avatarUrl })
      .where(eq(users.id, existing[0].id))
      .returning();
    return updated[0];
  }

  // Create new user
  const id = crypto.randomUUID();
  const inserted = await db
    .insert(users)
    .values({
      id,
      googleId: data.googleId,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      color: randomPlayerColor(),
    })
    .returning();

  return inserted[0];
}

export async function getUserById(
  d1: D1Database,
  userId: string
): Promise<User | null> {
  const db = getDb(d1);
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0] ?? null;
}

// ─── Session helpers ─────────────────────────────────────────────────────────

export async function createSession(
  d1: D1Database,
  userId: string
): Promise<string> {
  const db = getDb(d1);
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({ id, userId, expiresAt });
  return id;
}

export async function getSessionUser(
  d1: D1Database,
  sessionId: string
): Promise<User | null> {
  const db = getDb(d1);
  const result = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!result[0]) return null;

  // Check expiry
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session[0] || session[0].expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return result[0].user;
}

export async function deleteSession(
  d1: D1Database,
  sessionId: string
): Promise<void> {
  const db = getDb(d1);
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// ─── Chat Turn helpers ────────────────────────────────────────────────────────

export async function saveChatTurn(
  d1: D1Database,
  data: {
    userId: string;
    npcId: string;
    role: "user" | "npc";
    content: string;
  }
): Promise<void> {
  const db = getDb(d1);
  await db.insert(chatTurns).values({
    id: crypto.randomUUID(),
    ...data,
  });
}

export async function getChatHistory(
  d1: D1Database,
  userId: string,
  npcId?: string,
  limit = 50
) {
  const db = getDb(d1);

  const conditions = [eq(chatTurns.userId, userId)];
  if (npcId) conditions.push(eq(chatTurns.npcId, npcId));

  return db
    .select()
    .from(chatTurns)
    .where(and(...conditions))
    .orderBy(desc(chatTurns.createdAt))
    .limit(limit);
}

// ─── NPC Knowledge & Settings ──────────────────────────────────────────────────

export async function upsertUserNpcSettings(
  d1: D1Database,
  data: { userId: string; npcId: string; voiceId?: string; roleOverride?: string }
): Promise<void> {
  const db = getDb(d1);
  const existing = await db
    .select()
    .from(userNpcSettings)
    .where(and(eq(userNpcSettings.userId, data.userId), eq(userNpcSettings.npcId, data.npcId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userNpcSettings)
      .set({
        voiceId: data.voiceId ?? existing[0].voiceId,
        roleOverride: data.roleOverride ?? existing[0].roleOverride,
        updatedAt: new Date(),
      })
      .where(and(eq(userNpcSettings.userId, data.userId), eq(userNpcSettings.npcId, data.npcId)));
  } else {
    await db.insert(userNpcSettings).values({
      userId: data.userId,
      npcId: data.npcId,
      voiceId: data.voiceId,
      roleOverride: data.roleOverride,
    });
  }
}

export async function getUserNpcSettings(
  d1: D1Database,
  userId: string,
  npcId: string
): Promise<UserNpcSetting | null> {
  const db = getDb(d1);
  const result = await db
    .select()
    .from(userNpcSettings)
    .where(and(eq(userNpcSettings.userId, userId), eq(userNpcSettings.npcId, npcId)))
    .limit(1);
  return result[0] ?? null;
}

export async function addNpcKnowledge(
  d1: D1Database,
  data: { userId: string; npcId: string; content: string }
): Promise<void> {
  const db = getDb(d1);
  await db.insert(npcKnowledge).values({
    id: crypto.randomUUID(),
    userId: data.userId,
    npcId: data.npcId,
    content: data.content,
  });
}

export async function getNpcKnowledge(
  d1: D1Database,
  userId: string,
  npcId: string
): Promise<NpcKnowledge[]> {
  const db = getDb(d1);
  return db
    .select()
    .from(npcKnowledge)
    .where(and(eq(npcKnowledge.userId, userId), eq(npcKnowledge.npcId, npcId)))
    .orderBy(desc(npcKnowledge.createdAt));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomPlayerColor(): string {
  const colors = [
    "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
    "#10b981", "#f59e0b", "#ef4444", "#14b8a6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
