import { useState } from "react";
import { Animated } from "react-native";
import type { ShiftStatus } from "@/common/common-models/ModelIndex";
import { MasterShiftCreateState, ShiftData, ConnectedStoreUser } from "./types";
import type { UserData } from "@/services/firebase/firebase";
import type { Shift } from "@/common/common-models/ModelIndex";

export const useMasterShiftState = (
  initialDate?: string,
  initialStartTime?: string,
  initialEndTime?: string,
  initialClasses?: string
) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingShift, setExistingShift] = useState<Shift | null>(null);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: initialStartTime || "",
    endTime: initialEndTime || "",
    dates: initialDate ? [initialDate] : [],
    hasClass: initialClasses ? JSON.parse(initialClasses).length > 0 : false,
    classes: initialClasses ? JSON.parse(initialClasses) : [],
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserNickname, setSelectedUserNickname] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<ShiftStatus>("approved");
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [selectedStartTime, setSelectedStartTime] = useState(initialStartTime || "");
  const [selectedEndTime, setSelectedEndTime] = useState(initialEndTime || "");
  const [selectedClasses, setSelectedClasses] = useState<any[]>(() => {
    if (initialClasses) {
      try {
        return JSON.parse(initialClasses);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [connectedStoreUsers, setConnectedStoreUsers] = useState<ConnectedStoreUser[]>([]);
  const fadeAnim = new Animated.Value(0);

  const updateShiftData = (updates: Partial<ShiftData>) => {
    setShiftData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setShiftData({
      startTime: "",
      endTime: "",
      dates: [],
      hasClass: false,
      classes: [],
    });
    setSelectedUserId("");
    setSelectedUserNickname("");
    setSelectedDate("");
    setSelectedStartTime("");
    setSelectedEndTime("");
    setSelectedClasses([]);
    setErrorMessage("");
  };

  return {
    // State
    userData,
    existingShift,
    shiftData,
    showCalendar,
    isLoading,
    showSuccess,
    errorMessage,
    selectedUserId,
    selectedUserNickname,
    searchQuery,
    selectedStatus,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    selectedClasses,
    connectedStoreUsers,
    fadeAnim,
    
    // Setters
    setUserData,
    setExistingShift,
    setShiftData,
    setShowCalendar,
    setIsLoading,
    setShowSuccess,
    setErrorMessage,
    setSelectedUserId,
    setSelectedUserNickname,
    setSearchQuery,
    setSelectedStatus,
    setSelectedDate,
    setSelectedStartTime,
    setSelectedEndTime,
    setSelectedClasses,
    setConnectedStoreUsers,
    
    // Helper functions
    updateShiftData,
    resetForm,
  };
};