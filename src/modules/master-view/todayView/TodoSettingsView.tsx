/**
 * @file TodoSettingsView.tsx
 * @description Todoテンプレートの設定画面。定型業務テンプレートの CRUD を行う。
 *
 * 【このファイルの位置づけ】
 *   master-view > todayView 配下の画面コンポーネント。
 *   InfoDashboard の「Todoテンプレート」タブから使われる。
 *
 * 主な内部ロジック:
 *   - テンプレート名・カテゴリ・フローステップの入力フォーム
 *   - テンプレートの追加・編集・削除
 *   - ServiceProvider.todo 経由で Supabase に保存
 */
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { ServiceProvider } from "@/services/ServiceProvider";
import type { TodoTemplate, TodoFlowStep, TodoPriority } from "@/services/interfaces/ITodoService";

const PRIORITY_CONFIG: Record<TodoPriority, { label: string; color: string }> = {
  urgent: { label: "当日中", color: "#D32F2F" },
  high:   { label: "高",     color: "#E65100" },
  medium: { label: "中",     color: "#F9A825" },
  low:    { label: "低",     color: "#1976D2" },
};

const ICON_PRESETS: string[] = [
  // 業務・作業
  "briefcase-outline", "construct-outline", "build-outline", "hammer-outline",
  "clipboard-outline", "document-text-outline", "reader-outline", "filing-outline",
  // 掃除・メンテ
  "trash-outline", "water-outline", "sparkles-outline", "brush-outline",
  // 飲食・調理
  "restaurant-outline", "cafe-outline", "fast-food-outline", "beer-outline",
  "wine-outline", "pizza-outline", "ice-cream-outline", "nutrition-outline",
  // 接客・人
  "people-outline", "person-outline", "hand-left-outline", "happy-outline",
  "chatbubble-outline", "call-outline", "megaphone-outline", "mic-outline",
  // お金・会計
  "cash-outline", "card-outline", "wallet-outline", "calculator-outline",
  "receipt-outline", "pricetag-outline", "barcode-outline", "cart-outline",
  // 配送・移動
  "car-outline", "bicycle-outline", "bus-outline", "airplane-outline",
  "navigate-outline", "location-outline", "map-outline", "compass-outline",
  // IT・デバイス
  "desktop-outline", "laptop-outline", "phone-portrait-outline", "print-outline",
  "wifi-outline", "mail-outline", "at-outline", "code-outline",
  // 学習・教育
  "school-outline", "book-outline", "library-outline", "pencil-outline",
  "bulb-outline", "trophy-outline", "ribbon-outline", "medal-outline",
  // 時間・カレンダー
  "time-outline", "alarm-outline", "calendar-outline", "hourglass-outline",
  "stopwatch-outline", "timer-outline", "today-outline", "moon-outline",
  // 健康・安全
  "medkit-outline", "fitness-outline", "heart-outline", "shield-checkmark-outline",
  "warning-outline", "key-outline", "lock-closed-outline", "eye-outline",
  // その他
  "star-outline", "flag-outline", "bookmark-outline", "gift-outline",
  "camera-outline", "musical-notes-outline", "color-palette-outline", "globe-outline",
  "home-outline", "storefront-outline", "cube-outline", "rocket-outline",
];

