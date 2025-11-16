/**
 * 最適化されたImageコンポーネント
 *
 * - 遅延読み込み（lazy loading）
 * - 非同期デコード（decoding="async"）
 * - エラーハンドリング
 * - プレースホルダー表示
 */

import React, { useState, useEffect, useRef } from "react";
import { Image, ImageProps, View, StyleSheet, Platform } from "react-native";
import "./OptimizedImage.css";

interface OptimizedImageProps extends Omit<ImageProps, "source" | "src"> {
  src: string | { uri: string };
  alt?: string;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  lazy?: boolean; // 遅延読み込みを有効にするか（デフォルト: true）
  threshold?: number; // ビューポートから何px手前で読み込み開始するか（デフォルト: 200）
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholder,
  fallback,
  lazy = true,
  threshold = 200,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const imageRef = useRef<View>(null);

  // 遅延読み込みの実装（Intersection Observer相当）
  useEffect(() => {
    if (!lazy || shouldLoad) return;

    // React NativeではIntersection Observerが使えないため、
    // スクロールイベントで簡易的に実装
    // Webの場合はネイティブのloading="lazy"を使用
    if (Platform.OS === "web") {
      // Webの場合はネイティブの遅延読み込みを使用
      setShouldLoad(true);
      return;
    }

    // React Native用の簡易実装
    // 実際のアプリでは、react-native-intersection-observerなどのライブラリを使用することを推奨
    const checkVisibility = () => {
      if (!imageRef.current) return;

      // 簡易的な実装：一定時間後に読み込み開始
      // 実際のプロダクションでは、より高度な実装を推奨
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100);

      return () => clearTimeout(timer);
    };

    const timer = setTimeout(checkVisibility, 0);
    return () => clearTimeout(timer);
  }, [lazy, shouldLoad]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const source = typeof src === "string" ? { uri: src } : src;

  // エラー時のフォールバック表示
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Web用のimgタグ（ネイティブの遅延読み込みを使用）
  if (Platform.OS === "web") {
    return (
      <View style={style} ref={imageRef}>
        {isLoading && placeholder && (
          <View style={StyleSheet.absoluteFill}>{placeholder}</View>
        )}
        {/* @ts-ignore - Web専用プロパティ */}
        <img
          src={typeof src === "string" ? src : src.uri}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className="optimized-image-web"
        />
      </View>
    );
  }

  // React Native用のImageコンポーネント
  return (
    <View style={style} ref={imageRef}>
      {isLoading && placeholder && (
        <View style={[StyleSheet.absoluteFill, styles.placeholderContainer]}>
          {placeholder}
        </View>
      )}
      {shouldLoad && (
        <Image
          source={source}
          onLoad={handleLoad}
          onError={handleError}
          style={[styles.image, isLoading && styles.imageLoading]}
          {...props}
        />
      )}
      {hasError && fallback && (
        <View style={StyleSheet.absoluteFill}>{fallback}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageLoading: {
    opacity: 0,
  },
});
