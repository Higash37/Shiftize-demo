import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useAuth } from "@/services/auth/useAuth";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { Picker } from "@react-native-picker/picker";
import { generateTimeOptions } from "@/modules/reusable-widgets/gantt-chart/gantt-chart-common/utils";
import type { DailyTodo, TodoPriority, TodoComment, TodoTemplate, TodoFlowStep } from "@/services/interfaces/ITodoService";
import { useTodoBadge } from "@/common/common-context/TodoBadgeContext";

const TIME_OPTS = generateTimeOptions();

const PRIORITY_CONFIG: Record<TodoPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "当日中", color: "#D32F2F", bg: "#FFEBEE" },
  high:   { label: "高",     color: "#E65100", bg: "#FFF3E0" },
  medium: { label: "中",     color: "#F9A825", bg: "#FFFDE7" },
  low:    { label: "低",     color: "#1976D2", bg: "#E3F2FD" },
};

// ──────────── Main View ────────────

interface DailyTodoViewProps { selectedDate: Date; }

export const DailyTodoView: React.FC<DailyTodoViewProps> = React.memo(({ selectedDate }) => {
  const { user, role } = useAuth();
  const { colorScheme: cs } = useMD3Theme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [todos, setTodos] = useState<DailyTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailTodo, setDetailTodo] = useState<DailyTodo | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const { users } = useUsers(user?.storeId);
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { refresh: refreshBadge } = useTodoBadge();

  const fetchTodos = useCallback(async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try { setTodos(await ServiceProvider.todos.getTodos(user.storeId, dateStr)); }
    catch { /* silent */ }
    finally { setLoading(false); refreshBadge(); }
  }, [user?.storeId, dateStr, refreshBadge]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const visibleTodos = useMemo(() => {
    if (!user) return [];
    return todos.filter((t) => t.createdBy === user.uid || t.visibleTo.length === 0 || t.visibleTo.includes(user.uid));
  }, [todos, user]);

  const activeTodos = useMemo(() => visibleTodos.filter((t) => !t.isCompleted), [visibleTodos]);
  const completedTodos = useMemo(() => visibleTodos.filter((t) => t.isCompleted), [visibleTodos]);

  const handleToggle = useCallback(async (id: string) => {
    if (!user) return;
    await ServiceProvider.todos.toggleComplete(id, user.uid);
    fetchTodos();
  }, [user, fetchTodos]);

  const handleStepToggle = useCallback(async (todoId: string, stepId: string, completed: boolean) => {
    if (!user) return;
    await ServiceProvider.todos.updateStepProgress(todoId, stepId, completed, user.uid);
    fetchTodos();
  }, [user, fetchTodos]);

  const handleDelete = useCallback(async (todo: DailyTodo) => {
    if (!user) return;
    if (todo.createdBy !== user.uid && role !== "master") return;
    await ServiceProvider.todos.deleteTodo(todo.id);
    fetchTodos();
  }, [user, role, fetchTodos]);

  const userNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const u of users) map[u.uid] = u.nickname ?? u.email ?? u.uid;
    return map;
  }, [users]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const isPC = width >= 768;

  const renderTodoList = (list: DailyTodo[]) => (
    <View style={isPC ? { flexDirection: "row", flexWrap: "wrap", gap: 8 } : { gap: 8 }}>
      {list.map((todo) => (
        <View key={todo.id} style={isPC ? { width: "calc(50% - 4px)" as any } : undefined}>
          <TodoCard
            todo={todo} cs={cs}
            expanded={expandedId === todo.id}
            onToggleExpand={() => toggleExpand(todo.id)}
            onOpenDetail={() => setDetailTodo(todo)}
            canDelete={todo.createdBy === user?.uid || role === "master"}
            userNameMap={userNameMap} currentUser={user}
            onToggle={() => handleToggle(todo.id)}
            onStepToggle={handleStepToggle}
            onDelete={() => handleDelete(todo)}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: cs.surface }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 8 }}>
        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="hourglass-outline" size={28} color={cs.outline} />
            <Text style={{ marginTop: 8, color: cs.outline, fontSize: 13 }}>読み込み中...</Text>
          </View>
        ) : activeTodos.length === 0 && completedTodos.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="checkbox-outline" size={40} color={cs.outlineVariant} />
            <Text style={{ marginTop: 8, color: cs.outline, fontSize: 14 }}>Todoはありません</Text>
          </View>
        ) : (
          <>
            {renderTodoList(activeTodos)}
            {completedTodos.length > 0 && (
              <>
                <TouchableOpacity onPress={() => setShowCompleted(!showCompleted)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, marginTop: 8 }}>
                  <Ionicons name={showCompleted ? "chevron-down" : "chevron-forward"} size={16} color={cs.onSurfaceVariant} />
                  <Ionicons name="checkmark-done-outline" size={16} color={cs.onSurfaceVariant} />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: cs.onSurfaceVariant }}>完了済み ({completedTodos.length})</Text>
                </TouchableOpacity>
                {showCompleted && renderTodoList(completedTodos)}
              </>
            )}
          </>
        )}
      </ScrollView>

      <TouchableOpacity onPress={() => setShowAddModal(true)}
        style={{ position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: cs.primary, justifyContent: "center", alignItems: "center",
          // @ts-ignore
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 100 }}>
        <Ionicons name="add" size={28} color={cs.onPrimary} />
      </TouchableOpacity>

      <AddTodoModal visible={showAddModal} onClose={() => setShowAddModal(false)}
        selectedDate={selectedDate} dateStr={dateStr} users={users} currentUser={user}
        cs={cs} isMobile={isMobile} onAdded={fetchTodos} />

      {detailTodo && (
        <TodoDetailModal
          todo={detailTodo} cs={cs} isMobile={isMobile} isMaster={role === "master"}
          currentUser={user} userNameMap={userNameMap}
          onStepToggle={handleStepToggle}
          onClose={() => setDetailTodo(null)}
          onRefresh={fetchTodos}
        />
      )}
    </View>
  );
});

// ──────────── Step Flow (shared) ────────────

// ── 全ステップ数をカウント（ネスト含む） ──
function countAllFlowSteps(steps: TodoFlowStep[]): number {
  let c = steps.length;
  for (const s of steps) if (s.children?.length) c += countAllFlowSteps(s.children);
  return c;
}
function countDoneFlowSteps(steps: TodoFlowStep[], progress: Record<string, { completed: boolean }>): number {
  let c = steps.filter((s) => progress[s.id]?.completed).length;
  for (const s of steps) if (s.children?.length) c += countDoneFlowSteps(s.children, progress);
  return c;
}

const FLOW_DEPTH_COLORS = ["#6750A4", "#7E57C2", "#AB47BC"];

