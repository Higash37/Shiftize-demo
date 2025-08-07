import React from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import TimeSelect from "@/modules/user-view/shift-ui-components/TimeSelect";
import CalendarModal from "@/modules/child-components/calendar/calendar-components/calendar-modal/calendarModal/CalendarModal";
import { Header } from "@/common/common-ui/ui-layout";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-constants/ThemeConstants";
import { shiftCreateFormStyles as styles } from "./styles";
import type { ShiftData } from "./types";
import { StoreInfo } from "@/services/firebase/firebase-multistore";

interface ShiftCreateFormContentProps {
  containerStyle: any; // Replace 'any' with the appropriate type
  selectedDate: string;
  setShowCalendar: (value: boolean) => void;
  handleDateSelect: (dates: string[]) => void; // Update type to accept multiple dates
  shiftData: ShiftData;
  handleTimeChange: (
    type: "start" | "end" | "classStart" | "classEnd",
    value: string,
    index?: number
  ) => void;
  addClass: () => void;
  removeClass: (index: number) => void;
  errorMessage: string;
  handleCreateOrUpdateShift: () => void;
  handleDeleteShift: () => void;
  isEditMode: boolean;
  showCalendar: boolean;
  showSuccess: boolean;
  fadeAnim: Animated.Value;
  connectedStores: StoreInfo[];
  selectedStoreId: string;
  onStoreChange: (storeId: string) => void;
}

const ShiftCreateFormContent: React.FC<ShiftCreateFormContentProps> = ({
  containerStyle,
  selectedDate,
  setShowCalendar,
  handleDateSelect,
  shiftData,
  handleTimeChange,
  addClass,
  removeClass,
  errorMessage,
  handleCreateOrUpdateShift,
  handleDeleteShift,
  isEditMode,
  showCalendar,
  showSuccess,
  fadeAnim,
  connectedStores,
  selectedStoreId,
  onStoreChange,
}) => {
  return (
    <>
      <View style={{ width: "100%" }}></View>
      <ScrollView
        style={containerStyle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.formContainer}>
          {/* 店舗選択 - デバッグ用の表示 */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>勤務店舗</Text>
            {connectedStores.length > 0 ? (
              <View style={styles.storeSelectContainer}>
                {connectedStores.map((store) => (
                  <TouchableOpacity
                    key={store.storeId}
                    style={[
                      styles.storeSelectButton,
                      selectedStoreId === store.storeId &&
                        styles.storeSelectButtonSelected,
                    ]}
                    onPress={() => onStoreChange(store.storeId)}
                  >
                    <Text
                      style={[
                        styles.storeSelectText,
                        selectedStoreId === store.storeId &&
                          styles.storeSelectTextSelected,
                      ]}
                    >
                      {store.storeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.storeSelectText}>
                店舗情報を読み込み中...
              </Text>
            )}
          </View>

          {/* 日付選択 */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>日付</Text>
            <TouchableOpacity
              style={styles.dateSelectButton}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.dateSelectText}>
                {shiftData.dates.length > 0
                  ? shiftData.dates
                      .map((date) =>
                        format(new Date(date), "yyyy年M月d日(E)", {
                          locale: ja,
                        })
                      )
                      .join("\n") // 複数日を改行で表示
                  : "日付を選択"}
              </Text>
              <AntDesign name="calendar" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {/* 時間選択 */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>時間</Text>
            <View style={styles.timeContainer}>
              <View style={styles.timeSelectContainer}>
                <Text style={styles.timeLabel}>開始</Text>
                <TimeSelect
                  value={shiftData.startTime}
                  onChange={(value) => handleTimeChange("start", value)}
                />
              </View>
              <Text style={styles.timeSeparator}>～</Text>
              <View style={styles.timeSelectContainer}>
                <Text style={styles.timeLabel}>終了</Text>
                <TimeSelect
                  value={shiftData.endTime}
                  onChange={(value) => handleTimeChange("end", value)}
                />
              </View>
            </View>
          </View>
          {/* 授業設定 */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>授業</Text>
              <TouchableOpacity style={styles.addButton} onPress={addClass}>
                <AntDesign name="plus" size={18} color="white" />
                <Text style={styles.addButtonText}>授業を追加</Text>
              </TouchableOpacity>
            </View>

            {shiftData.classes.length > 0 ? (
              <View style={styles.classesList}>
                {shiftData.classes.map((classItem, index) => (
                  <View key={index} style={styles.classItem}>
                    <View style={styles.classHeader}>
                      <Text style={styles.classTitle}>授業 {index + 1}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeClass(index)}
                      >
                        <AntDesign
                          name="close"
                          size={18}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.classTimeContainer}>
                      <View style={styles.timeSelectContainer}>
                        <Text style={styles.timeLabel}>開始</Text>
                        <TimeSelect
                          value={classItem.startTime}
                          onChange={(value) =>
                            handleTimeChange("classStart", value, index)
                          }
                        />
                      </View>
                      <Text style={styles.timeSeparator}>～</Text>
                      <View style={styles.timeSelectContainer}>
                        <Text style={styles.timeLabel}>終了</Text>
                        <TimeSelect
                          value={classItem.endTime}
                          onChange={(value) =>
                            handleTimeChange("classEnd", value, index)
                          }
                        />
                      </View>
                    </View>
                    {index === shiftData.classes.length - 1 &&
                      shiftData.classes.length < 7 && (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={addClass}
                        >
                          <AntDesign name="plus" size={18} color="white" />
                          <Text style={styles.addButtonText}>授業を追加</Text>
                        </TouchableOpacity>
                      )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noClassContainer}>
                <Text style={styles.noClassText}>
                  授業がありません。追加してください。
                </Text>
              </View>
            )}
          </View>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateOrUpdateShift}
            >
              <Text style={styles.submitButtonText}>
                {isEditMode ? "更新する" : "作成する"}
              </Text>
            </TouchableOpacity>

            {isEditMode && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteShift}
              >
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={(dates: string[]) => {
          if (dates.length > 0) {
            handleDateSelect(dates);
          }
        }}
        initialDates={selectedDate ? [selectedDate] : []}
      />
      {showSuccess && (
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <AntDesign name="checkcircle" size={48} color="white" />
          <Text style={styles.successText}>
            {isEditMode ? "更新しました" : "作成しました"}
          </Text>
        </Animated.View>
      )}
    </>
  );
};

export default ShiftCreateFormContent;
