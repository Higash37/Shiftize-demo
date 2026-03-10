/**
 * @file ShiftDetails.tsx
 * @description シフトの詳細情報をアニメーション付きの開閉パネルで表示するコンポーネント。
 *              授業時間とスタッフ時間を時系列順に表示する。
 *              Animated API を使って高さアニメーションを実現する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react, react-native, date-fns, スタイル/型/テーマ,
//              TimeSegmentTypesContext（業務区分タイプのコンテキスト）,
//              shift.utils（時間文字列パーサー）
// インポート先: ShiftListAdapter.tsx（アダプター経由で ShiftList から使用）

import React, { useRef } from "react";
import { View, Text, Animated } from "react-native";
// format: Dateオブジェクトを指定フォーマットの文字列に変換
import { format } from "date-fns";
// ja: date-fnsの日本語ロケール。曜日を "月", "火" 等で表示するために使う
import { ja } from "date-fns/locale";
import { createShiftDetailsStyles } from "./ShiftDetails.styles";
import { ShiftDetailsProps } from "./ShiftDetails.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
// useTimeSegmentTypesContext: 業務区分タイプ（授業、事務など）のデータを取得するコンテキストフック
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";
// parseTimeString: 日付文字列と時間文字列からDateオブジェクトを生成するユーティリティ
import { parseTimeString } from "../calendar-utils/shift.utils";

/**
 * ShiftDetails コンポーネント
 *
 * シフト1件の詳細情報を、開閉アニメーション付きパネルで表示する。
 *
 * 構造:
 *   - ヘッダー: ニックネームと日付
 *   - 時間スロット一覧:
 *     - 授業がある場合: [スタッフ時間][授業1][スタッフ時間][授業2]...[スタッフ時間]
 *     - 授業がない場合: [スタッフ時間（全体）]
 *
 * Props:
 *   - shift:     シフトデータ
 *   - maxHeight: 展開時の最大高さ（デフォルト: 500px）
 *                `= 500` はデフォルト引数。呼び出し側が省略した場合に500が使われる
 *   - isOpen:    パネルが開いているかどうか
 */