const StepFlow: React.FC<{
  steps: TodoFlowStep[];
  progress?: Record<string, { completed: boolean }>;
  cs: any;
  onToggle?: (stepId: string, completed: boolean) => void;
  onDeleteStep?: ((stepId: string) => void) | undefined;
  size?: "small" | "normal";
}> = React.memo(({ steps, progress = {}, cs, onToggle, onDeleteStep, size = "normal" }) => {
  const total = countAllFlowSteps(steps);
  const done = countDoneFlowSteps(steps, progress);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isSmall = size === "small";

  return (
    <View>
      {/* 進捗バー */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: isSmall ? 6 : 10 }}>
        <View style={{ flex: 1, height: 4, backgroundColor: cs.outlineVariant, borderRadius: 2, overflow: "hidden" }}>
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: pct === 100 ? "#4CAF50" : cs.primary, borderRadius: 2 }} />
        </View>
        <Text style={{ fontSize: isSmall ? 10 : 11, fontWeight: "600", color: pct === 100 ? "#4CAF50" : cs.onSurfaceVariant }}>{done}/{total}</Text>
      </View>
      {renderFlowSteps(steps, progress, cs, onToggle, onDeleteStep, isSmall, 0)}
    </View>
  );
});

function renderFlowSteps(
  steps: TodoFlowStep[],
  progress: Record<string, { completed: boolean }>,
  cs: any,
  onToggle: ((stepId: string, completed: boolean) => void) | undefined,
  onDeleteStep: ((stepId: string) => void) | undefined,
  isSmall: boolean,
  depth: number,
): React.ReactNode {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const badgeBase = isSmall ? 18 : 22;
  const badgeSize = Math.max(14, badgeBase - depth * 3);
  const depthColor = FLOW_DEPTH_COLORS[depth] ?? cs.primary;

  return sorted.map((s, i) => {
    const isDone = progress[s.id]?.completed;
    const hasChildren = (s.children?.length ?? 0) > 0;

    return (
      <View key={s.id} style={{ marginLeft: depth * 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ alignItems: "center", marginRight: isSmall ? 8 : 10, width: badgeSize + 4 }}>
            {onToggle ? (
              <TouchableOpacity onPress={() => onToggle(s.id, !isDone)}>
                <View style={{
                  width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2,
                  backgroundColor: isDone ? "#4CAF50" : cs.surfaceVariant,
                  borderWidth: isDone ? 0 : 2, borderColor: cs.outlineVariant,
                  justifyContent: "center", alignItems: "center",
                }}>
                  {isDone && <Ionicons name="checkmark" size={badgeSize * 0.65} color="#fff" />}
                </View>
              </TouchableOpacity>
            ) : (
              <View style={{
                width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2,
                backgroundColor: isDone ? "#4CAF50" : depthColor,
                justifyContent: "center", alignItems: "center",
              }}>
                {isDone ? <Ionicons name="checkmark" size={badgeSize * 0.65} color="#fff" /> :
                  <Text style={{ fontSize: badgeSize * 0.45, fontWeight: "700", color: "#fff" }}>{i + 1}</Text>}
              </View>
            )}
            {(i < sorted.length - 1 || hasChildren) && (
              <View style={{ width: 2, height: isSmall ? 10 : 14, backgroundColor: isDone ? "#4CAF50" : cs.outlineVariant }} />
            )}
          </View>
          <Text style={{
            flex: 1,
            fontSize: Math.max(10, (isSmall ? 11 : 13) - depth), color: isDone ? cs.outline : cs.onSurface,
            textDecorationLine: isDone ? "line-through" : "none", paddingVertical: isSmall ? 2 : 3,
          }}>{s.label}</Text>
          {onDeleteStep && (
            <TouchableOpacity onPress={() => onDeleteStep(s.id)} style={{ padding: 3, marginLeft: 4 }}>
              <Ionicons name="close-circle-outline" size={isSmall ? 14 : 16} color={cs.error} />
            </TouchableOpacity>
          )}
        </View>
        {hasChildren && renderFlowSteps(s.children!, progress, cs, onToggle, onDeleteStep, isSmall, depth + 1)}
      </View>
    );
  });
}

// ──────────── Todo Detail Modal ────────────