function genStepId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const TodoSettingsView: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { colorScheme: cs } = useMD3Theme();
  const [templates, setTemplates] = useState<TodoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ visible: boolean; template?: TodoTemplate }>({ visible: false });
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const fetch = useCallback(async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try {
      setTemplates(await ServiceProvider.todos.getTemplates(user.storeId));
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [user?.storeId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = useCallback(async (id: string) => {
    await ServiceProvider.todos.deleteTemplate(id);
    fetch();
  }, [fetch]);

  return (
    <View style={{ flex: 1, backgroundColor: cs.surface }}>
      <ScrollView style={{ flex: 1 }} scrollEnabled={!editModal.visible} contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: cs.onSurface, marginBottom: 8 }}>
          Todoテンプレート
        </Text>
        <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 12 }}>
          テンプレートを作成すると、Todo追加時にプルダウンから選択できます。フローのステップを定義すると進捗管理ができます。
        </Text>

        {loading ? (
          <Text style={{ color: cs.outline, textAlign: "center", paddingVertical: 20 }}>読み込み中...</Text>
        ) : templates.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 30 }}>
            <Ionicons name="document-text-outline" size={36} color={cs.outlineVariant} />
            <Text style={{ color: cs.outline, marginTop: 8, fontSize: 13 }}>テンプレートがありません</Text>
          </View>
        ) : (
          templates.map((t) => (
            <View key={t.id} style={{ backgroundColor: cs.surfaceContainerLow, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: cs.outlineVariant }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {t.icon && <Ionicons name={t.icon as any} size={18} color={cs.primary} />}
                    <Text style={{ fontSize: 15, fontWeight: "600", color: cs.onSurface }}>{t.title}</Text>
                    {t.defaultPriority && (
                      <View style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, backgroundColor: PRIORITY_CONFIG[t.defaultPriority].color }}>
                        <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>{PRIORITY_CONFIG[t.defaultPriority].label}</Text>
                      </View>
                    )}
                  </View>
                  {t.description ? <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginTop: 2 }}>{t.description}</Text> : null}
                  {t.steps.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setExpandedSteps((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                      style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}
                    >
                      <Text style={{ fontSize: 11, color: cs.primary, fontWeight: "500" }}>{countAllSteps(t.steps)}ステップあり</Text>
                      <Ionicons name={expandedSteps[t.id] ? "chevron-up" : "chevron-down"} size={14} color={cs.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => setEditModal({ visible: true, template: t })} style={{ padding: 6 }}>
                    <Ionicons name="pencil-outline" size={18} color={cs.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(t.id)} style={{ padding: 6 }}>
                    <Ionicons name="trash-outline" size={18} color={cs.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* フロープレビュー（折りたたみ・ネスト対応） */}
              {t.steps.length > 0 && expandedSteps[t.id] && (
                <View style={{ marginTop: 10, paddingLeft: 8 }}>
                  {renderStepPreview(t.steps, cs)}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* 追加FAB */}
      <TouchableOpacity
        onPress={() => setEditModal({ visible: true })}
        style={{
          position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
          backgroundColor: cs.primary, justifyContent: "center", alignItems: "center",
          // @ts-ignore
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 100,
        }}
      >
        <Ionicons name="add" size={28} color={cs.onPrimary} />
      </TouchableOpacity>

      <TemplateEditModal
        visible={editModal.visible}
        template={editModal.template}
        cs={cs}
        storeId={user?.storeId}
        onClose={() => setEditModal({ visible: false })}
        onSaved={fetch}
      />
    </View>
  );
});

// ──────────── 再帰ステップカウント ────────────
function countAllSteps(steps: TodoFlowStep[]): number {
  let count = steps.length;
  for (const s of steps) {
    if (s.children?.length) count += countAllSteps(s.children);
  }
  return count;
}

// ──────────── 再帰ステップエディタ ────────────
const MAX_DEPTH = 3;
const DEPTH_COLORS = ["#6750A4", "#7E57C2", "#AB47BC"]; // primary → lighter

