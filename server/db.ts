import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";
import { InsertUser, auditLogs, emailLogs, integrationTokens, partnershipRequests, serviceDocuments, serviceRequests, userNotifications, users, workflowProgress } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export function createDatabasePool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const connection = new URL(connectionString);
  if (connection.protocol !== "mysql:" && connection.protocol !== "mariadb:") {
    throw new Error("DATABASE_URL must use the MySQL/TiDB protocol");
  }
  const host = connection.hostname;
  const configuredTls = process.env.DATABASE_SSL?.trim().toLowerCase();
  const useTls = configuredTls === "true" || (configuredTls !== "false" && /(^|\.)tidbcloud\.com$/i.test(host));
  return createPool({
    host,
    port: Number(connection.port || 3306),
    user: decodeURIComponent(connection.username),
    password: decodeURIComponent(connection.password),
    database: decodeURIComponent(connection.pathname.replace(/^\//, "")),
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    connectTimeout: 15_000,
    ...(useTls ? { ssl: { minVersion: "TLSv1.2" as const } } : {}),
  });
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(createDatabasePool());
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = field === "email" && typeof value === "string" ? value.trim().toLowerCase() : value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    const normalizedEmail = user.email?.trim().toLowerCase();
    const isPrincipal = user.openId === ENV.ownerOpenId || normalizedEmail === ENV.superAdminEmail;
    if (isPrincipal) {
      values.role = "admin";
      updateSet.role = "admin";
    } else if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt));
  return rows.map(account => ({ ...account, isProtectedPrincipal: account.openId === ENV.ownerOpenId || account.email?.toLowerCase() === ENV.superAdminEmail }));
}

export async function setUserRoleByEmail(email: string, role: "user" | "admin") {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === ENV.superAdminEmail && role !== "admin") throw new Error("The super-admin account cannot be demoted");
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const target = await db.select({ openId: users.openId }).from(users).where(sql`LOWER(${users.email}) = ${normalizedEmail}`).limit(1);
  if (!target[0]) throw new Error("No account found with that email");
  if (target[0].openId === ENV.ownerOpenId && role !== "admin") throw new Error("The owner account cannot be demoted");
  await db.update(users).set({ role }).where(sql`LOWER(${users.email}) = ${normalizedEmail}`);
  return { success: true } as const;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
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

export async function getAllServiceDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceDocuments).orderBy(desc(serviceDocuments.createdAt));
}

export async function getServiceDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(serviceDocuments).where(eq(serviceDocuments.id, id)).limit(1);
  return rows[0];
}

export async function getServiceDocumentByFileKey(fileKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(serviceDocuments).where(eq(serviceDocuments.fileKey, fileKey)).limit(1);
  return rows[0];
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

export async function getRecentAdminNotifications(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: userNotifications.id, userId: users.id, userName: users.name, email: users.email, title: userNotifications.title, content: userNotifications.content, read: userNotifications.read, createdAt: userNotifications.createdAt })
    .from(userNotifications).innerJoin(users, eq(userNotifications.userId, users.id)).orderBy(desc(userNotifications.createdAt)).limit(limit);
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

export async function updateServiceRequestAdmin(id: number, input: Partial<Pick<typeof serviceRequests.$inferInsert, "status" | "priority" | "assignedAdminEmail" | "adminNotes">>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const values: Record<string, unknown> = {};
  if (input.status !== undefined) values.status = input.status;
  if (input.priority !== undefined) values.priority = input.priority;
  if (input.assignedAdminEmail !== undefined) values.assignedAdminEmail = input.assignedAdminEmail;
  if (input.adminNotes !== undefined) values.adminNotes = input.adminNotes;
  if (!Object.keys(values).length) return { success: true } as const;
  await db.update(serviceRequests).set(values).where(eq(serviceRequests.id, id));
  return { success: true } as const;
}

export async function getServiceRequestsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceRequests).where(eq(serviceRequests.userId, userId)).orderBy(desc(serviceRequests.updatedAt));
}

export async function getAllServiceRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceRequests).orderBy(desc(serviceRequests.updatedAt));
}

export async function getAllServiceRequestsWithDocuments() {
  const [requests, documents] = await Promise.all([getAllServiceRequests(), getAllServiceDocuments()]);
  const byRequest = new Map<number, typeof documents>();
  for (const document of documents) {
    const list = byRequest.get(document.requestId) ?? [];
    list.push(document);
    byRequest.set(document.requestId, list);
  }
  return requests.map(request => ({ ...request, documents: byRequest.get(request.id) ?? [] }));
}

export async function addAuditLog(input: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(auditLogs).values(input);
}

export async function getAuditLogs(input: { entity?: string; entityId?: number; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return [];
  const where = input.entity && input.entityId !== undefined
    ? and(eq(auditLogs.entity, input.entity), eq(auditLogs.entityId, input.entityId))
    : input.entity ? eq(auditLogs.entity, input.entity) : undefined;
  const query = db.select().from(auditLogs);
  return (where ? query.where(where) : query).orderBy(desc(auditLogs.createdAt)).limit(Math.min(input.limit ?? 100, 500));
}

export async function saveIntegrationToken(input: typeof integrationTokens.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(integrationTokens).values(input).onDuplicateKeyUpdate({
    set: { accountEmail: input.accountEmail, encryptedRefreshToken: input.encryptedRefreshToken, updatedAt: new Date() },
  });
}

export async function getIntegrationToken(provider: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(integrationTokens).where(eq(integrationTokens.provider, provider)).limit(1);
  return rows[0];
}

export async function deleteIntegrationToken(provider: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(integrationTokens).where(eq(integrationTokens.provider, provider));
}

export async function addEmailLog(input: typeof emailLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(emailLogs).values(input);
}

export async function getEmailLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(Math.min(limit, 500));
}

export async function getUsersForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).orderBy(desc(users.createdAt));
}

export async function saveWorkflowProgress(input: typeof workflowProgress.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select().from(workflowProgress).where(and(
    eq(workflowProgress.userId, input.userId), eq(workflowProgress.serviceKey, input.serviceKey),
    eq(workflowProgress.need, input.need), eq(workflowProgress.status, "in_progress"),
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


export async function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) return { configured: false, connected: false };
  try {
    const db = await getDb();
    if (!db) return { configured: true, connected: false };
    await db.execute(sql`SELECT 1`);
    return { configured: true, connected: true };
  } catch {
    return { configured: true, connected: false };
  }
}
