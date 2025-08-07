import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { styles } from "./styles";
import { TimeSelectProps } from "./types";
import { generateTimeOptions } from "../../shift-ui-utils/ui-utils";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";

/**
 * TimeSelect - 時間選択コンポーネント
 *
 * 単一の時間選択と開始・終了時間の両方に対応した時間選択UIを提供します。
 * モーダルでの時間オプション表示機能を持ち、カスタマイズ可能なzIndexをサポートします。
 */
const TimeSelect: React.FC<TimeSelectProps> = ({
  label,
  value,
  onChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  zIndex = 1,
}) => {
  const [showStartOptions, setShowStartOptions] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const timeOptions = generateTimeOptions();

  // 開始時間選択ハンドラ
  const handleStartSelect = (time: string) => {
    if (onStartTimeChange) {
      onStartTimeChange(time);
    }
    setShowStartOptions(false);
  };

  // 終了時間選択ハンドラ
  const handleEndSelect = (time: string) => {
    if (onEndTimeChange) {
      onEndTimeChange(time);
    }
    setShowEndOptions(false);
  };

  // 単一時間選択ハンドラ
  const handleSelect = (time: string) => {
    if (onChange) {
      onChange(time);
    }
    setShowStartOptions(false);
    setShowEndOptions(false);
  };

  // 開始・終了時間モードの場合
  if (startTime !== undefined && endTime !== undefined) {
    return (
      <View style={[styles.container, { zIndex }]}>
        <View style={styles.timeContainer}>
          <View style={styles.timeSelect}>
            <Text style={styles.label}>開始時間</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowStartOptions(true)}
            >
              <Text style={styles.buttonText}>{startTime || "時間を選択"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeSelect}>
            <Text style={styles.label}>終了時間</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowEndOptions(true)}
            >
              <Text style={styles.buttonText}>{endTime || "時間を選択"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showStartOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStartOptions(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowStartOptions(false)}
          >
            <View style={styles.modalContent}>
              <Pressable>
                <View style={styles.optionsContainer}>
                  <CustomScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                  >
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.optionItem,
                          startTime === time && styles.selectedOption,
                        ]}
                        onPress={() => handleStartSelect(time)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            startTime === time && styles.selectedOptionText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </CustomScrollView>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <Modal
          visible={showEndOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEndOptions(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowEndOptions(false)}
          >
            <View style={styles.modalContent}>
              <Pressable>
                <View style={styles.optionsContainer}>
                  <CustomScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                  >
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.optionItem,
                          endTime === time && styles.selectedOption,
                        ]}
                        onPress={() => handleEndSelect(time)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            endTime === time && styles.selectedOptionText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </CustomScrollView>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // 単一時間選択モードの場合
  return (
    <View style={[styles.container, { zIndex }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowStartOptions(true)}
      >
        <Text style={styles.buttonText}>{value || "時間を選択"}</Text>
      </TouchableOpacity>

      <Modal
        visible={showStartOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStartOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowStartOptions(false)}
        >
          <View style={styles.modalContent}>
            <Pressable>
              <View style={styles.optionsContainer}>
                <CustomScrollView
                  style={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.optionItem,
                        value === time && styles.selectedOption,
                      ]}
                      onPress={() => handleSelect(time)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          value === time && styles.selectedOptionText,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </CustomScrollView>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default TimeSelect;