function genAdHocId() {
  return "adhoc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const fmtTime = (d: Date) => {
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "たった今";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}時間前`;
  return format(d, "M/d HH:mm");
};

const TodoDetailModal: React.FC<{
  todo: DailyTodo; cs: any; isMobile: boolean; isMaster: boolean;
  currentUser: any; userNameMap: Record<string, string>;
  onStepToggle: (todoId: string, stepId: string, completed: boolean) => void;
  onClose: () => void; onRefresh: () => void;
}> = React.memo(({ todo, cs, isMobile, isMaster, currentUser, userNameMap, onStepToggle, onClose, onRefresh }) => {
  const [commentOpenStepId, setCommentOpenStepId] = useState<string | null>(null);
  const [comments, setComments] = useState<TodoComment[]>([]);
  const [loadingC, setLoadingC] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [adHocLabel, setAdHocLabel] = useState("");
  const [savingAdHoc, setSavingAdHoc] = useState(false);
  const dirtyRef = useRef(false);
  const [modalTab, setModalTab] = useState<"detail" | "flow">("detail");

  // 編集権限: マスター or 作成者
  const canEdit = isMaster || todo.createdBy === currentUser?.uid;
  const [editing, setEditing] = useState(false);
  const [editTask, setEditTask] = useState(todo.task ?? "");
  const [editDesc, setEditDesc] = useState(todo.description ?? "");
  const [editAssignee, setEditAssignee] = useState(todo.assignee ?? "");
  const [editPriority, setEditPriority] = useState<TodoPriority | "">(todo.priority ?? "");
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");
  const [editStartTime, setEditStartTime] = useState(todo.startTime ?? "");
  const [editEndTime, setEditEndTime] = useState(todo.endTime ?? "");
  const [saving, setSaving] = useState(false);

  const handleSaveEdit = useCallback(async () => {
    setSaving(true);
    try {
      await ServiceProvider.todos.updateTodo(todo.id, {
        task: editTask || null,
        description: editDesc || null,
        assignee: editAssignee || null,
        priority: (editPriority || null) as TodoPriority | null,
        dueDate: editDueDate || null,
        startTime: editStartTime || null,
        endTime: editEndTime || null,
      });
      dirtyRef.current = true;
      setEditing(false);
    } finally { setSaving(false); }
  }, [todo.id, editTask, editDesc, editAssignee, editPriority, editDueDate, editStartTime, editEndTime]);

  const handleClose = useCallback(() => {
    if (dirtyRef.current) onRefresh();
    onClose();
  }, [onClose, onRefresh]);

  // ローカルステップ状態（モーダル内で即時反映）
  const [localSteps, setLocalSteps] = useState<TodoFlowStep[]>(todo.steps);
  const [localProgress, setLocalProgress] = useState<Record<string, any>>(todo.stepProgress);
  useEffect(() => { setLocalSteps(todo.steps); setLocalProgress(todo.stepProgress); }, [todo.steps, todo.stepProgress]);

  const pri = todo.priority ? PRIORITY_CONFIG[todo.priority] : null;

  // コメント取得
  const fetchComments = useCallback(async () => {
    setLoadingC(true);
    try { setComments(await ServiceProvider.todos.getComments(todo.id)); } catch { /* */ } finally { setLoadingC(false); }
  }, [todo.id]);
  useEffect(() => { fetchComments(); }, [fetchComments]);

  const commentsForStep = useMemo(() => {
    if (!commentOpenStepId) return [];
    return comments.filter((c) => c.stepId === commentOpenStepId);
  }, [comments, commentOpenStepId]);

  const handlePostComment = useCallback(async () => {
    if (!newComment.trim() || !currentUser || !commentOpenStepId) return;
    await ServiceProvider.todos.addComment(
      todo.id, newComment.trim(), currentUser.uid, currentUser.nickname ?? null,
      undefined, commentOpenStepId,
    );
    setNewComment(""); fetchComments();
  }, [todo.id, newComment, currentUser, commentOpenStepId, fetchComments]);

  const handleDeleteComment = useCallback(async (id: string) => {
    await ServiceProvider.todos.deleteComment(id);
    fetchComments();
  }, [fetchComments]);

  // ステップ追加（マスターのみ）
  const handleAddAdHoc = useCallback(async () => {
    if (!adHocLabel.trim()) return;
    setSavingAdHoc(true);
    try {
      const newStep: TodoFlowStep = { id: genAdHocId(), label: adHocLabel.trim(), order: localSteps.length };
      const newSteps = [...localSteps, newStep];
      const newProgress = { ...localProgress, [newStep.id]: { completed: false, completedBy: null, completedAt: null } };
      setLocalSteps(newSteps);
      setLocalProgress(newProgress);
      setAdHocLabel("");
      await ServiceProvider.todos.updateTodo(todo.id, { steps: newSteps, stepProgress: newProgress });
      dirtyRef.current = true;
    } finally { setSavingAdHoc(false); }
  }, [todo.id, localSteps, localProgress, adHocLabel]);

  // ステップ削除（マスターのみ、再帰対応）
  const handleDeleteStep = useCallback(async (stepId: string) => {
    const removeFromList = (list: TodoFlowStep[]): TodoFlowStep[] =>
      list.filter((s) => s.id !== stepId).map((s, i) => ({
        ...s, order: i,
        ...(s.children?.length ? { children: removeFromList(s.children) } : {}),
      }));
    const newSteps = removeFromList(localSteps);
    const newProgress = { ...localProgress };
    delete newProgress[stepId];
    setLocalSteps(newSteps);
    setLocalProgress(newProgress);
    if (commentOpenStepId === stepId) setCommentOpenStepId(null);
    await ServiceProvider.todos.updateTodo(todo.id, { steps: newSteps, stepProgress: newProgress });
    dirtyRef.current = true;
  }, [todo.id, localSteps, localProgress, commentOpenStepId]);

  // インラインコメント欄
  const renderInlineComments = (stepId: string) => {
    const sc = comments.filter((c) => c.stepId === stepId);
    return (
      <View style={{ marginLeft: 32, marginBottom: 6, padding: 8, backgroundColor: cs.surfaceContainer, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: cs.primary }}>
        {loadingC ? (
          <Text style={{ fontSize: 11, color: cs.outline }}>読み込み中...</Text>
        ) : sc.length > 0 ? (
          sc.map((c) => (
            <View key={c.id} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: cs.onSurface }}>{c.createdByName || userNameMap[c.createdBy] || "不明"}</Text>
                <Text style={{ fontSize: 9, color: cs.outline }}>{fmtTime(c.createdAt)}</Text>
              </View>
              <Text style={{ fontSize: 12, color: cs.onSurface, lineHeight: 16, marginTop: 1 }}>{c.content}</Text>
              {c.createdBy === currentUser?.uid && (
                <TouchableOpacity onPress={() => handleDeleteComment(c.id)} style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 }}>
                  <Ionicons name="trash-outline" size={10} color={cs.error} /><Text style={{ fontSize: 10, color: cs.error }}>削除</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 11, color: cs.outline, marginBottom: 4 }}>コメントなし</Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
          <TextInput value={commentOpenStepId === stepId ? newComment : ""} onChangeText={setNewComment}
            placeholder="メモを追加..." placeholderTextColor={cs.outline}
            style={{ flex: 1, borderWidth: 1, borderColor: cs.outlineVariant, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, color: cs.onSurface, backgroundColor: cs.surface }} />
          <TouchableOpacity onPress={handlePostComment} disabled={!newComment.trim()}
            style={{ padding: 6, borderRadius: 6, backgroundColor: newComment.trim() ? cs.primary : cs.surfaceVariant }}>
            <Ionicons name="send" size={14} color={newComment.trim() ? cs.onPrimary : cs.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // トップレベルステップ + インラインコメント付きフロー描画
  const renderModalSteps = () => {
    const sorted = [...localSteps].sort((a, b) => a.order - b.order);
    const total = countAllFlowSteps(localSteps);
    const done = countDoneFlowSteps(localSteps, localProgress);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <View>
        {/* 進捗バー */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ flex: 1, height: 4, backgroundColor: cs.outlineVariant, borderRadius: 2, overflow: "hidden" }}>
            <View style={{ width: `${pct}%`, height: "100%", backgroundColor: pct === 100 ? "#4CAF50" : cs.primary, borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 11, fontWeight: "600", color: pct === 100 ? "#4CAF50" : cs.onSurfaceVariant }}>{done}/{total}</Text>
        </View>

        {sorted.map((s, i) => {
          const isDone = localProgress[s.id]?.completed;
          const hasChildren = (s.children?.length ?? 0) > 0;
          const isCommentOpen = commentOpenStepId === s.id;
          const commentCount = comments.filter((c) => c.stepId === s.id).length;

          return (
            <View key={s.id}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ alignItems: "center", marginRight: 10, width: 26 }}>
                  <TouchableOpacity onPress={() => {
                    setLocalProgress((prev) => ({ ...prev, [s.id]: { ...prev[s.id], completed: !isDone } }));
                    onStepToggle(todo.id, s.id, !isDone); dirtyRef.current = true;
                  }}>
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: isDone ? "#4CAF50" : cs.surfaceVariant,
                      borderWidth: isDone ? 0 : 2, borderColor: cs.outlineVariant,
                      justifyContent: "center", alignItems: "center",
                    }}>
                      {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                  {(i < sorted.length - 1 || hasChildren) && (
                    <View style={{ width: 2, height: 14, backgroundColor: isDone ? "#4CAF50" : cs.outlineVariant }} />
                  )}
                </View>
                <Text style={{
                  flex: 1, fontSize: 13, color: isDone ? cs.outline : cs.onSurface,
                  textDecorationLine: isDone ? "line-through" : "none", paddingVertical: 3,
                }}>{s.label}</Text>
                {/* コメントペンアイコン */}
                <TouchableOpacity onPress={() => { setCommentOpenStepId(isCommentOpen ? null : s.id); setNewComment(""); }}
                  style={{ padding: 4, marginLeft: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                    <Ionicons name="create-outline" size={16} color={isCommentOpen ? cs.primary : cs.onSurfaceVariant} />
                    {commentCount > 0 && (
                      <Text style={{ fontSize: 9, fontWeight: "700", color: cs.primary }}>{commentCount}</Text>
                    )}
                  </View>
                </TouchableOpacity>
                {isMaster && (
                  <TouchableOpacity onPress={() => handleDeleteStep(s.id)} style={{ padding: 3, marginLeft: 2 }}>
                    <Ionicons name="close-circle-outline" size={16} color={cs.error} />
                  </TouchableOpacity>
                )}
              </View>
              {/* サブステップ */}
              {hasChildren && renderFlowSteps(s.children!, localProgress, cs,
                (stepId, completed) => {
                  setLocalProgress((prev) => ({ ...prev, [stepId]: { ...prev[stepId], completed } }));
                  onStepToggle(todo.id, stepId, completed); dirtyRef.current = true;
                },
                isMaster ? handleDeleteStep : undefined, false, 1)}
              {/* コメント常時表示（閉じている時は読み取り専用） */}
              {isCommentOpen ? renderInlineComments(s.id) : commentCount > 0 && (
                <View style={{ marginLeft: 36, marginBottom: 4, marginTop: 2 }}>
                  {comments.filter((c) => c.stepId === s.id).map((c) => (
                    <View key={c.id} style={{ flexDirection: "row", gap: 4, marginBottom: 2, flexWrap: "wrap" }}>
                      <Text style={{ fontSize: 10, fontWeight: "600", color: cs.onSurfaceVariant }}>{c.createdByName || userNameMap[c.createdBy] || "不明"}:</Text>
                      <Text style={{ fontSize: 10, color: cs.onSurface, flexShrink: 1 }}>{c.content}</Text>
                      <Text style={{ fontSize: 9, color: cs.outline }}>{fmtTime(c.createdAt)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity activeOpacity={1} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={handleClose} />
        <View style={{
          backgroundColor: cs.surfaceContainerHigh, borderRadius: 16,
          width: isMobile ? "95%" : (editing && localSteps.length > 0 ? 700 : 520), maxHeight: "85%", padding: 20,
        }}>
          {/* ヘッダー */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            {todo.icon && <Ionicons name={todo.icon as any} size={22} color={pri ? pri.color : cs.primary} />}
            <Text style={{ flex: 1, fontSize: 18, fontWeight: "700", color: cs.onSurface }}>{todo.title}</Text>
            {pri && !editing && (
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: pri.color }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>{pri.label}</Text>
              </View>
            )}
            {canEdit && !editing && (
              <TouchableOpacity onPress={() => setEditing(true)} style={{ padding: 4 }}>
                <Ionicons name="create-outline" size={20} color={cs.onSurfaceVariant} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={22} color={cs.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* ── 編集モード: タブ分け（左:編集フォーム / 右:フロー） ── */}
          {editing ? (<>
            {/* モバイル時タブ切り替え */}
            {isMobile && localSteps.length > 0 && (
              <View style={{ flexDirection: "row", marginBottom: 12, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: cs.outlineVariant }}>
                {([{ key: "detail" as const, label: "詳細" }, { key: "flow" as const, label: "フロー" }]).map((tab) => (
                  <TouchableOpacity key={tab.key} onPress={() => setModalTab(tab.key)}
                    style={{ flex: 1, paddingVertical: 8, alignItems: "center", backgroundColor: modalTab === tab.key ? cs.primary : "transparent" }}>
                    <Text style={{ fontSize: 13, fontWeight: modalTab === tab.key ? "700" : "400", color: modalTab === tab.key ? cs.onPrimary : cs.onSurfaceVariant }}>{tab.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ flexDirection: !isMobile && localSteps.length > 0 ? "row" : "column", flex: 1, gap: !isMobile && localSteps.length > 0 ? 16 : 0, minHeight: 0 }}>
              {/* 左パネル: 編集フォーム */}
              {(!isMobile || modalTab === "detail" || localSteps.length === 0) && (
                <ScrollView style={{ flex: 1, flexShrink: 1 }} showsVerticalScrollIndicator={false}>
                  <View style={{ marginBottom: 12, gap: 8 }}>
                    {/* 依頼内容 */}
                    <View>
                      <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>依頼内容</Text>
                      <TextInput value={editTask} onChangeText={setEditTask} placeholder="依頼内容..." placeholderTextColor={cs.outline}
                        style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: cs.onSurface, backgroundColor: cs.surface }} />
                    </View>
                    {/* メモ */}
                    <View>
                      <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>メモ</Text>
                      <TextInput value={editDesc} onChangeText={setEditDesc} placeholder="メモ..." placeholderTextColor={cs.outline} multiline
                        style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: cs.onSurface, backgroundColor: cs.surface, minHeight: 50 }} />
                    </View>
                    {/* 担当者 */}
                    <View>
                      <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>担当者</Text>
                      <View style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, overflow: "hidden", backgroundColor: cs.surface }}>
                        <Picker selectedValue={editAssignee} onValueChange={setEditAssignee}
                          style={{ height: 40, color: cs.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}>
                          <Picker.Item label="未指定" value="" />
                          {Object.entries(userNameMap).map(([uid, name]) => (
                            <Picker.Item key={uid} label={name} value={name} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    {/* 優先度 */}
                    <View>
                      <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>優先度</Text>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {([["", "なし"], ["low", "低"], ["medium", "中"], ["high", "高"], ["urgent", "当日中"]] as const).map(([val, label]) => (
                          <TouchableOpacity key={val} onPress={() => setEditPriority(val as TodoPriority | "")}
                            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1,
                              borderColor: editPriority === val ? cs.primary : cs.outlineVariant,
                              backgroundColor: editPriority === val ? cs.primaryContainer : "transparent" }}>
                            <Text style={{ fontSize: 11, fontWeight: editPriority === val ? "600" : "400",
                              color: editPriority === val ? cs.primary : cs.onSurfaceVariant }}>{label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    {/* 期限・時間 */}
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>期限日</Text>
                        <TextInput value={editDueDate} onChangeText={setEditDueDate} placeholder="yyyy-mm-dd" placeholderTextColor={cs.outline}
                          style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: cs.onSurface, backgroundColor: cs.surface }} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>開始</Text>
                        <View style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, overflow: "hidden", backgroundColor: cs.surface }}>
                          <Picker selectedValue={editStartTime} onValueChange={setEditStartTime}
                            style={{ height: 40, color: cs.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}>
                            <Picker.Item label="--:--" value="" />
                            {TIME_OPTS.map((t) => <Picker.Item key={t} label={t} value={t} />)}
                          </Picker>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>終了</Text>
                        <View style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, overflow: "hidden", backgroundColor: cs.surface }}>
                          <Picker selectedValue={editEndTime} onValueChange={setEditEndTime}
                            style={{ height: 40, color: cs.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}>
                            <Picker.Item label="--:--" value="" />
                            {TIME_OPTS.map((t) => <Picker.Item key={t} label={t} value={t} />)}
                          </Picker>
                        </View>
                      </View>
                    </View>
                    {/* 保存・キャンセル */}
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                      <TouchableOpacity onPress={() => setEditing(false)}
                        style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: cs.outline }}>
                        <Text style={{ fontSize: 12, color: cs.onSurfaceVariant }}>キャンセル</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSaveEdit} disabled={saving}
                        style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: saving ? cs.surfaceVariant : cs.primary }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: saving ? cs.onSurfaceVariant : cs.onPrimary }}>
                          {saving ? "保存中..." : "保存"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              )}

              {/* デスクトップ区切り線 */}
              {!isMobile && localSteps.length > 0 && (
                <View style={{ width: 1, backgroundColor: cs.outlineVariant }} />
              )}

              {/* 右パネル: フロー */}
              {localSteps.length > 0 && (!isMobile || modalTab === "flow") && (
                <ScrollView style={{ flex: 1, flexShrink: 1 }} showsVerticalScrollIndicator={false}>
                  {renderModalSteps()}
                  {isMaster && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 6 }}>ステップを追加</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <TextInput value={adHocLabel} onChangeText={setAdHocLabel}
                          placeholder="ステップ名..." placeholderTextColor={cs.outline}
                          style={{ flex: 1, borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: cs.onSurface, backgroundColor: cs.surface }} />
                        <TouchableOpacity onPress={handleAddAdHoc} disabled={!adHocLabel.trim() || savingAdHoc}
                          style={{ padding: 8, borderRadius: 8, backgroundColor: adHocLabel.trim() && !savingAdHoc ? cs.primary : cs.surfaceVariant }}>
                          <Ionicons name="add" size={18} color={adHocLabel.trim() && !savingAdHoc ? cs.onPrimary : cs.onSurfaceVariant} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </>) : (<>
            {/* ── 通常表示: 1カラム ── */}
            {(todo.task || todo.assignee || todo.description || todo.dueDate || todo.startTime) ? (
              <View style={{ marginBottom: 12, gap: 4 }}>
                {todo.assignee && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="person-outline" size={13} color={cs.primary} />
                    <Text style={{ fontSize: 12, color: cs.primary, fontWeight: "500" }}>{todo.assignee}</Text>
                  </View>
                )}
                {todo.task && <Text style={{ fontSize: 13, color: cs.onSurface }}>{todo.task}</Text>}
                {todo.description && <Text style={{ fontSize: 12, color: cs.outline }}>{todo.description}</Text>}
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {todo.dueDate && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="calendar-outline" size={12} color={cs.tertiary} />
                      <Text style={{ fontSize: 11, color: cs.tertiary }}>期限: {todo.dueDate}</Text>
                    </View>
                  )}
                  {todo.startTime && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="time-outline" size={12} color={cs.tertiary} />
                      <Text style={{ fontSize: 11, color: cs.tertiary }}>{todo.startTime}{todo.endTime ? ` ~ ${todo.endTime}` : ""}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {localSteps.length > 0 ? renderModalSteps() : (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: cs.outline }}>フローステップなし</Text>
                </View>
              )}
              {isMaster && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 6 }}>ステップを追加</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <TextInput value={adHocLabel} onChangeText={setAdHocLabel}
                      placeholder="ステップ名..." placeholderTextColor={cs.outline}
                      style={{ flex: 1, borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: cs.onSurface, backgroundColor: cs.surface }} />
                    <TouchableOpacity onPress={handleAddAdHoc} disabled={!adHocLabel.trim() || savingAdHoc}
                      style={{ padding: 8, borderRadius: 8, backgroundColor: adHocLabel.trim() && !savingAdHoc ? cs.primary : cs.surfaceVariant }}>
                      <Ionicons name="add" size={18} color={adHocLabel.trim() && !savingAdHoc ? cs.onPrimary : cs.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </>)}
        </View>
      </View>
    </Modal>
  );
});

// ──────────── Card Step Flow + Comments ────────────

const CardStepFlowWithComments: React.FC<{
  steps: TodoFlowStep[]; progress: Record<string, { completed: boolean }>;
  comments: TodoComment[]; cs: any; userNameMap: Record<string, string>;
}> = React.memo(({ steps, progress, comments, cs, userNameMap }) => {
  const total = countAllFlowSteps(steps);
  const done = countDoneFlowSteps(steps, progress);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const renderSubSteps = (children: TodoFlowStep[], depth: number) => {
    const sorted = [...children].sort((a, b) => a.order - b.order);
    const badgeSize = Math.max(12, 18 - depth * 3);
    const depthColor = FLOW_DEPTH_COLORS[depth] ?? cs.primary;
    return sorted.map((s, i) => {
      const isDone = progress[s.id]?.completed;
      const hasKids = (s.children?.length ?? 0) > 0;
      return (
        <View key={s.id} style={{ marginLeft: depth * 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ alignItems: "center", marginRight: 6, width: badgeSize + 4 }}>
              <View style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor: isDone ? "#4CAF50" : depthColor, justifyContent: "center", alignItems: "center" }}>
                {isDone ? <Ionicons name="checkmark" size={badgeSize * 0.6} color="#fff" /> :
                  <Text style={{ fontSize: badgeSize * 0.45, fontWeight: "700", color: "#fff" }}>{i + 1}</Text>}
              </View>
              {(i < sorted.length - 1 || hasKids) && <View style={{ width: 2, height: 8, backgroundColor: isDone ? "#4CAF50" : cs.outlineVariant }} />}
            </View>
            <Text style={{ flex: 1, fontSize: Math.max(9, 11 - depth), color: isDone ? cs.outline : cs.onSurface, textDecorationLine: isDone ? "line-through" : "none" }}>{s.label}</Text>
          </View>
          {hasKids && renderSubSteps(s.children!, depth + 1)}
        </View>
      );
    });
  };

  const sorted = [...steps].sort((a, b) => a.order - b.order);

  return (
    <View>
      {/* 進捗バー */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <View style={{ flex: 1, height: 4, backgroundColor: cs.outlineVariant, borderRadius: 2, overflow: "hidden" }}>
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: pct === 100 ? "#4CAF50" : cs.primary, borderRadius: 2 }} />
        </View>
        <Text style={{ fontSize: 10, fontWeight: "600", color: pct === 100 ? "#4CAF50" : cs.onSurfaceVariant }}>{done}/{total}</Text>
      </View>

      {sorted.map((s, i) => {
        const isDone = progress[s.id]?.completed;
        const hasChildren = (s.children?.length ?? 0) > 0;
        const stepComments = comments.filter((c) => c.stepId === s.id);

        return (
          <View key={s.id}>
            {/* ステップ行 */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ alignItems: "center", marginRight: 8, width: 22 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: isDone ? "#4CAF50" : FLOW_DEPTH_COLORS[0], justifyContent: "center", alignItems: "center" }}>
                  {isDone ? <Ionicons name="checkmark" size={12} color="#fff" /> :
                    <Text style={{ fontSize: 8, fontWeight: "700", color: "#fff" }}>{i + 1}</Text>}
                </View>
                {(i < sorted.length - 1 || hasChildren) && <View style={{ width: 2, height: 10, backgroundColor: isDone ? "#4CAF50" : cs.outlineVariant }} />}
              </View>
              <Text style={{ flex: 1, fontSize: 11, color: isDone ? cs.outline : cs.onSurface, textDecorationLine: isDone ? "line-through" : "none", paddingVertical: 2 }}>{s.label}</Text>
            </View>
            {/* サブステップ */}
            {hasChildren && renderSubSteps(s.children!, 1)}
            {/* コメント（トップレベルステップのみ） */}
            {stepComments.length > 0 && (
              <View style={{ marginLeft: 30, marginBottom: 4, marginTop: 2 }}>
                {stepComments.map((c) => (
                  <View key={c.id} style={{ flexDirection: "row", gap: 4, marginBottom: 2, flexWrap: "wrap" }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: cs.onSurfaceVariant }}>{c.createdByName || userNameMap[c.createdBy] || "不明"}:</Text>
                    <Text style={{ fontSize: 10, color: cs.onSurface, flexShrink: 1 }}>{c.content}</Text>
                    <Text style={{ fontSize: 9, color: cs.outline }}>{fmtTime(c.createdAt)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
});

// ──────────── Todo Card ────────────

interface TodoCardProps {
  todo: DailyTodo; cs: any; expanded: boolean; onToggleExpand: () => void; onOpenDetail: () => void;
  canDelete: boolean; userNameMap: Record<string, string>; currentUser: any;
  onToggle: () => void; onStepToggle: (todoId: string, stepId: string, completed: boolean) => void; onDelete: () => void;
}

const TodoCard: React.FC<TodoCardProps> = React.memo(
  ({ todo, cs, expanded, onToggleExpand, onOpenDetail, canDelete, userNameMap, currentUser, onToggle, onStepToggle, onDelete }) => {
    const pri = todo.priority ? PRIORITY_CONFIG[todo.priority] : null;
    const hasSteps = todo.steps.length > 0;
    const totalSteps = hasSteps ? countAllFlowSteps(todo.steps) : 0;
    const stepsDone = hasSteps ? countDoneFlowSteps(todo.steps, todo.stepProgress) : 0;
    const visibleLabel = todo.visibleTo.length === 0 ? "全員" : todo.visibleTo.map((id) => userNameMap[id] || id).join(", ");

    // 展開時コメント取得
    const [cardComments, setCardComments] = useState<TodoComment[]>([]);
    useEffect(() => {
      if (!expanded) return;
      ServiceProvider.todos.getComments(todo.id).then(setCardComments).catch(() => {});
    }, [expanded, todo.id]);

    return (
      <View style={{
        backgroundColor: cs.surfaceContainerLow,
        borderRadius: 12, padding: 12, borderWidth: 1,
        borderColor: todo.isCompleted ? cs.outlineVariant : cs.outline,
        borderLeftWidth: pri ? 4 : 1,
        borderLeftColor: pri ? pri.color : (todo.isCompleted ? cs.outlineVariant : cs.outline),
        opacity: todo.isCompleted ? 0.6 : 1,
      }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <TouchableOpacity onPress={onToggle} style={{ marginRight: 10, marginTop: 2 }}>
            <Ionicons name={todo.isCompleted ? "checkbox" : "square-outline"} size={24} color={todo.isCompleted ? cs.primary : cs.outline} />
          </TouchableOpacity>

          {/* カード本体 → モーダル */}
          <TouchableOpacity onPress={onOpenDetail} activeOpacity={0.7} style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {todo.icon && <Ionicons name={todo.icon as any} size={18} color={pri ? pri.color : cs.primary} />}
              {pri && (
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: pri.color }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{pri.label}</Text>
                </View>
              )}
              <Text style={{ flex: 1, fontSize: 15, fontWeight: "500", color: cs.onSurface, textDecorationLine: todo.isCompleted ? "line-through" : "none" }}>
                {todo.title}
              </Text>
              {hasSteps && (
                <Text style={{ fontSize: 10, fontWeight: "600", color: stepsDone === totalSteps ? "#4CAF50" : cs.onSurfaceVariant }}>
                  {stepsDone}/{totalSteps}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
              {todo.assignee ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                  <Ionicons name="person-outline" size={11} color={cs.primary} />
                  <Text style={{ fontSize: 11, color: cs.primary, fontWeight: "500" }}>{todo.assignee}</Text>
                </View>
              ) : null}
              {todo.dueDate ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                  <Ionicons name="calendar-outline" size={11} color={cs.primary} />
                  <Text style={{ fontSize: 11, color: cs.primary, fontWeight: "500" }}>
                    {(() => { const d = new Date(todo.dueDate + "T00:00:00"); return `${d.getMonth() + 1}/${d.getDate()}`; })()}
                  </Text>
                </View>
              ) : null}
              {todo.startTime ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                  <Ionicons name="time-outline" size={11} color={cs.tertiary} />
                  <Text style={{ fontSize: 11, color: cs.tertiary, fontWeight: "500" }}>{todo.startTime}{todo.endTime ? `~${todo.endTime}` : ""}</Text>
                </View>
              ) : null}
              <Text style={{ fontSize: 10, color: cs.outline }}>{userNameMap[todo.createdBy] || "不明"}</Text>
            </View>
          </TouchableOpacity>

          {/* 展開シェブロン */}
          <TouchableOpacity onPress={onToggleExpand} style={{ padding: 4, marginLeft: 4 }}>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={cs.onSurfaceVariant} />
          </TouchableOpacity>

          {canDelete && (
            <TouchableOpacity onPress={onDelete} style={{ padding: 4, marginLeft: 2 }}>
              <Ionicons name="trash-outline" size={16} color={cs.error} />
            </TouchableOpacity>
          )}
        </View>

        {expanded && (
          <View style={{ marginTop: 8, marginLeft: 34 }}>
            {todo.task ? (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: cs.onSurfaceVariant, marginBottom: 2 }}>依頼内容詳細</Text>
                <Text style={{ fontSize: 13, color: cs.onSurface }}>{todo.task}</Text>
              </View>
            ) : null}
            {todo.description ? (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: cs.onSurfaceVariant, marginBottom: 2 }}>メモ</Text>
                <Text style={{ fontSize: 12, color: cs.outline }}>{todo.description}</Text>
              </View>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: hasSteps ? 8 : 0 }}>
              <Ionicons name="eye-outline" size={11} color={cs.outline} />
              <Text style={{ fontSize: 10, color: cs.outline }}>{visibleLabel}</Text>
            </View>
            {hasSteps && (
              <CardStepFlowWithComments steps={todo.steps} progress={todo.stepProgress} comments={cardComments} cs={cs} userNameMap={userNameMap} />
            )}
          </View>
        )}
      </View>
    );
  }
);

// ──────────── Add Modal ────────────

interface AddTodoModalProps {
  visible: boolean; onClose: () => void; selectedDate: Date; dateStr: string;
  users: any[]; currentUser: any; cs: any; isMobile: boolean; onAdded: () => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = React.memo(({
  visible, onClose, selectedDate, dateStr, users, currentUser, cs, isMobile, onAdded,
}) => {
  const [templates, setTemplates] = useState<TodoTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priority, setPriority] = useState<TodoPriority | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [showDueDate, setShowDueDate] = useState(false);
  const [visibleTo, setVisibleTo] = useState<string[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState<"form" | "flow">("form");
  const scrollRef = useRef<ScrollView>(null);

  // テンプレート一覧取得
  useEffect(() => {
    if (visible && currentUser?.storeId) {
      ServiceProvider.todos.getTemplates(currentUser.storeId).then(setTemplates).catch(() => {});
    }
  }, [visible, currentUser?.storeId]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

  useEffect(() => {
    if (!visible) {
      setSelectedTemplateId(null);
      setShowTemplatePicker(false);
      setAssignee(""); setTitle(""); setTask(""); setDescription("");
      setDueDate(""); setStartTime(""); setEndTime("");
      setPriority(null); setIcon(null); setShowDueDate(false);
      setVisibleTo([]); setShowUserPicker(false); setModalTab("form");
    } else {
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
    }
  }, [visible]);

  // テンプレート選択時にタイトル・アイコン・優先度を自動設定
  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.title);
      setIcon(selectedTemplate.icon);
      if (selectedTemplate.defaultPriority) {
        setPriority(selectedTemplate.defaultPriority);
      }
    }
  }, [selectedTemplate]);

  const handleSave = async () => {
    if (!title.trim() || !currentUser?.storeId) return;
    setSaving(true);
    try {
      await ServiceProvider.todos.addTodo({
        storeId: currentUser.storeId,
        createdBy: currentUser.uid,
        createdByName: currentUser.nickname ?? null,
        ...(assignee.trim() ? { assignee: assignee.trim() } : {}),
        title: title.trim(),
        ...(selectedTemplate ? { templateId: selectedTemplate.id, steps: selectedTemplate.steps } : {}),
        ...(task.trim() ? { task: task.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        targetDate: dateStr,
        ...(dueDate ? { dueDate } : {}),
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
        ...(priority ? { priority } : {}),
        ...(icon ? { icon } : {}),
        visibleTo,
      });
      onAdded(); onClose();
    } finally { setSaving(false); }
  };

  const toggleUser = (uid: string) => setVisibleTo((prev) => prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]);

  const showFlowPanel = selectedTemplate && selectedTemplate.steps.length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity activeOpacity={1} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View style={{
          backgroundColor: cs.surfaceContainerHigh, borderRadius: 16,
          width: isMobile ? "95%" : (showFlowPanel ? 700 : 480),
          maxHeight: "90%", padding: 20,
        }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: cs.onSurface, marginBottom: 16 }}>
            Todo追加 - {format(selectedDate, "M/d (E)", { locale: ja })}
          </Text>

          {/* モバイル時タブ */}
          {isMobile && showFlowPanel && (
            <View style={{ flexDirection: "row", marginBottom: 12, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: cs.outlineVariant }}>
              {([{ key: "form" as const, label: "選択" }, { key: "flow" as const, label: "フロー" }]).map((tab) => (
                <TouchableOpacity key={tab.key} onPress={() => setModalTab(tab.key)}
                  style={{ flex: 1, paddingVertical: 8, alignItems: "center", backgroundColor: modalTab === tab.key ? cs.primary : "transparent" }}>
                  <Text style={{ fontSize: 13, fontWeight: modalTab === tab.key ? "700" : "400", color: modalTab === tab.key ? cs.onPrimary : cs.onSurfaceVariant }}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ flexDirection: isMobile ? "column" : "row", flex: 1, gap: isMobile ? 12 : 16, minHeight: 0 }}>
            {/* 左パネル: フォーム */}
            {(!isMobile || modalTab === "form" || !showFlowPanel) && (
            <ScrollView ref={scrollRef} style={{ flex: 1, flexShrink: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* 優先度 */}
              <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>優先度</Text>
              <View style={{ flexDirection: "row", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                <TouchableOpacity onPress={() => setPriority(null)}
                  style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1.5, borderColor: priority === null ? cs.primary : cs.outlineVariant, backgroundColor: priority === null ? cs.primaryContainer : "transparent" }}>
                  <Text style={{ fontSize: 12, fontWeight: priority === null ? "600" : "400", color: priority === null ? cs.primary : cs.onSurfaceVariant }}>未設定</Text>
                </TouchableOpacity>
                {(Object.entries(PRIORITY_CONFIG) as [TodoPriority, typeof PRIORITY_CONFIG[TodoPriority]][]).map(([key, cfg]) => (
                  <TouchableOpacity key={key} onPress={() => setPriority(key)}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1.5, borderColor: priority === key ? cfg.color : cs.outlineVariant, backgroundColor: priority === key ? cfg.bg : "transparent" }}>
                    <Text style={{ fontSize: 12, fontWeight: priority === key ? "700" : "400", color: priority === key ? cfg.color : cs.onSurfaceVariant }}>{cfg.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* タイトル（プルダウン） */}
              <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>タイトル *</Text>
              <TouchableOpacity
                onPress={() => setShowTemplatePicker(!showTemplatePicker)}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: cs.surface, marginBottom: showTemplatePicker ? 0 : 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  {selectedTemplate?.icon && <Ionicons name={selectedTemplate.icon as any} size={16} color={cs.primary} />}
                  <Text style={{ fontSize: 14, color: selectedTemplateId ? cs.onSurface : cs.outline }}>
                    {selectedTemplate?.title || "テンプレートから選択..."}
                  </Text>
                </View>
                <Ionicons name={showTemplatePicker ? "chevron-up" : "chevron-down"} size={18} color={cs.outline} />
              </TouchableOpacity>
              {showTemplatePicker && (
                <View style={{ borderWidth: 1, borderColor: cs.outlineVariant, borderRadius: 8, backgroundColor: cs.surface, marginBottom: 4, maxHeight: 140 }}>
                  <ScrollView contentContainerStyle={{ padding: 4 }}>
                    {/* カスタム（自由入力） */}
                    <TouchableOpacity onPress={() => { setSelectedTemplateId(null); setTitle(""); setShowTemplatePicker(false); }}
                      style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, backgroundColor: !selectedTemplateId ? cs.primaryContainer : "transparent" }}>
                      <Text style={{ fontSize: 13, color: cs.onSurface, fontWeight: !selectedTemplateId ? "600" : "400" }}>自由入力</Text>
                    </TouchableOpacity>
                    {templates.map((t) => (
                      <TouchableOpacity key={t.id} onPress={() => { setSelectedTemplateId(t.id); setShowTemplatePicker(false); }}
                        style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, backgroundColor: selectedTemplateId === t.id ? cs.primaryContainer : "transparent", flexDirection: "row", alignItems: "center", gap: 6 }}>
                        {t.icon && <Ionicons name={t.icon as any} size={16} color={selectedTemplateId === t.id ? cs.primary : cs.onSurfaceVariant} />}
                        <View>
                          <Text style={{ fontSize: 13, color: cs.onSurface, fontWeight: selectedTemplateId === t.id ? "600" : "400" }}>{t.title}</Text>
                          {t.steps.length > 0 && <Text style={{ fontSize: 10, color: cs.outline }}>{t.steps.length}ステップ</Text>}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {/* 自由入力時のみテキストボックス表示 */}
              {!selectedTemplateId && (
                <TextInput value={title} onChangeText={setTitle} placeholder="やることを入力..." placeholderTextColor={cs.outline}
                  style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: cs.onSurface, backgroundColor: cs.surface, marginBottom: 8 }} />
              )}
              <View style={{ height: 4 }} />

              {/* 依頼対象 */}
              <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>依頼対象</Text>
              <TextInput value={assignee} onChangeText={setAssignee} placeholder="誰に対して？（任意）" placeholderTextColor={cs.outline}
                style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: cs.onSurface, backgroundColor: cs.surface, marginBottom: 12 }} />

              {/* 依頼内容詳細 */}
              <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>依頼内容詳細</Text>
              <TextInput value={task} onChangeText={setTask} placeholder="具体的な作業内容（任意）" placeholderTextColor={cs.outline} multiline numberOfLines={2}
                style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: cs.onSurface, backgroundColor: cs.surface, marginBottom: 12, minHeight: 48, textAlignVertical: "top" }} />

              {/* 期限 / 期間 */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: cs.onSurfaceVariant }}>期限</Text>
                <TouchableOpacity onPress={() => { setShowDueDate(!showDueDate); if (!showDueDate) { setDueDate(""); } else { setStartTime(""); setEndTime(""); } }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: showDueDate ? cs.primary : cs.outlineVariant, backgroundColor: showDueDate ? cs.primaryContainer : "transparent" }}>
                  <Ionicons name="time-outline" size={12} color={showDueDate ? cs.primary : cs.onSurfaceVariant} />
                  <Text style={{ fontSize: 11, fontWeight: showDueDate ? "600" : "400", color: showDueDate ? cs.primary : cs.onSurfaceVariant }}>期間で指定</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                {/* 日付ボックス（常時表示） */}
                <View style={{ flex: showDueDate ? 1 : undefined, width: showDueDate ? undefined : "100%" }}>
                  {React.createElement("input", {
                    type: "date",
                    value: dueDate,
                    onChange: (e: any) => setDueDate(e.target.value),
                    style: {
                      width: "100%", boxSizing: "border-box",
                      border: `1px solid ${cs.outline}`, borderRadius: 8,
                      paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
                      fontSize: 13, color: cs.onSurface, backgroundColor: cs.surface,
                      outline: "none", fontFamily: "inherit",
                    },
                  })}
                </View>
                {/* 時間帯Picker（期間で指定ON時のみ） */}
                {showDueDate && (
                  <>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: cs.outline, borderRadius: 8, overflow: "hidden", backgroundColor: cs.surface }}>
                      <Picker
                        selectedValue={startTime}
                        onValueChange={(v) => setStartTime(v as string)}
                        style={{ height: 34, fontSize: 13, color: cs.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}
                      >
                        <Picker.Item label="開始" value="" style={{ fontSize: 13, color: cs.outline }} />
                        {TIME_OPTS.map((t) => <Picker.Item key={t} label={t} value={t} style={{ fontSize: 13 }} />)}
                      </Picker>
                    </View>
                    <Text style={{ fontSize: 13, color: cs.onSurfaceVariant }}>~</Text>
                    <View style={{ flex: 1, borderWidth: 1, borderColor: cs.outline, borderRadius: 8, overflow: "hidden", backgroundColor: cs.surface }}>
                      <Picker
                        selectedValue={endTime}
                        onValueChange={(v) => setEndTime(v as string)}
                        style={{ height: 34, fontSize: 13, color: cs.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}
                      >
                        <Picker.Item label="終了" value="" style={{ fontSize: 13, color: cs.outline }} />
                        {TIME_OPTS.map((t) => <Picker.Item key={t} label={t} value={t} style={{ fontSize: 13 }} />)}
                      </Picker>
                    </View>
                  </>
                )}
              </View>

              {/* 公開先 */}
              <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>公開先</Text>
              <TouchableOpacity onPress={() => setShowUserPicker(!showUserPicker)}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: cs.outline, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: cs.surface, marginBottom: 4 }}>
                <Text style={{ fontSize: 14, color: cs.onSurface }}>{visibleTo.length === 0 ? "全員に表示" : `${visibleTo.length}人を選択中`}</Text>
                <Ionicons name={showUserPicker ? "chevron-up" : "chevron-down"} size={18} color={cs.outline} />
              </TouchableOpacity>
              {showUserPicker && (
                <ScrollView style={{ maxHeight: 120, borderWidth: 1, borderColor: cs.outlineVariant, borderRadius: 8, backgroundColor: cs.surface, marginBottom: 12 }} contentContainerStyle={{ padding: 4 }}>
                  <TouchableOpacity onPress={() => setVisibleTo([])} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, backgroundColor: visibleTo.length === 0 ? cs.primaryContainer : "transparent" }}>
                    <Ionicons name={visibleTo.length === 0 ? "radio-button-on" : "radio-button-off"} size={16} color={visibleTo.length === 0 ? cs.primary : cs.outline} />
                    <Text style={{ marginLeft: 8, fontSize: 13, color: cs.onSurface, fontWeight: visibleTo.length === 0 ? "600" : "400" }}>全員に表示</Text>
                  </TouchableOpacity>
                  {users.filter((u) => u.uid !== currentUser?.uid).map((u) => {
                    const sel = visibleTo.includes(u.uid);
                    return (
                      <TouchableOpacity key={u.uid} onPress={() => toggleUser(u.uid)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, backgroundColor: sel ? cs.primaryContainer : "transparent" }}>
                        <Ionicons name={sel ? "checkbox" : "square-outline"} size={16} color={sel ? cs.primary : cs.outline} />
                        <Text style={{ marginLeft: 8, fontSize: 13, color: cs.onSurface }}>{u.nickname ?? u.email ?? u.uid}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
              {!showUserPicker && <View style={{ height: 8 }} />}
            </ScrollView>
            )}

            {/* 右パネル / フロータブ: フローチャート */}
            {showFlowPanel && !isMobile && (
              <View style={{ width: 200, borderLeftWidth: 1, borderLeftColor: cs.outlineVariant, paddingLeft: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: cs.onSurfaceVariant, marginBottom: 10 }}>フロー</Text>
                <StepFlow steps={selectedTemplate!.steps} cs={cs} size="small" />
              </View>
            )}
            {showFlowPanel && isMobile && modalTab === "flow" && (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <StepFlow steps={selectedTemplate!.steps} cs={cs} size="small" />
              </ScrollView>
            )}
          </View>

          {/* ボタン */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: cs.outline }}>
              <Text style={{ fontSize: 14, color: cs.onSurface }}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={!title.trim() || saving}
              style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: title.trim() && !saving ? cs.primary : cs.surfaceVariant }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: title.trim() && !saving ? cs.onPrimary : cs.onSurfaceVariant }}>
                {saving ? "保存中..." : "追加"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});
