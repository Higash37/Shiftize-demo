import { StyleSheet } from "react-native";

export const ganttEditViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // Web環境でのスクロールバー非表示
    ...(typeof window !== "undefined" && {
      // @ts-ignore Web only styles
      overflow: "hidden",
    }),
  },
});

// Web環境専用のCSS（PWA対応）
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    /* ガントチャート用スクロールバー非表示（PWA安全対応） */
    .gantt-container::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    .gantt-container {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    /* 全てのスクロール可能要素でスクロールバーを非表示 */
    .gantt-container *, 
    .gantt-container *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    /* React Native WebのScrollView向け */
    .gantt-container .RNSVScrollView::-webkit-scrollbar,
    .gantt-container [data-focusable="true"]::-webkit-scrollbar {
      display: none !important;
    }
    
    /* ガントチャート内の全ての要素 */
    .gantt-container [style*="overflow"]::-webkit-scrollbar {
      display: none !important;
    }
    
    /* PWA環境での安全な表示 */
    @media (display-mode: standalone) {
      .gantt-container {
        /* セーフエリア確保 */
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
      }
    }
  `;
  document.head.appendChild(style);
}
