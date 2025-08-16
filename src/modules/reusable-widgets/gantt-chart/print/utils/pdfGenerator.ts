import { Platform, Alert } from "react-native";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PrintFormat } from "../components/PrintFormatSelector";

export const generatePdfBlob = async (
  htmlContent: string,
  format: PrintFormat
): Promise<Blob | null> => {
  if (
    Platform.OS !== "web" ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    Alert.alert("エラー", "PDF生成はWeb環境でのみ利用可能です");
    return null;
  }

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

export const downloadPdf = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const sharePdf = async (
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<boolean> => {
  const file = new File([blob], filename, { type: "application/pdf" });

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    } catch (error) {
      console.error("共有エラー:", error);
      return false;
    }
  } else {
    Alert.alert(
      "共有不可",
      "お使いのブラウザではファイルを共有できません。"
    );
    return false;
  }
};