import { useState, useEffect, useMemo } from "react";
import { useWindowDimensions, Dimensions } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { 
  DEFAULT_SHIFT_STATUS_CONFIG,
  ShiftStatusConfig 
} from "@/common/common-models/model-shift/shiftTypes";
import { GanttState, BatchModalState, GanttDimensions } from "./types";

export const useGanttState = (initialDate: Date, shifts: ShiftItem[]) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [state, setState] = useState<GanttState>({
    showEditModal: false,
    showAddModal: false,
    showDatePicker: false,
    editModalType: null,
    editingShift: null,
    selectedDate: initialDate,
    selectedUserId: "",
    isLoading: false,
    refreshKey: 0,
    scrollPosition: 0,
    colorMode: "status",
    showPayrollModal: false,
    viewMode: "gantt",
    deviceType: "desktop",
    useGoogleLayout: false,
    showHistoryModal: false,
  });

  const [batchModal, setBatchModal] = useState<BatchModalState>({
    visible: false,
    type: null,
  });

  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );

  // デバイスタイプの判定
  useEffect(() => {
    const checkDeviceType = () => {
      const width = Dimensions.get("window").width;
      let deviceType: "desktop" | "tablet" | "mobile" = "desktop";
      
      if (width <= 600) {
        deviceType = "mobile";
      } else if (width <= 1024) {
        deviceType = "tablet";
      }
      
      setState(prev => ({ ...prev, deviceType }));
    };
    
    checkDeviceType();
    
    const subscription = Dimensions.addEventListener('change', checkDeviceType);
    return () => subscription?.remove();
  }, []);

  // ステータス設定の監視
  useEffect(() => {
    const configRef = doc(db, "settings", "shiftStatus");
    const unsubscribe = onSnapshot(
      configRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const updatedConfigs: ShiftStatusConfig[] =
            DEFAULT_SHIFT_STATUS_CONFIG.map((config) => ({
              ...config,
              ...data[config.status],
            }));
          setStatusConfigs(updatedConfigs);
        }
      },
      (error) => {
        if (error.code === 'permission-denied') {
          return;
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 画面サイズによる表示モード自動判定
  const shouldUseCompactView = useMemo(() => {
    return windowWidth < 768 && windowWidth >= 500 && state.viewMode === "gantt";
  }, [windowWidth, state.viewMode]);

  // 表示対象のシフト（deleted, purgedは除外）
  const visibleShifts = useMemo(() => {
    return shifts.filter(
      (shift) => shift.status !== "deleted" && shift.status !== "purged"
    );
  }, [shifts]);

  // 画面サイズ計算
  const dimensions: GanttDimensions = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    const dateColumnWidth = 50;
    const infoColumnWidth = Math.max(screenWidth * 0.18, 150);
    const ganttColumnWidth = screenWidth - dateColumnWidth - infoColumnWidth;

    return {
      dateColumnWidth,
      infoColumnWidth,
      ganttColumnWidth,
    };
  }, []);

  const updateState = (updates: Partial<GanttState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const getStatusConfig = (status: string) => {
    return statusConfigs.find((config) => config.status === status) || statusConfigs[0];
  };

  return {
    state,
    updateState,
    batchModal,
    setBatchModal,
    statusConfigs,
    shouldUseCompactView,
    visibleShifts,
    dimensions,
    getStatusConfig,
    windowWidth,
    windowHeight,
  };
};