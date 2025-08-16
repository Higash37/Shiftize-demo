import { Alert } from "react-native";
import { ShiftData, ClassFormData } from "./types";
import { ClassTimeSlot } from "@/common/common-models/ModelIndex";

export const useShiftModalHandlers = (
  mode: "create" | "edit" | "delete",
  date: string | undefined,
  shiftData: ShiftData | undefined,
  selectedUserId: string,
  startTime: string,
  endTime: string,
  subject: string,
  status: string,
  classes: ClassTimeSlot[],
  extendedTasks: any[],
  classFormData: ClassFormData,
  setClasses: (classes: ClassTimeSlot[]) => void,
  setShowClassForm: (show: boolean) => void,
  setClassFormData: (data: ClassFormData) => void,
  resetForm: () => void,
  onSave?: (data: ShiftData) => void,
  onDelete?: (shiftId: string) => void,
  onClose: () => void
) => {
  const validateForm = () => {
    if (!selectedUserId) {
      Alert.alert("エラー", "ユーザーを選択してください");
      return false;
    }
    if (!startTime || !endTime) {
      Alert.alert("エラー", "開始時刻と終了時刻を入力してください");
      return false;
    }
    if (startTime >= endTime) {
      Alert.alert("エラー", "終了時刻は開始時刻より後にしてください");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const finalDate = mode === "edit" && shiftData ? shiftData.date : date;
    if (!finalDate) {
      Alert.alert("エラー", "日付が設定されていません");
      return;
    }

    const newShiftData: ShiftData = {
      ...(mode === "edit" && shiftData?.id ? { id: shiftData.id } : {}),
      userId: selectedUserId,
      date: finalDate,
      startTime,
      endTime,
      subject,
      status: status as any,
      classes,
      extendedTasks,
    };

    if (onSave) {
      onSave(newShiftData);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (mode === "delete" && shiftData?.id) {
      Alert.alert(
        "シフト削除の確認",
        "このシフトを削除してもよろしいですか？",
        [
          {
            text: "キャンセル",
            style: "cancel",
          },
          {
            text: "削除",
            style: "destructive",
            onPress: () => {
              if (onDelete) {
                onDelete(shiftData.id!);
              }
              handleClose();
            },
          },
        ]
      );
    }
  };

  const handleAddClass = () => {
    if (
      !classFormData.startTime ||
      !classFormData.endTime ||
      !classFormData.studentName ||
      !classFormData.subject
    ) {
      Alert.alert("エラー", "必須項目を入力してください");
      return;
    }

    const newClass: ClassTimeSlot = {
      id: Date.now().toString(),
      startTime: classFormData.startTime,
      endTime: classFormData.endTime,
      studentId: classFormData.studentId,
      studentName: classFormData.studentName,
      subject: classFormData.subject,
      location: classFormData.location,
    };

    setClasses([...classes, newClass]);
    setShowClassForm(false);
    setClassFormData({
      startTime: "",
      endTime: "",
      studentId: "",
      studentName: "",
      subject: "",
      location: "",
    });
  };

  const handleRemoveClass = (classId: string) => {
    setClasses(classes.filter((c) => c.id !== classId));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return {
    validateForm,
    handleSave,
    handleDelete,
    handleAddClass,
    handleRemoveClass,
    handleClose,
  };
};