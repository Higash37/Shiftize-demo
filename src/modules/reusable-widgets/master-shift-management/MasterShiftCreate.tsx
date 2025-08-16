import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Animated,
  Text,
} from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import CalendarModal from "@/modules/reusable-widgets/calendar/modals/CalendarModal";

// Components
import { UserSelectSection } from "./components/form-sections/UserSelectSection";
import { StatusSelectSection } from "./components/form-sections/StatusSelectSection";
import { TimeSelectSection } from "./components/form-sections/TimeSelectSection";
import { DateSelectSection } from "./components/form-sections/DateSelectSection";
import { ClassTimeSection } from "./components/form-sections/ClassTimeSection";
import { MasterShiftActions } from "./components/form-sections/MasterShiftActions";

// Hooks
import { useMasterShiftState } from "./components/useMasterShiftState";
import { useMasterShiftData } from "./components/useMasterShiftData";
import { useMasterShiftHandlers } from "./components/useMasterShiftHandlers";

// Types and styles
import { MasterShiftCreateProps } from "./components/types";
import { styles } from "./MasterShiftCreate.styles";

export const MasterShiftCreate: React.FC<MasterShiftCreateProps> = ({
  mode,
  shiftId,
  date,
  startTime,
  endTime,
  classes,
}) => {
  const isEditMode = mode === "edit";

  const {
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
    updateShiftData,
    resetForm,
  } = useMasterShiftState(date, startTime, endTime, classes);

  const { users } = useMasterShiftData(
    isEditMode,
    shiftId,
    setUserData,
    setExistingShift,
    setConnectedStoreUsers,
    setSelectedUserId,
    setSelectedUserNickname,
    setSelectedStatus,
    setShiftData,
    setIsLoading
  );

  const {
    handleDatesConfirm,
    handleCreateShift,
    handleUpdateShift,
    handleDelete,
  } = useMasterShiftHandlers(
    setIsLoading,
    setErrorMessage,
    setShowSuccess,
    fadeAnim,
    resetForm
  );

  // Update selected user nickname when user selection changes
  useEffect(() => {
    const allUsers = [...users, ...connectedStoreUsers];
    const selectedUser = allUsers.find((u) => u.uid === selectedUserId);
    if (selectedUser) {
      setSelectedUserNickname(selectedUser.nickname);
    }
  }, [selectedUserId, users, connectedStoreUsers, setSelectedUserNickname]);

  const handleUserSelect = (userId: string, nickname: string) => {
    setSelectedUserId(userId);
    setSelectedUserNickname(nickname);
  };

  const handleDateRemove = (date: string) => {
    updateShiftData({
      dates: shiftData.dates.filter((d) => d !== date),
    });
  };

  const handleClassTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    updateShiftData({
      classes: shiftData.classes.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    });
  };

  const handleRemoveClass = (index: number) => {
    updateShiftData({
      classes: shiftData.classes.filter((_, i) => i !== index),
    });
  };

  const handleAddClass = () => {
    updateShiftData({
      classes: [...shiftData.classes, { startTime: "", endTime: "" }],
    });
  };

  const handleSave = () => {
    if (isEditMode) {
      handleUpdateShift(
        existingShift!,
        shiftData,
        selectedUserId,
        selectedUserNickname,
        selectedStatus
      );
    } else {
      handleCreateShift(
        shiftData,
        selectedUserId,
        selectedUserNickname,
        selectedStatus,
        users,
        setSelectedUserNickname
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MasterHeader title={isEditMode ? "シフト編集" : "シフト追加"} />
      <View style={styles.container}>
        <CustomScrollView style={styles.scrollView}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <UserSelectSection
            users={users}
            connectedStoreUsers={connectedStoreUsers}
            selectedUserId={selectedUserId}
            searchQuery={searchQuery}
            onUserSelect={handleUserSelect}
            onSearchChange={setSearchQuery}
          />

          <StatusSelectSection
            selectedUserId={selectedUserId}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          <TimeSelectSection
            startTime={shiftData.startTime}
            endTime={shiftData.endTime}
            onStartTimeChange={(time) => updateShiftData({ startTime: time })}
            onEndTimeChange={(time) => updateShiftData({ endTime: time })}
          />

          <DateSelectSection
            selectedDates={shiftData.dates}
            onCalendarOpen={() => setShowCalendar(true)}
            onDateRemove={handleDateRemove}
          />

          <ClassTimeSection
            hasClass={shiftData.hasClass}
            classes={shiftData.classes}
            onToggleClass={() => updateShiftData({ hasClass: !shiftData.hasClass })}
            onClassTimeChange={handleClassTimeChange}
            onRemoveClass={handleRemoveClass}
            onAddClass={handleAddClass}
          />

          <MasterShiftActions
            isEditMode={isEditMode}
            isLoading={isLoading}
            onSave={handleSave}
            onDelete={existingShift ? () => handleDelete(existingShift) : undefined}
          />
        </CustomScrollView>

        <CalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onConfirm={(dates) => {
            handleDatesConfirm(dates, updateShiftData);
            setShowCalendar(false);
          }}
          initialDates={shiftData.dates}
        />

        {showSuccess && (
          <Animated.View
            style={[
              styles.successMessage,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.successText}>シフトを追加しました！</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
};