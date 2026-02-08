/**
 * Firestore → Supabase データ移行スクリプト
 *
 * 使用方法:
 *   npx ts-node scripts/migrate-firestore-to-supabase.ts
 *
 * 必要な環境変数:
 *   GOOGLE_APPLICATION_CREDENTIALS - Firebase Admin SDK サービスアカウントキーのパス
 *   SUPABASE_URL - Supabase プロジェクトURL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service_role キー（RLSバイパス用）
 */

// @ts-ignore - firebase-admin is a runtime dependency for this script
import * as admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// 設定
// ============================================================

const SUPABASE_URL = process.env['SUPABASE_URL'] || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || "";
const BATCH_SIZE = 500;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  );
  process.exit(1);
}

// Firebase Admin初期化
admin.initializeApp();
const firestore = admin.firestore();

// Supabaseクライアント（service_role = RLSバイパス）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================================
// camelCase → snake_case 変換
// ============================================================

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function convertKeys(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertKeys);
  if (typeof obj !== "object") return obj;

  // Firestore Timestamp → ISO文字列
  if (obj.toDate && typeof obj.toDate === "function") {
    return obj.toDate().toISOString();
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = convertKeys(value);
  }
  return result;
}

// ============================================================
// コレクション別マッピング
// ============================================================

interface MigrationConfig {
  firestoreCollection: string;
  supabaseTable: string;
  transformDoc: (id: string, data: any) => any;
}