export const ShiftDetails: React.FC<ShiftDetailsProps> = ({
  shift,
  maxHeight = 500,
  isOpen,
}) => {
  // --- Hooks ---

  const styles = useThemedStyles(createShiftDetailsStyles);

  // useTimeSegmentTypesContext: Contextからタイムセグメントのタイプ情報（名前、色、アイコン）を取得
  // typesMap は { typeId: { name, color, icon, ... } } というオブジェクト
  const { typesMap } = useTimeSegmentTypesContext();

  // --- Refs ---

  /**
   * heightAnim - アニメーション用の値
   *
   * useRef: コンポーネントの再レンダリングをまたいで値を保持するフック。
   * Animated.Value: アニメーション用の特殊な値。0からmaxHeightまで滑らかに変化する。
   * .current でref内の値にアクセスする。
   *
   * useRef で Animated.Value を保持する理由:
   *   - useState だと値が変わるたびに再レンダリングが発生する
   *   - useRef なら再レンダリングなしで値を保持できる
   *   - アニメーションは React のレンダリングとは別の仕組みで動くため、useRef が適切
   */
  const heightAnim = useRef(new Animated.Value(0)).current;

  // --- Effects ---

  /**
   * useEffect: isOpen が変わったときにアニメーションを開始する。
   *
   * Animated.timing: 指定した時間をかけて値を変化させるアニメーション
   *   - toValue: 目標値。isOpen が true なら maxHeight（開く）、false なら 0（閉じる）
   *   - duration: アニメーション時間（ミリ秒）。300ms = 0.3秒
   *   - useNativeDriver: false = JavaScriptスレッドでアニメーション実行
   *     ※ height のアニメーションは Native Driver 非対応なので false にする必要がある
   *
   * .start() でアニメーションを開始する。
   */
  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isOpen ? maxHeight : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, maxHeight]);

  // --- Render ---

  return (
    // Animated.View: アニメーション可能なViewコンポーネント
    // maxHeight に Animated.Value を渡すことで、値の変化に応じて高さが滑らかに変わる
    <Animated.View style={[styles.container, { maxHeight: heightAnim }]}>
      {/* ヘッダー: ニックネームと日付 */}
      <View style={styles.header}>
        <Text style={styles.nickname}>{shift.nickname}</Text>
        <Text style={styles.date}>
          {/* format() で "3月10日(火)" のような形式に変換。locale: ja で日本語曜日 */}
          {format(new Date(shift.date), "M月d日(E)", { locale: ja })}
        </Text>
      </View>

      {/* 時間スロット一覧 */}
      <View style={styles.timeSlots}>
        {/* 条件分岐: 授業（classes）があるかどうかで表示を切り替え */}
        {/* shift.classes?.length の ?. はオプショナルチェーン。classes が null/undefined でもエラーにならない */}
        {shift.classes?.length ? (
          // --- 授業がある場合 ---
          // <> はフラグメント（Fragment）。複数の要素をグループ化するが、DOMには何も追加しない
          <>
            {/* 最初のスタッフ時間: シフト開始 ~ 最初の授業開始 */}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>
              <Text style={styles.timeText}>
                {format(parseTimeString(shift.date, shift.startTime), "HH:mm")}
                {" ~ "}
                {format(
                  parseTimeString(shift.date, shift.classes[0]?.startTime || "09:00"),
                  "HH:mm"
                )}
              </Text>
            </View>

            {/* 授業時間とその間のスタッフ時間をループ表示 */}
            {shift.classes.map(
              (
                // 各授業の型定義（インライン型注釈）
                classTime: { startTime: string; endTime: string; typeId?: string; typeName?: string },
                index: number
              ) => {
                // 業務区分タイプの情報を取得
                // Object.values(typesMap): typesMap の全値を配列に変換
                // .find(): 条件に合う最初の要素を返す
                const defaultType = Object.values(typesMap).find((t) => t.name === "授業");
                // typeId があれば typesMap から直接取得、なければデフォルトの「授業」タイプ
                const segType = classTime.typeId ? typesMap[classTime.typeId] : defaultType;
                // 表示名: segType の name → classTime の typeName → "授業" の優先順で決定
                // || は短絡評価: 左が falsy なら右を返す
                const displayName = segType?.name || classTime.typeName || "授業";
                const displayIcon = segType?.icon || "";
                const displayColor = segType?.color;

                return (
                  // React.Fragment: key を指定できるフラグメント（<> では key を指定できない）
                  <React.Fragment key={index}>
                    {/* 授業時間スロット */}
                    <View style={[
                      styles.timeSlot,
                      styles.classTimeSlot,
                      // displayColor があれば背景色を設定。"18" は約9%の不透明度
                      displayColor ? { backgroundColor: displayColor + "18" } : undefined
                    ]}>
                      <Text style={[
                        styles.timeSlotLabel,
                        styles.classLabel,
                        displayColor ? { color: displayColor } : undefined
                      ]}>
                        {/* テンプレートリテラルでアイコン+名前を結合 */}
                        {displayIcon ? `${displayIcon} ${displayName}` : displayName}
                      </Text>
                      <Text style={[styles.timeText, styles.classTime]}>
                        {format(
                          parseTimeString(shift.date, classTime.startTime),
                          "HH:mm"
                        )}
                        {" ~ "}
                        {format(
                          parseTimeString(shift.date, classTime.endTime),
                          "HH:mm"
                        )}
                      </Text>
                    </View>

                    {/* 授業間のスタッフ時間（次の授業がある場合のみ表示） */}
                    {/* shift.classes?.[index + 1]: 次の授業が存在するかチェック */}
                    {shift.classes?.[index + 1] && (
                      <View style={styles.timeSlot}>
                        <Text style={styles.timeSlotLabel}>スタッフ</Text>
                        <Text style={styles.timeText}>
                          {format(
                            parseTimeString(shift.date, classTime.endTime),
                            "HH:mm"
                          )}
                          {" ~ "}
                          {format(
                            parseTimeString(
                              shift.date,
                              shift.classes[index + 1]?.startTime || "10:00"
                            ),
                            "HH:mm"
                          )}
                        </Text>
                      </View>
                    )}
                  </React.Fragment>
                );
              }
            )}

            {/* 最後のスタッフ時間: 最後の授業終了 ~ シフト終了 */}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>
              <Text style={styles.timeText}>
                {format(
                  parseTimeString(
                    shift.date,
                    // .at(-1): 配列の最後の要素を取得するメソッド。-1は末尾から1番目
                    shift.classes.at(-1)?.endTime || "22:00"
                  ),
                  "HH:mm"
                )}
                {" ~ "}
                {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
              </Text>
            </View>
          </>
        ) : (
          // --- 授業がない場合: シフト全体を1つのスタッフ時間として表示 ---
          <View style={styles.timeSlot}>
            <Text style={styles.timeSlotLabel}>スタッフ</Text>
            <Text style={styles.timeText}>
              {format(parseTimeString(shift.date, shift.startTime), "HH:mm")}
              {" ~ "}
              {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
