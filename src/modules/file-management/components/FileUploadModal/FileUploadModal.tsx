import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { colors } from "@/common/common-constants/ThemeConstants";
import { FileUploadProgress } from "@/common/common-models/ModelIndex";
import { StorageService } from "@/services/file/storageService";
import { FileService } from "@/services/file/fileService";
import { styles } from "./FileUploadModal.styles";

interface FileUploadModalProps {
  visible: boolean;
  folderId: string;
  storeId: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface UploadingFile {
  file: File;
  progress: FileUploadProgress;
}

export function FileUploadModal({
  visible,
  folderId,
  storeId,
  onClose,
  onUploadComplete,
}: FileUploadModalProps) {
  // デバッグ: propsの受け取り確認
  React.useEffect(() => {
    if (visible) {
      console.log("=== FileUploadModal props 確認 ===");
      console.log("受け取ったfolderId:", folderId, "型:", typeof folderId);
      console.log("受け取ったstoreId:", storeId);
    }
  }, [visible, folderId, storeId]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // デバッグログ: propsで受け取った値を確認
  React.useEffect(() => {
    if (visible) {
      console.log("=== FileUploadModal props 確認 ===");
      console.log("受け取ったfolderId:", folderId, "型:", typeof folderId);
      console.log("受け取ったstoreId:", storeId);
    }
  }, [visible, folderId, storeId]);

  // ファイル選択
  const selectFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map((asset) => {
          // Web環境では File オブジェクトを作成
          if (Platform.OS === "web") {
            return new File([asset.file as any], asset.name, {
              type: asset.mimeType || "application/octet-stream",
            });
          }

          // モバイル環境では fetch を使用してファイルデータを取得
          return fetch(asset.uri)
            .then((response) => response.blob())
            .then(
              (blob) =>
                new File([blob], asset.name, {
                  type: asset.mimeType || "application/octet-stream",
                })
            );
        });

        const resolvedFiles = await Promise.all(files);

        console.log("=== selectFiles内でのアップロード開始 ===");
        console.log(
          "selectFiles内のfolderId:",
          folderId,
          "型:",
          typeof folderId
        );
        console.log("selectFiles内のstoreId:", storeId);

        startUpload(resolvedFiles);
      }
    } catch (error) {
      console.error("ファイル選択エラー:", error);
      Alert.alert("エラー", "ファイルの選択に失敗しました。");
    }
  }, [folderId, storeId]);

  // アップロード開始
  const startUpload = useCallback(
    async (files: File[]) => {
      console.log("=== startUpload開始 ===");
      console.log("startUpload内のfolderId:", folderId, "型:", typeof folderId);

      setIsUploading(true);
      const initialUploading: UploadingFile[] = files.map((file) => ({
        file,
        progress: {
          fileId: file.name,
          fileName: file.name,
          progress: 0,
          status: "uploading",
        },
      }));

      setUploadingFiles(initialUploading);

      try {
        console.log("ファイルアップロード開始:", {
          fileCount: files.length,
          folderId,
          storeId,
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        });

        // ファイル検証
        const validationErrors: string[] = [];
        for (const file of files) {
          const validation = StorageService.validateFile(file);
          if (!validation.isValid) {
            validationErrors.push(`${file.name}: ${validation.error}`);
          }
        }

        if (validationErrors.length > 0) {
          console.error("ファイル検証エラー:", validationErrors);
          Alert.alert("ファイル検証エラー", validationErrors.join("\n"));
          setIsUploading(false);
          setUploadingFiles([]);
          return;
        }

        // 複数ファイルアップロード
        console.log("StorageServiceを使用してアップロード開始");
        console.log("uploadMultipleFilesに渡すfolderId:", folderId);
        console.log("uploadMultipleFilesに渡すstoreId:", storeId);
        console.log("folderIdの型とlength:", typeof folderId, folderId.length);
        const results = await StorageService.uploadMultipleFiles(
          files,
          folderId,
          storeId,
          (progress) => {
            console.log("アップロード進捗:", progress);
            setUploadingFiles((prev) =>
              prev.map((item) =>
                item.progress.fileId === progress.fileId
                  ? { ...item, progress }
                  : item
              )
            );
          }
        );

        // 結果の処理
        console.log("アップロード結果:", results);
        const successCount = results.length;

        if (successCount > 0) {
          // Firestoreにファイル情報を保存
          for (const result of results) {
            try {
              console.log("=== ファイル保存デバッグ ===");
              console.log(
                "受信したfolderId:",
                folderId,
                "型:",
                typeof folderId
              );
              console.log("result.folderId:", result.folderId);
              console.log("最終的に保存されるfolderId:", result.folderId);
              console.log("ファイル名:", result.originalName);

              await FileService.createFile({
                name: result.originalName,
                originalName: result.originalName,
                type: result.type,
                mimeType: result.mimeType,
                size: result.size,
                folderId: result.folderId, // StorageServiceから返されたfolderIdを使用
                storeId: storeId,
                storageUrl: result.storageUrl,
                downloadUrl: result.downloadUrl,
                metadata: {
                  description: "",
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: storeId, // TODO: 実際のユーザーIDを使用
                isDeleted: false,
                downloadCount: 0,
              });
            } catch (error) {
              console.error("Firestoreへの保存エラー:", error);
            }
          }

          Alert.alert(
            "アップロード完了",
            `${successCount}個のファイルがアップロードされました。`
          );
          onUploadComplete();
        } else {
          Alert.alert("エラー", "ファイルのアップロードに失敗しました。");
        }
      } catch (error) {
        console.error("アップロードエラー:", error);
        Alert.alert("エラー", "ファイルのアップロードに失敗しました。");
      } finally {
        setIsUploading(false);
        setUploadingFiles([]);
        onClose();
      }
    },
    [folderId, storeId, onUploadComplete, onClose]
  );

  // プログレスバーのレンダリング
  const renderProgressBar = (progress: number) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );

  // アップロード中ファイルのレンダリング
  const renderUploadingFile = ({ file, progress }: UploadingFile) => (
    <View key={file.name} style={styles.uploadingFileContainer}>
      <View style={styles.fileInfo}>
        <MaterialIcons
          name="insert-drive-file"
          size={24}
          color={colors.text.secondary}
        />
        <View style={styles.fileDetails}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.fileSize}>
            {StorageService.formatFileSize(file.size)}
          </Text>
        </View>
      </View>

      {progress.status === "uploading" && renderProgressBar(progress.progress)}
      {progress.status === "completed" && (
        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
      )}
      {progress.status === "error" && (
        <MaterialIcons name="error" size={24} color="#F44336" />
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ファイルアップロード</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {!isUploading && uploadingFiles.length === 0 && (
            <View style={styles.uploadArea}>
              <MaterialIcons
                name="cloud-upload"
                size={64}
                color={colors.text.secondary}
              />
              <Text style={styles.uploadTitle}>ファイルを選択してください</Text>
              <Text style={styles.uploadSubtitle}>
                PDF、画像、動画、音声、ドキュメントファイルに対応しています
              </Text>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={selectFiles}
              >
                <MaterialIcons name="attach-file" size={20} color="white" />
                <Text style={styles.selectButtonText}>ファイルを選択</Text>
              </TouchableOpacity>

              <View style={styles.supportedFormats}>
                <Text style={styles.supportedFormatsTitle}>対応形式:</Text>
                <Text style={styles.supportedFormatsList}>
                  PDF, JPEG, PNG, GIF, WebP, Word, Excel, PowerPoint, テキスト,
                  MP4, MP3, WAV など
                </Text>
              </View>
            </View>
          )}

          {uploadingFiles.length > 0 && (
            <View style={styles.uploadingContainer}>
              <Text style={styles.uploadingTitle}>
                アップロード中... ({uploadingFiles.length}個のファイル)
              </Text>
              {uploadingFiles.map(renderUploadingFile)}
            </View>
          )}
        </ScrollView>

        {!isUploading && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton} onPress={onClose}>
              <Text style={styles.footerButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