function renderStepEditors(
  list: TodoFlowStep[],
  parentPath: string[],
  depth: number,
  cs: any,
  addStepAt: (path: string[]) => void,
  updateStepAt: (path: string[], id: string, label: string) => void,
  removeStepAt: (path: string[], id: string) => void,
  moveStepAt: (path: string[], index: number, dir: -1 | 1) => void,
): React.ReactNode {
  const badgeSize = Math.max(16, 20 - depth * 2);
  const fontSize = Math.max(11, 14 - depth);
  const badgeColor = DEPTH_COLORS[depth] ?? cs.primary;

  const hasMore = (i: number) => i < list.length - 1;

  return list.map((s, i) => {
    const hasChildren = (s.children?.length ?? 0) > 0;
    // 縦線の高さ: バッジ下 → 次のバッジ上 (子やサブステップ追加ボタン分も含む)
    const showLine = hasMore(i) || hasChildren;

    return (
      <View key={s.id} style={{ marginLeft: depth * 20 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {/* 番号バッジ + 縦線 */}
          <View style={{ alignItems: "center", width: badgeSize + 4 }}>
            <View style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor: badgeColor, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: badgeSize * 0.5, fontWeight: "700", color: "#fff" }}>{i + 1}</Text>
            </View>
            {showLine && (
              <View style={{ width: 2, flex: 1, backgroundColor: badgeColor + "40" }} />
            )}
          </View>
          {/* 入力 + ボタン */}
          <View style={{ flex: 1, paddingBottom: depth === 0 ? 8 : 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <TextInput
                value={s.label}
                onChangeText={(v) => updateStepAt(parentPath, s.id, v)}
                placeholder={depth === 0 ? `ステップ ${i + 1}` : `サブステップ`}
                placeholderTextColor={cs.outline}
                style={{
                  flex: 1, borderWidth: 1, borderColor: cs.outline, borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: depth === 0 ? 6 : 4,
                  fontSize, color: cs.onSurface, backgroundColor: cs.surface,
                }}
              />
              <TouchableOpacity onPress={() => moveStepAt(parentPath, i, -1)} disabled={i === 0} style={{ padding: 3, opacity: i === 0 ? 0.3 : 1 }}>
                <Ionicons name="arrow-up" size={14} color={cs.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => moveStepAt(parentPath, i, 1)} disabled={i === list.length - 1} style={{ padding: 3, opacity: i === list.length - 1 ? 0.3 : 1 }}>
                <Ionicons name="arrow-down" size={14} color={cs.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeStepAt(parentPath, s.id)} style={{ padding: 3 }}>
                <Ionicons name="close-circle" size={16} color={cs.error} />
              </TouchableOpacity>
            </View>
            {/* 子ステップ */}
            {hasChildren &&
              renderStepEditors(s.children!, [...parentPath, s.id], depth + 1, cs, addStepAt, updateStepAt, removeStepAt, moveStepAt)
            }
            {/* サブステップ追加ボタン（最大深度未満のみ） */}
            {depth + 1 < MAX_DEPTH && (
              <TouchableOpacity
                onPress={() => addStepAt([...parentPath, s.id])}
                style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 2, paddingLeft: 4, marginTop: 2 }}
              >
                {depth >= 1
                  ? <Text style={{ fontSize: 14, color: DEPTH_COLORS[depth + 1] ?? cs.primary }}>↳</Text>
                  : <Ionicons name="add-outline" size={14} color={DEPTH_COLORS[depth + 1] ?? cs.primary} />
                }
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  });
}

// ──────────── 再帰ステッププレビュー ────────────
function renderStepPreview(steps: TodoFlowStep[], cs: any, depth: number = 0): React.ReactNode {
  const badgeSize = Math.max(14, 18 - depth * 2);
  const badgeColor = DEPTH_COLORS[depth] ?? cs.primary;

  return steps.map((s, i) => (
    <View key={s.id}>
      <View style={{ flexDirection: "row", alignItems: "center", marginLeft: depth * 16 }}>
        <View style={{ alignItems: "center", marginRight: 10 }}>
          <View style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor: badgeColor, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: badgeSize * 0.5, fontWeight: "700", color: "#fff" }}>{i + 1}</Text>
          </View>
          {(i < steps.length - 1 || (s.children?.length ?? 0) > 0) && depth === 0 && (
            <View style={{ width: 2, height: 12, backgroundColor: cs.outlineVariant }} />
          )}
        </View>
        <Text style={{ fontSize: Math.max(11, 13 - depth), color: cs.onSurface, paddingVertical: 3 }}>{s.label}</Text>
      </View>
      {s.children && s.children.length > 0 && renderStepPreview(s.children, cs, depth + 1)}
    </View>
  ));
}

// ──────────── Template Edit Modal ────────────

const TemplateEditModal: React.FC<{
  visible: boolean;
  template: TodoTemplate | undefined;
  cs: any;
  storeId: string | undefined;
  onClose: () => void;
  onSaved: () => void;
}> = React.memo(({ visible, template, cs, storeId, onClose, onSaved }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState<TodoPriority | null>(null);
  const [steps, setSteps] = useState<TodoFlowStep[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && template) {
      setTitle(template.title);
      setDescription(template.description ?? "");
      setIcon(template.icon);
      setDefaultPriority(template.defaultPriority);
      setSteps([...template.steps]);
    } else if (visible) {
      setTitle("");
      setDescription("");
      setIcon(null);
      setDefaultPriority(null);
      setSteps([]);
    }
  }, [visible, template]);


  // ── 再帰ステップ操作（3階層まで対応） ──
  // path: 親IDの配列。[] = トップレベル、[parentId] = 2階層目、[parentId, childId] = 3階層目
  const modifySteps = (
    list: TodoFlowStep[],
    path: string[],
    updater: (children: TodoFlowStep[]) => TodoFlowStep[],
  ): TodoFlowStep[] => {
    if (path.length === 0) return updater(list);
    const [pid, ...rest] = path;
    return list.map((s) =>
      s.id === pid ? { ...s, children: modifySteps(s.children ?? [], rest, updater) } : s,
    );
  };

  const addStepAt = (path: string[]) => {
    setSteps((prev) =>
      modifySteps(prev, path, (children) => [
        ...children,
        { id: genStepId(), label: "", order: children.length },
      ]),
    );
  };

  const updateStepAt = (path: string[], id: string, label: string) => {
    setSteps((prev) =>
      modifySteps(prev, path, (children) =>
        children.map((c) => (c.id === id ? { ...c, label } : c)),
      ),
    );
  };

  const removeStepAt = (path: string[], id: string) => {
    setSteps((prev) =>
      modifySteps(prev, path, (children) =>
        children.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
      ),
    );
  };

  const moveStepAt = (path: string[], index: number, dir: -1 | 1) => {
    setSteps((prev) =>
      modifySteps(prev, path, (children) => {
        const arr = [...children];
        const target = index + dir;
        if (target < 0 || target >= arr.length) return children;
        const tmp = arr[index]!;
        arr[index] = arr[target]!;
        arr[target] = tmp;
        return arr.map((c, i) => ({ ...c, order: i }));
      }),
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !storeId) return;
    setSaving(true);
    try {
      const cleanSteps = (list: TodoFlowStep[]): TodoFlowStep[] =>
        list.filter((s) => s.label.trim()).map((s) => ({
          ...s,
          ...(s.children?.length ? { children: cleanSteps(s.children) } : {}),
        }));
      const validSteps = cleanSteps(steps);
      if (template) {
        await ServiceProvider.todos.updateTemplate(template.id, title.trim(), description.trim() || null, icon, defaultPriority, validSteps);
      } else {
        await ServiceProvider.todos.addTemplate(storeId, title.trim(), description.trim() || null, icon, defaultPriority, validSteps);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity activeOpacity={1} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View style={{ backgroundColor: cs.surfaceContainerHigh, borderRadius: 16, width: "92%", maxWidth: 500, maxHeight: "90%", padding: 20, overflow: "hidden" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: cs.onSurface, marginBottom: 16 }}>
            {template ? "テンプレート編集" : "テンプレート追加"}
          </Text>

          <ScrollView style={{ flexShrink: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>タイトル *</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {/* アイコンボックス */}
              <TouchableOpacity
                onPress={() => setShowIconPicker(true)}
                style={{
                  width: 42, height: 42, borderRadius: 10, borderWidth: 1.5,
                  borderColor: icon ? (defaultPriority ? PRIORITY_CONFIG[defaultPriority].color : cs.primary) : cs.outline,
                  borderStyle: icon ? "solid" : "dashed",
                  backgroundColor: icon ? (defaultPriority ? PRIORITY_CONFIG[defaultPriority].color + "20" : cs.primaryContainer) : cs.surface,
                  justifyContent: "center", alignItems: "center",
                }}
              >
                <Ionicons name={icon ? (icon as any) : "add-outline"} size={icon ? 22 : 18} color={icon ? (defaultPriority ? PRIORITY_CONFIG[defaultPriority].color : cs.primary) : cs.outline} />
              </TouchableOpacity>
              <TextInput
                value={title} onChangeText={setTitle} placeholder="例: 開店準備" placeholderTextColor={cs.outline}
                style={{ flex: 1, borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: cs.onSurface, backgroundColor: cs.surface }}
              />
            </View>

            <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>説明</Text>
            <TextInput
              value={description} onChangeText={setDescription} placeholder="任意" placeholderTextColor={cs.outline}
              style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: cs.onSurface, backgroundColor: cs.surface, marginBottom: 12 }}
            />

            {/* 基本優先度 */}
            <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 6 }}>基本優先度</Text>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              <TouchableOpacity onPress={() => setDefaultPriority(null)}
                style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1.5, borderColor: !defaultPriority ? cs.primary : cs.outlineVariant, backgroundColor: !defaultPriority ? cs.primaryContainer : "transparent" }}>
                <Text style={{ fontSize: 12, fontWeight: !defaultPriority ? "600" : "400", color: !defaultPriority ? cs.primary : cs.onSurfaceVariant }}>未設定</Text>
              </TouchableOpacity>
              {(Object.entries(PRIORITY_CONFIG) as [TodoPriority, { label: string; color: string }][]).map(([key, cfg]) => (
                <TouchableOpacity key={key} onPress={() => setDefaultPriority(key)}
                  style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1.5, borderColor: defaultPriority === key ? cfg.color : cs.outlineVariant, backgroundColor: defaultPriority === key ? cfg.color + "20" : "transparent" }}>
                  <Text style={{ fontSize: 12, fontWeight: defaultPriority === key ? "700" : "400", color: defaultPriority === key ? cfg.color : cs.onSurfaceVariant }}>{cfg.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 8 }}>フローステップ</Text>
            {renderStepEditors(steps, [], 0, cs, addStepAt, updateStepAt, removeStepAt, moveStepAt)}
            <TouchableOpacity
              onPress={() => addStepAt([])}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 4 }}
            >
              <Ionicons name="add-circle-outline" size={18} color={cs.primary} />
              <Text style={{ fontSize: 13, color: cs.primary, fontWeight: "500" }}>ステップを追加</Text>
            </TouchableOpacity>
            <View style={{ height: 12 }} />
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: cs.outline }}>
              <Text style={{ fontSize: 14, color: cs.onSurface }}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave} disabled={!title.trim() || saving}
              style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: title.trim() && !saving ? cs.primary : cs.surfaceVariant }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: title.trim() && !saving ? cs.onPrimary : cs.onSurfaceVariant }}>
                {saving ? "保存中..." : "保存"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* アイコン選択オーバーレイ（絶対配置） */}
          {showIconPicker && (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cs.surfaceContainerHigh, borderRadius: 16, padding: 20, zIndex: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: cs.onSurface }}>アイコンを選択</Text>
                <TouchableOpacity onPress={() => setShowIconPicker(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={22} color={cs.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <TouchableOpacity onPress={() => { setIcon(null); setShowIconPicker(false); }}
                    style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 2, borderColor: !icon ? cs.primary : cs.outlineVariant, borderStyle: "dashed", backgroundColor: !icon ? cs.primaryContainer : cs.surface, justifyContent: "center", alignItems: "center" }}>
                    <Ionicons name="close" size={18} color={!icon ? cs.primary : cs.onSurfaceVariant} />
                  </TouchableOpacity>
                  {ICON_PRESETS.map((ic) => (
                    <TouchableOpacity key={ic} onPress={() => { setIcon(ic); setShowIconPicker(false); }}
                      style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 2, borderColor: icon === ic ? cs.primary : "transparent", backgroundColor: icon === ic ? cs.primaryContainer : cs.surface, justifyContent: "center", alignItems: "center" }}>
                      <Ionicons name={ic as any} size={20} color={icon === ic ? cs.primary : cs.onSurfaceVariant} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});
