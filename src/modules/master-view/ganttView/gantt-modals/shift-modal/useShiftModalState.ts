import { useState, useEffect } from "react";
import {
  ShiftData,
  ConnectedStoreUser,
  ClassFormData,
} from "./types";
import {
  ShiftStatus,
  ClassTimeSlot,
  ShiftTaskSlot,
} from "@/common/common-models/ModelIndex";
import { MultiStoreService } from "@/services/firebase/firebase-multistore";
import { useAuth } from "@/services/auth/useAuth";

export const useShiftModalState = (
  mode: "create" | "edit" | "delete",
  shiftData?: ShiftData,
  date?: string
) => {
  const { user } = useAuth();
  
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<ShiftStatus>("approved");
  const [classes, setClasses] = useState<ClassTimeSlot[]>([]);
  const [extendedTasks, setExtendedTasks] = useState<ShiftTaskSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectedStoreUsers, setConnectedStoreUsers] = useState<ConnectedStoreUser[]>([]);
  
  const [showClassForm, setShowClassForm] = useState(false);
  const [classFormData, setClassFormData] = useState<ClassFormData>({
    startTime: "",
    endTime: "",
    studentId: "",
    studentName: "",
    subject: "",
    location: "",
  });

  useEffect(() => {
    if (mode === "edit" && shiftData) {
      setSelectedUserId(shiftData.userId);
      setStartTime(shiftData.startTime);
      setEndTime(shiftData.endTime);
      setSubject(shiftData.subject || "");
      setStatus(shiftData.status || "approved");
      setClasses(shiftData.classes || []);
      setExtendedTasks(shiftData.extendedTasks || []);
    }
  }, [mode, shiftData]);

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (user?.storeId) {
        try {
          const connectedUsers = await MultiStoreService.getConnectedStoreUsers(
            user.storeId
          );
          setConnectedStoreUsers(connectedUsers);
        } catch (error) {
          console.error("Error fetching connected users:", error);
        }
      }
    };
    fetchConnectedUsers();
  }, [user?.storeId]);

  const resetForm = () => {
    setSelectedUserId("");
    setStartTime("");
    setEndTime("");
    setSubject("");
    setStatus("approved");
    setClasses([]);
    setExtendedTasks([]);
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

  return {
    selectedUserId,
    setSelectedUserId,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    subject,
    setSubject,
    status,
    setStatus,
    classes,
    setClasses,
    extendedTasks,
    setExtendedTasks,
    loading,
    setLoading,
    connectedStoreUsers,
    showClassForm,
    setShowClassForm,
    classFormData,
    setClassFormData,
    resetForm,
  };
};