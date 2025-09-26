/**
 * Firebase 統合モジュール
 *
 * このファイルはFirebase関連の機能を各サブモジュールから集約し、
 * アプリケーション全体で使用するためのインターフェースを提供します。
 */

// Firebaseコア機能のインポート
export { auth, db, app } from "./firebase-core";

// Firebase認証モジュールからのインポート
export {
  signIn,
  getUserRole,
  signOutUser,
  createUser,
  updateUser,
  changePassword,
  createInitialMasterUser,
  AuthService,
} from "./firebase-auth";

// Firebaseシフト管理モジュールからのインポート
export {
  getShifts,
  addShift,
  updateShift,
  markShiftAsDeleted,
  approveShiftChanges,
  markShiftAsCompleted,
  getShiftsFromMultipleStores,
  getUserAccessibleShifts,
  ShiftService,
} from "./firebase-shift";

// Firebaseユーザー管理モジュールからのインポート
export {
  getUsers,
  deleteUser,
  getUserData,
  checkMasterExists,
  checkEmailExists,
  UserService,
} from "./firebase-user";

// タスク管理モジュールからのインポート
export {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  TaskService,
} from "./firebase-task";

// ユーザーの型をエクスポート
export { User, UserData } from "@/common/common-models/model-user/UserModel";