const migrations: MigrationConfig[] = [
  {
    firestoreCollection: "users",
    supabaseTable: "users",
    transformDoc: (id, data) => ({
      uid: id,
      email: data.email || null,
      nickname: data.nickname || "",
      role: data.role || "user",
      store_id: data.storeId || "",
      color: data.color || "#4A90E2",
      hourly_wage: data.hourlyWage || 1000,
      hashed_password: data.hashedPassword || null,
      current_password: data.currentPassword || null,
      real_email: data.realEmail || null,
      real_email_user_id: data.realEmailUserId || null,
      original_user_id: data.originalUserId || null,
      connected_stores: data.connectedStores || [],
      is_active: data.isActive ?? true,
      created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
  {
    firestoreCollection: "stores",
    supabaseTable: "stores",
    transformDoc: (id, data) => ({
      store_id: id,
      store_name: data.storeName || "",
      admin_uid: data.adminUid || "",
      admin_nickname: data.adminNickname || "",
      connected_stores: data.connectedStores || [],
      connection_password: data.connectionPassword || null,
      is_active: data.isActive ?? true,
      created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
  {
    firestoreCollection: "shifts",
    supabaseTable: "shifts",
    transformDoc: (id, data) => ({
      id,
      user_id: data.userId || "",
      store_id: data.storeId || "",
      nickname: data.nickname || "",
      date: data.date || "",
      start_time: data.startTime || "",
      end_time: data.endTime || "",
      type: data.type || "user",
      subject: data.subject || "",
      notes: data.notes || null,
      status: data.status || "draft",
      duration: typeof data.duration === "string" ? data.duration : String(data.duration || ""),
      is_completed: data.isCompleted || false,
      classes: data.classes || [],
      extended_tasks: data.extendedTasks || [],
      requested_changes: data.requestedChanges || null,
      tasks: data.tasks || null,
      comments: data.comments || null,
      approved_by: data.approvedBy || null,
      rejected_reason: data.rejectedReason || null,
      created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
  {
    firestoreCollection: "tasks",
    supabaseTable: "tasks",
    transformDoc: (id, data) => ({
      id,
      title: data.title || "",
      frequency: data.frequency || "",
      time_per_task: data.timePerTask || "",
      description: data.description || "",
      store_id: data.storeId || "",
      created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
  {
    firestoreCollection: "extendedTasks",
    supabaseTable: "extended_tasks",
    transformDoc: (id, data) => ({
      id,
      title: data.title || "",
      short_name: data.shortName || null,
      description: data.description || "",
      type: data.type || "standard",
      base_time_minutes: data.baseTimeMinutes || 0,
      base_count_per_shift: data.baseCountPerShift || 1,
      restricted_time_ranges: data.restrictedTimeRanges || [],
      restricted_start_time: data.restrictedStartTime || null,
      restricted_end_time: data.restrictedEndTime || null,
      required_role: data.requiredRole || null,
      tags: data.tags || [],
      priority: data.priority || "medium",
      difficulty: data.difficulty || "medium",
      color: data.color || null,
      icon: data.icon || null,
      valid_from: data.validFrom?.toDate?.()?.toISOString() || null,
      valid_to: data.validTo?.toDate?.()?.toISOString() || null,
      store_id: data.storeId || "",
      created_by: data.createdBy || "",
      is_active: data.isActive ?? true,
      created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
  {
    firestoreCollection: "taskExecutions",
    supabaseTable: "task_executions",
    transformDoc: (id, data) => ({
      id,
      shift_id: data.shiftId || "",
      task_id: data.taskId || "",
      actual_count: data.actualCount || 0,
      actual_time_minutes: data.actualTimeMinutes || 0,
      start_time: data.startTime || null,
      end_time: data.endTime || null,
      notes: data.notes || null,
      recorded_at: data.recordedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
  {
    firestoreCollection: "shiftChangeLogs",
    supabaseTable: "shift_change_logs",
    transformDoc: (id, data) => ({
      id,
      store_id: data.storeId || "",
      shift_id: data.shiftId || null,
      action: data.action || "",
      actor: data.actor || {},
      date: data.date || "",
      prev: data.prev || null,
      next: data.next || null,
      prev_snapshot: data.prevSnapshot || null,
      next_snapshot: data.nextSnapshot || null,
      summary: data.summary || "",
      notes: data.notes || null,
      created_at: data.timestamp?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
  {
    firestoreCollection: "settings",
    supabaseTable: "settings",
    transformDoc: (id, data) => {
      // Firestore settings: ドキュメントID = "shiftApp" (旧構造)
      // 新構造: store_id + settings_key
      const storeId = data.storeId || "";
      const settingsData = { ...data };
      delete settingsData.storeId;
      delete settingsData.createdAt;
      delete settingsData.updatedAt;

      return {
        id,
        store_id: storeId,
        settings_key: id === "shiftApp" ? "shiftApp" : id,
        data: settingsData,
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    },
  },
  {
    firestoreCollection: "reports",
    supabaseTable: "reports",
    transformDoc: (id, data) => ({
      id,
      shift_id: data.shiftId || "",
      task_counts: data.taskCounts || {},
      comments: data.comments || "",
      created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }),
  },
];

// ============================================================
// 移行関数
// ============================================================

async function migrateCollection(config: MigrationConfig): Promise<number> {
  console.log(
    `\n--- Migrating: ${config.firestoreCollection} → ${config.supabaseTable} ---`
  );

  const snapshot = await firestore.collection(config.firestoreCollection).get();
  const totalDocs = snapshot.size;
  console.log(`  Found ${totalDocs} documents`);

  if (totalDocs === 0) return 0;

  const rows = snapshot.docs.map((doc: any) =>
    config.transformDoc(doc.id, doc.data())
  );

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(config.supabaseTable).upsert(batch);

    if (error) {
      console.error(
        `  Error inserting batch ${i / BATCH_SIZE + 1}:`,
        error.message
      );
      // 個別に挿入を試みる
      for (const row of batch) {
        const { error: singleError } = await supabase
          .from(config.supabaseTable)
          .upsert(row);
        if (singleError) {
          console.error(
            `    Failed to insert document:`,
            JSON.stringify(row).substring(0, 200),
            singleError.message
          );
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
    }

    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, rows.length)}/${totalDocs}`);
  }

  console.log(`  Migrated: ${inserted}/${totalDocs}`);
  return inserted;
}

async function verifyMigration(): Promise<void> {
  console.log("\n=== Verification ===\n");

  for (const config of migrations) {
    const firestoreCount = (
      await firestore.collection(config.firestoreCollection).count().get()
    ).data().count;

    const { count: supabaseCount, error } = await supabase
      .from(config.supabaseTable)
      .select("*", { count: "exact", head: true });

    const sbCount = supabaseCount || 0;
    const match = firestoreCount === sbCount ? "OK" : "MISMATCH";

    console.log(
      `  ${config.firestoreCollection}: Firestore=${firestoreCount}, Supabase=${sbCount} [${match}]`
    );
  }
}

// ============================================================
// メイン処理
// ============================================================

async function main(): Promise<void> {
  console.log("=== Firestore → Supabase Migration ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Collections to migrate: ${migrations.length}`);

  const results: Record<string, number> = {};

  for (const config of migrations) {
    results[config.firestoreCollection] = await migrateCollection(config);
  }

  console.log("\n=== Migration Summary ===\n");
  for (const [collection, count] of Object.entries(results)) {
    console.log(`  ${collection}: ${count} records migrated`);
  }

  await verifyMigration();

  console.log("\n=== Migration Complete ===");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
