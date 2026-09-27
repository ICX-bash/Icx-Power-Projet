import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, partnershipRequests, serviceDocuments, serviceRequests, userNotifications, users, workflowProgress } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createServiceRequest(input: typeof serviceRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(serviceRequests).values(input);
  return { success: true, id: Number(result[0].insertId) } as const;
}

export async function addServiceDocument(input: typeof serviceDocuments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(serviceDocuments).values(input);
  return { success: true } as const;
}

export async function getServiceDocumentsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceDocuments).where(eq(serviceDocuments.userId, userId)).orderBy(desc(serviceDocuments.createdAt));
}


export async function createUserNotification(input: typeof userNotifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(userNotifications).values(input);
  return { success: true } as const;
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userNotifications).where(eq(userNotifications.userId, userId)).orderBy(desc(userNotifications.createdAt));
}

export async function getServiceRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).limit(1);
  return rows[0];
}

export async function updateServiceRequestStatus(id: number, status: typeof serviceRequests.$inferInsert.status) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id));
  return { success: true } as const;
}

export async function getServiceRequestsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceRequests).where(eq(serviceRequests.userId, userId)).orderBy(desc(serviceRequests.updatedAt));
}

export async function saveWorkflowProgress(input: typeof workflowProgress.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select().from(workflowProgress).where(and(
    eq(workflowProgress.userId, input.userId),
    eq(workflowProgress.serviceKey, input.serviceKey),
    eq(workflowProgress.need, input.need),
    eq(workflowProgress.status, "in_progress"),
  )).limit(1);
  if (existing[0]) {
    await db.update(workflowProgress).set({ step: input.step, answers: input.answers ?? null }).where(eq(workflowProgress.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(workflowProgress).values(input);
  return Number(result[0].insertId);
}

export async function getWorkflowProgressForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workflowProgress).where(and(eq(workflowProgress.userId, userId), eq(workflowProgress.status, "in_progress"))).orderBy(desc(workflowProgress.updatedAt));
}

export async function createPartnershipRequest(input: typeof partnershipRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(partnershipRequests).values(input);
  return { success: true } as const;
}

export async function getPartnershipRequestsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnershipRequests).where(eq(partnershipRequests.userId, userId)).orderBy(desc(partnershipRequests.updatedAt));
}
