import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { escapeHtml } from "@/common/common-utils/validation/inputValidation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { colors } from "@/common/common-constants/ThemeConstants";

interface ShiftPrintModalProps {
  visible: boolean;
  onClose: () => void;
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string }>;
  selectedDate: Date;
}

interface UserShiftData {
  userId: string;
  nickname: string;
  shifts: Array<{
    date: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    extendedTasks?: boolean; // 授業途中あり/なしの情報
  }>;
}

export const ShiftPrintModal: React.FC<ShiftPrintModalProps> = ({
  visible,
  onClose,
  shifts,
  users,
  selectedDate,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [printFormat, setPrintFormat] = useState<
    "list" | "calendar" | "unified-calendar" | "all"
  >("all"); // 印刷形式の選択

  // 月の日付リストを取得
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // ユーザーごとのシフトデータを整理
  const getUserShiftData = (): UserShiftData[] => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    const monthlyShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shift.status !== "deleted" &&
        shift.status !== "rejected" &&
        shiftDate.getFullYear() === selectedYear &&
        shiftDate.getMonth() === selectedMonth
      );
    });

    const shiftsByUser = monthlyShifts.reduce((acc, shift) => {
      if (!acc[shift.userId]) {
        acc[shift.userId] = [];
      }
      acc[shift.userId]?.push(shift);
      return acc;
    }, {} as Record<string, ShiftItem[]>);

    const userFilter = (user: { uid: string }) =>
      (selectedUsers.length === 0 || selectedUsers.includes(user.uid)) &&
      shiftsByUser[user.uid];

    return users
      .filter(userFilter)
      .map((user) => {
        const userShifts = (shiftsByUser[user.uid] || [])
          .map((shift) => {
            const shiftDate = new Date(shift.date);
            return {
              date: format(shiftDate, "M月d日", { locale: ja }),
              dayOfWeek: format(shiftDate, "E", { locale: ja }),
              startTime: shift.startTime,
              endTime: shift.endTime,
              extendedTasks: Array.isArray(shift.extendedTasks)
                ? shift.extendedTasks.length > 0
                : false, // 配列の場合は要素があるかをboolean化
            };
          })
          .sort((a, b) => {
            const parseDate = (dateStr: string) => {
              const match = dateStr.match(/(\d+)月(\d+)日/);
              if (match) {
                const month = parseInt(match[1] || "0", 10);
                const day = parseInt(match[2] || "0", 10);
                return new Date(selectedYear, month - 1, day);
              }
              return new Date();
            };
            return parseDate(a.date).getTime() - parseDate(b.date).getTime();
          });

        return {
          userId: user.uid,
          nickname: user.nickname,
          shifts: userShifts,
        };
      })
      .filter((userData) => userData.shifts.length > 0);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    const usersWithShifts = users.filter((user) =>
      shifts.some((shift) => {
        const shiftDate = new Date(shift.date);
        return (
          shift.userId === user.uid &&
          shift.status !== "deleted" &&
          shift.status !== "rejected" &&
          shiftDate.getFullYear() === selectedYear &&
          shiftDate.getMonth() === selectedMonth
        );
      })
    );
    setSelectedUsers(usersWithShifts.map((user) => user.uid));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handlePrint = () => {
    if (Platform.OS === "web") {
      // WebではHTMLを生成してprint
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const htmlContent = generatePrintHTML();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleSavePDF = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("警告", "印刷対象のスタッフを選択してください");
      return;
    }

    try {
      const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });

      if (printFormat === "all") {
        // 全ての場合は3つのPDFを生成
        const listBlob = await generatePdfBlob("list");
        const calendarBlob = await generatePdfBlob("calendar");
        const unifiedCalendarBlob = await generatePdfBlob("unified-calendar");

        if (listBlob && calendarBlob && unifiedCalendarBlob) {
          // リスト形式のPDF
          const listLink = document.createElement("a");
          listLink.href = URL.createObjectURL(listBlob);
          listLink.download = `スタッフ勤務表_リスト形式_${monthYear}.pdf`;
          document.body.appendChild(listLink);
          listLink.click();
          document.body.removeChild(listLink);
          URL.revokeObjectURL(listLink.href);

          // カレンダー形式のPDF
          const calendarLink = document.createElement("a");
          calendarLink.href = URL.createObjectURL(calendarBlob);
          calendarLink.download = `スタッフ勤務表_カレンダー形式_${monthYear}.pdf`;
          document.body.appendChild(calendarLink);
          calendarLink.click();
          document.body.removeChild(calendarLink);
          URL.revokeObjectURL(calendarLink.href);

          // 統合カレンダー形式のPDF
          const unifiedCalendarLink = document.createElement("a");
          unifiedCalendarLink.href = URL.createObjectURL(unifiedCalendarBlob);
          unifiedCalendarLink.download = `スタッフ勤務表_統合カレンダー形式_${monthYear}.pdf`;
          document.body.appendChild(unifiedCalendarLink);
          unifiedCalendarLink.click();
          document.body.removeChild(unifiedCalendarLink);
          URL.revokeObjectURL(unifiedCalendarLink.href);

          Alert.alert(
            "成功",
            "PDFファイル（リスト形式・カレンダー形式・統合カレンダー形式）が保存されました"
          );
        }
      } else {
        // 単一形式の場合
        const blob = await generatePdfBlob(printFormat);
        if (blob) {
          const formatName =
            printFormat === "list"
              ? "リスト形式"
              : printFormat === "calendar"
              ? "カレンダー形式"
              : "統合カレンダー形式";
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `スタッフ勤務表_${formatName}_${monthYear}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          Alert.alert("成功", `PDFファイル（${formatName}）が保存されました`);
        }
      }
    } catch (error) {
      Alert.alert(
        "エラー",
        `PDFの保存に失敗しました: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const generatePdfBlob = async (
    forceFormat?: "list" | "calendar" | "unified-calendar"
  ): Promise<Blob | null> => {
    if (
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      Alert.alert("エラー", "PDF生成はWeb環境でのみ利用可能です");
      return null;
    }

    // PDF生成時に使用する形式を決定
    const pdfFormat =
      forceFormat || (printFormat === "all" ? "list" : printFormat);
    const htmlContent = generatePrintHTMLForPDF(pdfFormat);
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "210mm"; // A4 width
    tempDiv.style.backgroundColor = "white";
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    try {
      await document.fonts.ready;

      const content = tempDiv.querySelector<HTMLElement>(".printable-content");
      if (!content) return null;

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("portrait", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      return pdf.output("blob");
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("警告", "共有対象のスタッフを選択してください");
      return;
    }

    try {
      const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });

      if (printFormat === "all") {
        // 全ての場合は3つのPDFを生成
        const listBlob = await generatePdfBlob("list");
        const calendarBlob = await generatePdfBlob("calendar");
        const unifiedCalendarBlob = await generatePdfBlob("unified-calendar");

        if (listBlob && calendarBlob && unifiedCalendarBlob) {
          // リスト形式のファイル
          const listFile = new File(
            [listBlob],
            `スタッフ勤務表_リスト形式_${monthYear}.pdf`,
            {
              type: "application/pdf",
            }
          );

          // カレンダー形式のファイル
          const calendarFile = new File(
            [calendarBlob],
            `スタッフ勤務表_カレンダー形式_${monthYear}.pdf`,
            {
              type: "application/pdf",
            }
          );

          // 統合カレンダー形式のファイル
          const unifiedCalendarFile = new File(
            [unifiedCalendarBlob],
            `スタッフ勤務表_統合カレンダー形式_${monthYear}.pdf`,
            {
              type: "application/pdf",
            }
          );

          // 個別に共有
          if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [listFile] })
          ) {
            await navigator.share({
              title: `スタッフ勤務表 リスト形式 ${monthYear}`,
              text: `${monthYear}のスタッフ勤務表（リスト形式）です`,
              files: [listFile],
            });

            await navigator.share({
              title: `スタッフ勤務表 カレンダー形式 ${monthYear}`,
              text: `${monthYear}のスタッフ勤務表（カレンダー形式）です`,
              files: [calendarFile],
            });

            await navigator.share({
              title: `スタッフ勤務表 統合カレンダー形式 ${monthYear}`,
              text: `${monthYear}のスタッフ勤務表（統合カレンダー形式）です`,
              files: [unifiedCalendarFile],
            });
          } else {
            Alert.alert(
              "共有不可",
              "お使いのブラウザではファイルを共有できません。"
            );
          }
        }
      } else {
        // 単一形式の場合
        const blob = await generatePdfBlob(printFormat);
        if (blob) {
          const formatName =
            printFormat === "list"
              ? "リスト形式"
              : printFormat === "calendar"
              ? "カレンダー形式"
              : "統合カレンダー形式";
          const file = new File(
            [blob],
            `スタッフ勤務表_${formatName}_${monthYear}.pdf`,
            {
              type: "application/pdf",
            }
          );

          if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [file] })
          ) {
            await navigator.share({
              title: `スタッフ勤務表 ${formatName} ${monthYear}`,
              text: `${monthYear}のスタッフ勤務表（${formatName}）です`,
              files: [file],
            });
          } else {
            Alert.alert(
              "共有不可",
              "お使いのブラウザではファイルを共有できません。"
            );
          }
        }
      }
    } catch (error) {
      Alert.alert(
        "エラー",
        `PDFの共有に失敗しました: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };
  // PDF生成専用のHTML生成関数
  const generatePrintHTMLForPDF = (
    pdfFormat: "list" | "calendar" | "unified-calendar"
  ): string => {
    const userShiftData = getUserShiftData();
    const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });

    const bodyContent = userShiftData
      .map(
        (userData) => `
      <div class="shift-sheet">
        <div class="user-header">${escapeHtml(userData.nickname)}</div>
        <div class="shifts-container">
          <div class="shift-list">
            ${
              userData.shifts
                .map(
                  (shift) => `
              <div class="shift-item">
                <span class="shift-date">${shift.date} ${shift.dayOfWeek}</span>
                <span class="shift-time">${shift.startTime.substring(
                  0,
                  5
                )} - ${shift.endTime.substring(0, 5)}</span>
              </div>
            `
                )
                .join("") || '<div class="shift-item">シフトなし</div>'
            }
          </div>
          <div class="notes-section">
            <div class="notes-title">連絡</div>
            <div class="notes-area"></div>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    const calendarContent =
      pdfFormat === "list"
        ? ""
        : pdfFormat === "unified-calendar"
        ? generateUnifiedCalendarHTML()
        : generateCalendarHTML();
    const listContent =
      pdfFormat === "calendar" || pdfFormat === "unified-calendar"
        ? ""
        : `
      <div class="header">スタッフ勤務表 ${monthYear}版</div>
      <div class="grid-container">
        ${bodyContent}
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>スタッフ勤務表 ${monthYear}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body { 
            margin: 0;
            background-color: #fff;
            font-family: 'Noto Sans JP', sans-serif;
          }
          .printable-content {
            margin: 0;
          }
          
          /* 既存のシフト表スタイル */
          .header {
            background-color: #1e3a8a;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .shift-sheet {
            border: 2px solid #000;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
            overflow: hidden;
          }
          .user-header {
            background-color: #60a5fa;
            color: white;
            padding: 6px 8px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          }
          .shifts-container {
            display: flex;
            overflow: hidden;
          }
          .shift-list {
            flex: 1;
            padding: 6px;
            background-color: white;
          }
          .shift-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 0;
            border-bottom: 1px dotted #ccc;
            font-size: 10px;
          }
          .shift-item:last-child { border-bottom: none; }
          .shift-date { font-weight: bold; color: #333; }
          .shift-time { color: #555; font-weight: 500; }
          .notes-section {
            width: 60px;
            border-left: 2px solid #000;
            padding: 6px;
            background-color: #f8f9fa;
          }
          .notes-title {
            font-weight: bold;
            margin-bottom: 4px;
            color: #666;
            font-size: 10px;
            text-align: center;
          }
          .notes-area {
            border: 1px solid #ccc;
            background-color: white;
            height: 100px;
          }
          
          /* カレンダー形式のスタイル */
          .calendar-page {
            page-break-before: always;
          }
          .calendar-header {
            background-color: #1e3a8a;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .calendar-grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 8px;
            height: 250mm; /* A4の高さから余白を引いた固定値 */
            min-height: 250mm;
          }
          .calendar-container {
            border: 2px solid #000;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 80mm; /* 各カレンダーの固定高さ */
            min-height: 80mm;
          }
          .calendar-title {
            background-color: #60a5fa;
            color: white;
            padding: 4px;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
            flex-shrink: 0; /* タイトル部分は縮小しない */
          }
          .calendar-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            table-layout: fixed;
            flex: 1; /* 残りの空間を使用 */
            height: calc(100% - 30px); /* タイトル分を引いた高さ */
          }
          .calendar-table th {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            padding: 1px;
            text-align: center;
            font-weight: bold;
            font-size: 12px; /* 1.5倍程度に調整 */
            width: 14.28%;
            height: 8mm; /* ヘッダーの固定高さ */
          }
          .calendar-day {
            border: 1px solid #ccc;
            height: 10mm; /* セルの固定高さを大きく */
            width: 14.28%;
            vertical-align: top;
            padding: 1px;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          }
          .calendar-day.weekend {
            background-color: #ffffff;
          }
          .empty-day {
            border: 1px solid #ccc;
            height: 10mm; /* セルの固定高さを大きく */
            width: 14.28%;
            background-color: #ffffff;
            box-sizing: border-box;
          }
          .day-number {
            font-weight: bold;
            font-size: 10px; /* 1.5倍程度に調整 */
            margin-bottom: 1px;
            line-height: 1;
          }
          .shift-info {
            font-size: 9px; /* 1.45倍程度に調整（元5px→7px） */
            line-height: 1.1;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .shift-time {
            color: #333;
            font-weight: 500;
            line-height: 1.1;
            margin: 0;
            padding: 0;
            display: block;
            font-size: 9px; /* 1.45倍程度に調整（元5px→7px） */
          }
          .break-info {
            color: #666;
            font-size: 8px; /* 1.45倍程度に調整（元4px→6px） */
            margin-top: 1px;
            line-height: 1.1;
          }
          /* 統合カレンダー専用スタイル */
          .unified-calendar-page {
            page-break-before: always;
          }
          .unified-calendar-header {
            background-color: #1e3a8a;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .unified-calendar-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            table-layout: fixed;
          }
          .unified-calendar-table th {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            padding: 1px;
            text-align: center;
            font-weight: bold;
            font-size: 12px; /* 1.5倍程度に調整 */
            width: 14.28%;
          }
          .unified-calendar-day {
            border: 1px solid #ccc;
            height: 75px; /* 高さをさらに大きく（文字が切れないように） */
            width: 14.28%;
            vertical-align: top;
            padding: 3px; /* パディングを大きく */
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          }
          .unified-calendar-day.weekend {
            background-color: #f9f9f9;
          }
          .unified-empty-day {
            border: 1px solid #ccc;
            height: 75px; /* 高さをより大きく */
            width: 14.28%;
            background-color: #ffffff;
            box-sizing: border-box;
          }
          .unified-day-number {
            font-weight: bold;
            font-size: 16px; /* 日付番号をさらに大きく */
            margin-bottom: 2px;
            line-height: 1;
          }
          .unified-shifts-container {
            display: flex;
            flex-direction: column;
            height: calc(100% - 25px); /* 日付番号分のスペースを確保 */
            justify-content: flex-start;
          }
          .unified-shift-item {
            font-size: 11px; /* フォントサイズを11pxに */
            line-height: 1.2; /* 行間を少し狭く */
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 1px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            white-space: nowrap; /* 文字の折り返しを防ぐ */
          }
          .unified-shift-name {
            font-weight: bold;
            font-size: 11px; /* 名前のフォントサイズを11pxに */
            color: #333;
            flex-shrink: 1; /* 名前が長い場合は縮小可能に */
            margin-right: 3px;
            max-width: 60%; /* 名前の最大幅を制限 */
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .unified-shift-time {
            color: #666;
            font-size: 11px; /* 時間のフォントサイズを11pxに */
            flex-shrink: 0;
            min-width: 40%; /* 時間表示の最小幅を確保 */
            font-weight: 600; /* 時間も少し太く */
          }
        </style>
      </head>
      <body>
        <div class="printable-content">
          ${listContent}
          ${calendarContent}
        </div>
      </body>
      </html>`;
  };
  const generateCalendarHTML = (): string => {
    const userShiftData = getUserShiftData();
    const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    // 月の全日付を取得
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // カレンダーグリッドを生成（日曜日始まり）
    const firstDayOfWeek = monthStart.getDay(); // 日曜日を0とする
    const calendarDays = Array(firstDayOfWeek).fill(null).concat(monthDays);

    // 6週分確保するため、必要に応じて最後に空セルを追加
    const totalCells = Math.ceil(calendarDays.length / 7) * 7;
    while (calendarDays.length < totalCells) {
      calendarDays.push(null);
    }

    // 6人ずつグループに分ける
    const userGroups = [];
    for (let i = 0; i < userShiftData.length; i += 6) {
      userGroups.push(userShiftData.slice(i, i + 6));
    }

    return userGroups
      .map(
        (group, groupIndex) => `
      <div class="calendar-page" ${
        groupIndex > 0 ? 'style="page-break-before: always;"' : ""
      }>
        <div class="calendar-header">${monthYear}分カレンダー</div>
        <div class="calendar-grid-container">
          ${group
            .map((userData) => {
              // このユーザーのシフトをマッピング
              const userShiftsMap = userData.shifts.reduce((acc, shift) => {
                const dayMatch = shift.date.match(/(\d+)月(\d+)日/);
                if (dayMatch) {
                  const day = parseInt(dayMatch[2] || "0", 10);
                  acc[day] = shift;
                }
                return acc;
              }, {} as Record<number, any>);

              return `
              <div class="calendar-container">
                <div class="calendar-title">${userData.nickname}</div>
                <table class="calendar-table">
                  <thead>
                    <tr>
                      <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(() => {
                      let html = "";
                      const weeks: (Date | null)[][] = [];
                      let currentWeek: (Date | null)[] = [];

                      calendarDays.forEach((day, index) => {
                        if (index % 7 === 0 && currentWeek.length > 0) {
                          // 週が完成したら配列に追加し、新しい週を開始
                          while (currentWeek.length < 7) {
                            currentWeek.push(null);
                          }
                          weeks.push(currentWeek);
                          currentWeek = [];
                        }
                        currentWeek.push(day);
                      });
                      // 最後の週を処理
                      if (currentWeek.length > 0) {
                        while (currentWeek.length < 7) {
                          currentWeek.push(null);
                        }
                        weeks.push(currentWeek);
                      }

                      weeks.forEach((week) => {
                        html += "<tr>";
                        // 週の7日分すべてを処理
                        for (let i = 0; i < 7; i++) {
                          const day = week[i];
                          if (day === null) {
                            html += '<td class="empty-day"></td>';
                          } else {
                            const dayNumber = day?.getDate() || 0;
                            const shift = userShiftsMap[dayNumber];
                            const isWeekend =
                              day?.getDay() === 0 || day?.getDay() === 6;

                            html += `
                              <td class="calendar-day ${
                                isWeekend ? "weekend" : ""
                              }">
                                <div class="day-number">${dayNumber}</div>
                                ${
                                  shift
                                    ? `
                                  <div class="shift-info">
                                    <div class="shift-time">${shift.startTime.substring(
                                      0,
                                      5
                                    )}</div>
                                    <div class="shift-time">${shift.endTime.substring(
                                      0,
                                      5
                                    )}</div>
                                    <div class="break-info">${
                                      shift.extendedTasks
                                        ? "途中あり"
                                        : "途中なし"
                                    }</div>
                                  </div>
                                `
                                    : `<div class="shift-info">&nbsp;</div>` // 空のシフト情報でレイアウト統一
                                }
                              </td>
                            `;
                          }
                        }
                        html += "</tr>";
                      });

                      return html;
                    })()}
                  </tbody>
                </table>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `
      )
      .join("");
  };

  // 統合カレンダーHTML生成関数
  const generateUnifiedCalendarHTML = (): string => {
    const userShiftData = getUserShiftData();
    const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    // 月の全日付を取得
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // カレンダーグリッドを生成（日曜日始まり）
    const firstDayOfWeek = monthStart.getDay(); // 日曜日を0とする
    const calendarDays = Array(firstDayOfWeek).fill(null).concat(monthDays);

    // 6週分確保するため、必要に応じて最後に空セルを追加
    const totalCells = Math.ceil(calendarDays.length / 7) * 7;
    while (calendarDays.length < totalCells) {
      calendarDays.push(null);
    }

    // 全ユーザーのシフトを日付別に整理
    const shiftsByDate: Record<
      number,
      Array<{ startTime: string; endTime: string; nickname: string }>
    > = {};

    userShiftData.forEach((userData) => {
      userData.shifts.forEach((shift) => {
        const dayMatch = shift.date.match(/(\d+)月(\d+)日/);
        if (dayMatch) {
          const day = parseInt(dayMatch[2] || "0", 10);
          if (!shiftsByDate[day]) {
            shiftsByDate[day] = [];
          }
          shiftsByDate[day].push({
            startTime: shift.startTime.substring(0, 5),
            endTime: shift.endTime.substring(0, 5),
            nickname: userData.nickname,
          });
        }
      });
    });

    // 各日のシフトを時間順にソート
    Object.keys(shiftsByDate).forEach((day) => {
      shiftsByDate[parseInt(day)]?.sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    });

    return `
      <div class="unified-calendar-page">
        <div class="unified-calendar-header">${monthYear}分カレンダー</div>
        <table class="unified-calendar-table">
          <thead>
            <tr>
              <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              let html = "";
              const weeks: (Date | null)[][] = [];
              let currentWeek: (Date | null)[] = [];

              calendarDays.forEach((day, index) => {
                if (index % 7 === 0 && currentWeek.length > 0) {
                  while (currentWeek.length < 7) {
                    currentWeek.push(null);
                  }
                  weeks.push(currentWeek);
                  currentWeek = [];
                }
                currentWeek.push(day);
              });

              if (currentWeek.length > 0) {
                while (currentWeek.length < 7) {
                  currentWeek.push(null);
                }
                weeks.push(currentWeek);
              }

              weeks.forEach((week) => {
                html += "<tr>";
                for (let i = 0; i < 7; i++) {
                  const day = week[i];
                  if (day === null) {
                    html += '<td class="unified-empty-day"></td>';
                  } else {
                    const dayNumber = day?.getDate() || 0;
                    const dayShifts = shiftsByDate[dayNumber] || [];
                    const isWeekend = day?.getDay() === 0 || day?.getDay() === 6;

                    html += `
                      <td class="unified-calendar-day ${
                        isWeekend ? "weekend" : ""
                      }">
                        <div class="unified-day-number">${dayNumber}</div>
                        <div class="unified-shifts-container">
                          ${dayShifts
                            .slice(0, 5)
                            .map(
                              (shift) => `
                            <div class="unified-shift-item">
                              <span class="unified-shift-name">${shift.nickname}</span>
                              <span class="unified-shift-time">${shift.startTime}～${shift.endTime}</span>
                            </div>
                          `
                            )
                            .join("")}
                          ${Array(5 - Math.min(dayShifts.length, 5))
                            .fill(0)
                            .map(
                              () => `
                            <div class="unified-shift-item">&nbsp;</div>
                          `
                            )
                            .join("")}
                        </div>
                      </td>
                    `;
                  }
                }
                html += "</tr>";
              });

              return html;
            })()}
          </tbody>
        </table>
        
        <!-- 翌月カレンダー -->
        <div class="next-month-calendar">
          <div class="next-month-header">${format(
            addMonths(selectedDate, 1),
            "yyyy年M月",
            { locale: ja }
          )}分カレンダー</div>
          <table class="unified-calendar-table">
            <thead>
              <tr>
                <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                // 翌月のカレンダー生成
                const nextMonth = addMonths(selectedDate, 1);
                const nextMonthStart = startOfMonth(nextMonth);
                const nextMonthEnd = endOfMonth(nextMonth);
                const nextMonthDays = eachDayOfInterval({
                  start: nextMonthStart,
                  end: nextMonthEnd,
                });

                const firstDayOfWeek = nextMonthStart.getDay();
                const nextCalendarDays = Array(firstDayOfWeek)
                  .fill(null)
                  .concat(nextMonthDays);

                const totalCells = Math.ceil(nextCalendarDays.length / 7) * 7;
                while (nextCalendarDays.length < totalCells) {
                  nextCalendarDays.push(null);
                }

                // 翌月のシフトデータ取得
                const nextMonthShifts = shifts.filter((shift) => {
                  const shiftDate = new Date(shift.date);
                  return (
                    shift.status !== "deleted" &&
                    shift.status !== "rejected" &&
                    shiftDate.getFullYear() === nextMonth.getFullYear() &&
                    shiftDate.getMonth() === nextMonth.getMonth()
                  );
                });

                const nextShiftsByDate: Record<
                  number,
                  Array<{
                    startTime: string;
                    endTime: string;
                    nickname: string;
                  }>
                > = {};

                // 選択されたユーザーのシフトのみを対象
                const selectedUserNicknames = users
                  .filter((user) => selectedUsers.includes(user.uid))
                  .reduce((acc, user) => {
                    acc[user.uid] = user.nickname;
                    return acc;
                  }, {} as Record<string, string>);

                nextMonthShifts.forEach((shift) => {
                  if (selectedUserNicknames[shift.userId]) {
                    const shiftDate = new Date(shift.date);
                    const day = shiftDate.getDate();
                    if (!nextShiftsByDate[day]) {
                      nextShiftsByDate[day] = [];
                    }
                    nextShiftsByDate[day].push({
                      startTime: shift.startTime.substring(0, 5),
                      endTime: shift.endTime.substring(0, 5),
                      nickname: selectedUserNicknames[shift.userId] ?? "不明",
                    });
                  }
                });

                // 各日のシフトを時間順にソート
                Object.keys(nextShiftsByDate).forEach((day) => {
                  nextShiftsByDate[parseInt(day)]?.sort((a, b) =>
                    a.startTime.localeCompare(b.startTime)
                  );
                });

                let html = "";
                const weeks: (Date | null)[][] = [];
                let currentWeek: (Date | null)[] = [];

                nextCalendarDays.forEach((day, index) => {
                  if (index % 7 === 0 && currentWeek.length > 0) {
                    while (currentWeek.length < 7) {
                      currentWeek.push(null);
                    }
                    weeks.push(currentWeek);
                    currentWeek = [];
                  }
                  currentWeek.push(day);
                });

                if (currentWeek.length > 0) {
                  while (currentWeek.length < 7) {
                    currentWeek.push(null);
                  }
                  weeks.push(currentWeek);
                }

                weeks.forEach((week) => {
                  html += "<tr>";
                  for (let i = 0; i < 7; i++) {
                    const day = week[i];
                    if (day === null) {
                      html += '<td class="unified-empty-day"></td>';
                    } else {
                      const dayNumber = day?.getDate() || 0;
                      const dayShifts = nextShiftsByDate[dayNumber] || [];
                      const isWeekend =
                        day?.getDay() === 0 || day?.getDay() === 6;

                      html += `
                        <td class="unified-calendar-day ${
                          isWeekend ? "weekend" : ""
                        }">
                          <div class="unified-day-number">${dayNumber}</div>
                          <div class="unified-shifts-container">
                            ${dayShifts
                              .slice(0, 5)
                              .map(
                                (shift) => `
                              <div class="unified-shift-item">
                                <span class="unified-shift-name">${shift.nickname}</span>
                                <span class="unified-shift-time">${shift.startTime}～${shift.endTime}</span>
                              </div>
                            `
                              )
                              .join("")}
                            ${Array(5 - Math.min(dayShifts.length, 5))
                              .fill(0)
                              .map(
                                () => `
                              <div class="unified-shift-item">&nbsp;</div>
                            `
                              )
                              .join("")}
                          </div>
                        </td>
                      `;
                    }
                  }
                  html += "</tr>";
                });

                return html;
              })()}
            </tbody>
          </table>
        </div>
      </div>
      <style>
        .next-month-calendar {
          margin-top: 15px;
        }
        .next-month-header {
          background-color: #1e3a8a;
          color: white;
          padding: 6px 8px;
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .unified-shift-item {
          font-size: 11px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 1px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          white-space: nowrap;
        }
        .unified-shift-name {
          font-weight: bold;
          color: #333;
          font-size: 11px;
          flex-shrink: 1;
          margin-right: 3px;
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .unified-shift-time {
          color: #666;
          font-size: 11px;
          flex-shrink: 0;
          min-width: 40%;
          font-weight: 600;
        }
      </style>
    `;
  };

  const generatePrintHTML = (): string => {
    const userShiftData = getUserShiftData();
    const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });

    const bodyContent = userShiftData
      .map(
        (userData) => `
      <div class="shift-sheet">
        <div class="user-header">${escapeHtml(userData.nickname)}</div>
        <div class="shifts-container">
          <div class="shift-list">
            ${
              userData.shifts
                .map(
                  (shift) => `
              <div class="shift-item">
                <span class="shift-date">${shift.date} ${shift.dayOfWeek}</span>
                <span class="shift-time">${shift.startTime.substring(
                  0,
                  5
                )} - ${shift.endTime.substring(0, 5)}</span>
              </div>
            `
                )
                .join("") || '<div class="shift-item">シフトなし</div>'
            }
          </div>
          <div class="notes-section">
            <div class="notes-title">連絡</div>
            <div class="notes-area"></div>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    const calendarContent =
      printFormat === "list"
        ? ""
        : printFormat === "unified-calendar"
        ? generateUnifiedCalendarHTML()
        : printFormat === "all"
        ? generateCalendarHTML() + generateUnifiedCalendarHTML()
        : generateCalendarHTML();
    const listContent =
      printFormat === "calendar" || printFormat === "unified-calendar"
        ? ""
        : `
      <div class="header">スタッフ勤務表 ${monthYear}版</div>
      <div class="grid-container">
        ${bodyContent}
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>スタッフ勤務表 ${monthYear}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
          @page {
            size: A4 portrait;
            margin: 8mm; /* マージンを少し小さく */
          }
          body { 
            margin: 0;
            background-color: #fff;
            font-family: 'Noto Sans JP', sans-serif;
          }
          .printable-content {
            margin: 0;
          }
          
          /* 既存のシフト表スタイル */
          .header {
            background-color: #1e3a8a;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .shift-sheet {
            border: 2px solid #000;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
            overflow: hidden;
          }
          .user-header {
            background-color: #60a5fa;
            color: white;
            padding: 6px 8px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          }
          .shifts-container {
            display: flex;
            overflow: hidden;
          }
          .shift-list {
            flex: 1;
            padding: 6px;
            background-color: white;
          }
          .shift-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 0;
            border-bottom: 1px dotted #ccc;
            font-size: 10px;
          }
          .shift-item:last-child { border-bottom: none; }
          .shift-date { font-weight: bold; color: #333; }
          .shift-time { color: #555; font-weight: 500; }
          .notes-section {
            width: 60px;
            border-left: 2px solid #000;
            padding: 6px;
            background-color: #f8f9fa;
          }
          .notes-title {
            font-weight: bold;
            margin-bottom: 4px;
            color: #666;
            font-size: 10px;
            text-align: center;
          }
          .notes-area {
            border: 1px solid #ccc;
            background-color: white;
            height: 100px;
          }
          
          /* カレンダー形式のスタイル */
          .calendar-page {
            page-break-before: always;
          }
          .calendar-header {
            background-color: #1e3a8a;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .calendar-grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 8px;
            height: calc(100vh - 60px); /* ヘッダー分を引いた高さ */
          }
          .calendar-container {
            border: 2px solid #000;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .calendar-title {
            background-color: #60a5fa;
            color: white;
            padding: 4px; /* パディングを少し大きく */
            text-align: center;
            font-weight: bold;
            font-size: 11px; /* タイトルサイズを少し大きく */
          }
          .calendar-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px; /* フォントサイズを大きく */
            table-layout: fixed;
          }
          .calendar-table th {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            padding: 1px;
            text-align: center;
            font-weight: bold;
            font-size: 12px; /* 1.5倍程度に調整 */
            width: 14.28%;
          }
          .calendar-day {
            border: 1px solid #ccc;
            height: 42px; /* 高さをさらに大きく */
            width: 14.28%;
            vertical-align: top;
            padding: 2px; /* パディングも少し大きく */
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          }
          .calendar-day.weekend {
            background-color: #f9f9f9;
          }
          .empty-day {
            border: 1px solid #ccc;
            height: 42px; /* 高さをさらに大きく */
            width: 14.28%;
            background-color: #ffffff;
            box-sizing: border-box;
          }
          .day-number {
            font-weight: bold;
            font-size: 14px; /* 1.5倍程度に調整 */
            margin-bottom: 1px;
            line-height: 1;
          }
          .shift-info {
            font-size: 10px; /* 1.45倍程度に調整（元7px→10px） */
            line-height: 1.2; /* 行間を少し広く */
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .shift-time {
            color: #333;
            font-weight: 500;
            line-height: 1.2;
            margin: 0;
            padding: 0;
            display: block; /* ブロック要素にして改行 */
            font-size: 10px; /* 1.45倍程度に調整（元7px→10px） */
          }
          .break-info {
            color: #666;
            font-size: 9px; /* 1.45倍程度に調整（元6px→9px） */
            margin-top: 1px;
            line-height: 1.2;
          }
          /* 統合カレンダー専用スタイル */
          .unified-calendar-page {
            page-break-before: always;
          }
          .unified-calendar-header {
            background-color: #1e3a8a;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .unified-calendar-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            table-layout: fixed;
          }
          .unified-calendar-table th {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            padding: 1px;
            text-align: center;
            font-weight: bold;
            font-size: 12px; /* 1.5倍程度に調整 */
            width: 14.28%;
          }
          .unified-calendar-day {
            border: 1px solid #ccc;
            height: 75px; /* 高さをさらに大きく（文字が切れないように） */
            width: 14.28%;
            vertical-align: top;
            padding: 3px; /* パディングを大きく */
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          }
          .unified-calendar-day.weekend {
            background-color: #f9f9f9;
          }
          .unified-empty-day {
            border: 1px solid #ccc;
            height: 75px; /* 高さをより大きく */
            width: 14.28%;
            background-color: #ffffff;
            box-sizing: border-box;
          }
          .unified-day-number {
            font-weight: bold;
            font-size: 16px; /* 日付番号をさらに大きく */
            margin-bottom: 2px;
            line-height: 1;
          }
          .unified-shifts-container {
            display: flex;
            flex-direction: column;
            height: calc(100% - 25px); /* 日付番号分のスペースを確保 */
            justify-content: flex-start;
          }
          .unified-shift-item {
            font-size: 11px; /* フォントサイズを11pxに */
            line-height: 1.2; /* 行間を少し狭く */
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 1px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            white-space: nowrap; /* 文字の折り返しを防ぐ */
          }
          .unified-shift-name {
            font-weight: bold;
            font-size: 11px; /* 名前のフォントサイズを11pxに */
            color: #333;
            flex-shrink: 1; /* 名前が長い場合は縮小可能に */
            margin-right: 3px;
            max-width: 60%; /* 名前の最大幅を制限 */
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .unified-shift-time {
            color: #666;
            font-size: 13px; /* 時間のフォントサイズをさらに大きく */
            flex-shrink: 0;
            min-width: 40%; /* 時間表示の最小幅を確保 */
            font-weight: 600; /* 時間も少し太く */
          }
        </style>
      </head>
      <body>
        <div class="printable-content">
          ${listContent}
          ${calendarContent}
        </div>
      </body>
      </html>`;
  };

  const usersWithShifts = users.filter((user) => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    return shifts.some((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shift.userId === user.uid &&
        shift.status !== "deleted" &&
        shift.status !== "rejected" &&
        shiftDate.getFullYear() === selectedYear &&
        shiftDate.getMonth() === selectedMonth
      );
    });
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>
            シフト表印刷 - {format(selectedDate, "yyyy年M月", { locale: ja })}
          </Text>
          <View style={styles.headerButtons}>
            {selectedUsers.length > 0 && (
              <>
                <TouchableOpacity
                  onPress={() => setShowPreview(!showPreview)}
                  style={[
                    styles.previewButton,
                    showPreview && styles.previewButtonActive,
                  ]}
                >
                  <Ionicons
                    name={showPreview ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={showPreview ? "#007AFF" : "#666"}
                  />
                  <Text
                    style={[
                      styles.previewButtonText,
                      showPreview && styles.previewButtonTextActive,
                    ]}
                  >
                    {showPreview ? "プレビュー閉じる" : "プレビュー"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleSavePDF();
                  }}
                  style={styles.saveButton}
                >
                  <Ionicons name="download-outline" size={18} color="white" />
                  <Text style={styles.saveButtonText}>PDF保存</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.shareButton}
                >
                  <Ionicons name="share-outline" size={18} color="white" />
                  <Text style={styles.shareButtonText}>共有</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
              <Ionicons name="print-outline" size={20} color="white" />
              <Text style={styles.printButtonText}>印刷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!showPreview && (
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionTitle}>印刷対象スタッフを選択</Text>
            <View style={styles.selectionButtons}>
              <TouchableOpacity
                onPress={selectAllUsers}
                style={styles.selectButton}
              >
                <Text style={styles.selectButtonText}>全選択</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearSelection}
                style={styles.selectButton}
              >
                <Text style={styles.selectButtonText}>クリア</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 印刷形式選択 */}
        {selectedUsers.length > 0 && !showPreview && (
          <View style={styles.formatSelectionHeader}>
            <Text style={styles.formatSelectionTitle}>印刷形式を選択</Text>
            <View style={styles.formatButtons}>
              <TouchableOpacity
                onPress={() => setPrintFormat("list")}
                style={[
                  styles.formatButton,
                  printFormat === "list" && styles.formatButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.formatButtonText,
                    printFormat === "list" && styles.formatButtonTextActive,
                  ]}
                >
                  リスト形式のみ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrintFormat("calendar")}
                style={[
                  styles.formatButton,
                  printFormat === "calendar" && styles.formatButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.formatButtonText,
                    printFormat === "calendar" && styles.formatButtonTextActive,
                  ]}
                >
                  カレンダー形式のみ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrintFormat("unified-calendar")}
                style={[
                  styles.formatButton,
                  printFormat === "unified-calendar" &&
                    styles.formatButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.formatButtonText,
                    printFormat === "unified-calendar" &&
                      styles.formatButtonTextActive,
                  ]}
                >
                  統合カレンダー
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrintFormat("all")}
                style={[
                  styles.formatButton,
                  printFormat === "all" && styles.formatButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.formatButtonText,
                    printFormat === "all" && styles.formatButtonTextActive,
                  ]}
                >
                  全て
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.mainContent}>
          {!showPreview && (
            <ScrollView style={styles.userList}>
              {usersWithShifts.map((user) => {
                const selectedYear = selectedDate.getFullYear();
                const selectedMonth = selectedDate.getMonth();

                const userShifts = shifts.filter((shift) => {
                  const shiftDate = new Date(shift.date);
                  return (
                    shift.userId === user.uid &&
                    shift.status !== "deleted" &&
                    shift.status !== "rejected" &&
                    shiftDate.getFullYear() === selectedYear &&
                    shiftDate.getMonth() === selectedMonth
                  );
                });
                const isSelected = selectedUsers.includes(user.uid);

                return (
                  <TouchableOpacity
                    key={user.uid}
                    style={[
                      styles.userItem,
                      isSelected && styles.userItemSelected,
                    ]}
                    onPress={() => toggleUserSelection(user.uid)}
                  >
                    <View style={styles.userInfo}>
                      <Text
                        style={[
                          styles.userName,
                          isSelected && styles.userNameSelected,
                        ]}
                      >
                        {user.nickname}
                      </Text>
                      <Text style={styles.shiftCount}>
                        {userShifts.length}件のシフト
                      </Text>
                    </View>
                    <View style={styles.checkbox}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#007AFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* 詳細プレビュー */}
          {showPreview && selectedUsers.length > 0 && (
            <ScrollView style={styles.fullPreviewContainer}>
              {(() => {
                const userShiftData = getUserShiftData();
                // 縦2列に配置 - 左列と右列に分ける
                const leftColumn: UserShiftData[] = [];
                const rightColumn: UserShiftData[] = [];

                userShiftData.forEach((user, index) => {
                  if (index % 2 === 0) {
                    leftColumn.push(user);
                  } else {
                    rightColumn.push(user);
                  }
                });

                return (
                  <View style={styles.previewPageContainer}>
                    <Text style={styles.previewPageTitle}>
                      スタッフ勤務表{" "}
                      {format(selectedDate, "yyyy年M月", { locale: ja })}版
                    </Text>
                    <View style={styles.previewColumnsContainer}>
                      <View style={styles.previewColumn}>
                        {leftColumn.map((userData) => (
                          <View
                            key={userData.userId}
                            style={styles.previewShiftSheet}
                          >
                            <View style={styles.previewUserHeader}>
                              <Text style={styles.previewUserHeaderText}>
                                {userData.nickname}
                              </Text>
                            </View>
                            <View style={styles.previewShiftsContainer}>
                              <View style={styles.previewShiftList}>
                                {userData.shifts.map((shift, index) => (
                                  <View
                                    key={index}
                                    style={styles.previewShiftItem}
                                  >
                                    <Text style={styles.previewShiftDate}>
                                      {shift.date} {shift.dayOfWeek}
                                    </Text>
                                    <Text style={styles.previewShiftTime}>
                                      {shift.startTime.substring(0, 5)}{" "}
                                      {shift.endTime.substring(0, 5)}
                                    </Text>
                                  </View>
                                ))}
                                {userData.shifts.length === 0 && (
                                  <Text style={styles.previewNoShifts}>
                                    シフトなし
                                  </Text>
                                )}
                              </View>
                              <View style={styles.previewNotesSection}>
                                <Text style={styles.previewNotesTitle}>
                                  連絡
                                </Text>
                                <View style={styles.previewNotesArea} />
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                      <View style={styles.previewColumn}>
                        {rightColumn.map((userData) => (
                          <View
                            key={userData.userId}
                            style={styles.previewShiftSheet}
                          >
                            <View style={styles.previewUserHeader}>
                              <Text style={styles.previewUserHeaderText}>
                                {userData.nickname}
                              </Text>
                            </View>
                            <View style={styles.previewShiftsContainer}>
                              <View style={styles.previewShiftList}>
                                {userData.shifts.map((shift, index) => (
                                  <View
                                    key={index}
                                    style={styles.previewShiftItem}
                                  >
                                    <Text style={styles.previewShiftDate}>
                                      {shift.date} {shift.dayOfWeek}
                                    </Text>
                                    <Text style={styles.previewShiftTime}>
                                      {shift.startTime.substring(0, 5)}{" "}
                                      {shift.endTime.substring(0, 5)}
                                    </Text>
                                  </View>
                                ))}
                                {userData.shifts.length === 0 && (
                                  <Text style={styles.previewNoShifts}>
                                    シフトなし
                                  </Text>
                                )}
                              </View>
                              <View style={styles.previewNotesSection}>
                                <Text style={styles.previewNotesTitle}>
                                  連絡
                                </Text>
                                <View style={styles.previewNotesArea} />
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })()}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewButtonActive: {
    backgroundColor: colors.selected,
  },
  previewButtonText: {
    color: colors.text.secondary,
    fontWeight: "500",
    marginLeft: 4,
    fontSize: 12,
  },
  previewButtonTextActive: {
    color: colors.primary,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 4,
    fontSize: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6f42c1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shareButtonText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 4,
    fontSize: 12,
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  printButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 4,
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  selectionButtons: {
    flexDirection: "row",
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginLeft: 8,
  },
  selectButtonText: {
    color: colors.text.secondary,
    fontWeight: "500",
  },
  mainContent: {
    flex: 1,
    alignSelf: "center",
    width: Platform.OS === "web" ? "60%" : "100%",
    maxWidth: 800,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  userItemSelected: {
    backgroundColor: colors.selected,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  userNameSelected: {
    color: colors.primary,
  },
  shiftCount: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  previewList: {
    maxHeight: 120,
  },
  previewUserCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    marginBottom: 4,
  },
  previewUserName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  previewShiftCount: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  fullPreviewContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
  },
  previewPageContainer: {
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  previewPageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: 8,
    borderRadius: 4,
  },
  previewColumnsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  previewColumn: {
    flex: 1,
    gap: 8,
  },
  previewShiftSheet: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 4,
    overflow: "hidden",
    minHeight: 150,
  },
  previewUserHeader: {
    backgroundColor: "#60a5fa",
    padding: 6,
  },
  previewUserHeaderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  previewShiftsContainer: {
    flexDirection: "row",
    minHeight: 120,
  },
  previewShiftList: {
    flex: 1,
    padding: 6,
  },
  previewShiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  previewShiftDate: {
    fontWeight: "bold",
    color: colors.text.primary,
    fontSize: 10,
  },
  previewShiftTime: {
    color: colors.text.secondary,
    fontSize: 10,
  },
  previewNoShifts: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 10,
  },
  previewNotesSection: {
    width: 60,
    borderLeftWidth: 2,
    borderLeftColor: "#000",
    padding: 6,
    backgroundColor: "#f8f9fa",
  },
  previewNotesTitle: {
    fontWeight: "bold",
    color: colors.text.secondary,
    fontSize: 10,
    textAlign: "center",
    marginBottom: 4,
  },
  previewNotesArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    minHeight: 60,
  },
  formatSelectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  formatSelectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  formatButtons: {
    flexDirection: "row",
    gap: 8,
  },
  formatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  formatButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formatButtonText: {
    color: colors.text.secondary,
    fontWeight: "500",
    fontSize: 12,
  },
  formatButtonTextActive: {
    color: "white",
  },
});
