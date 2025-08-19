import { Dimensions, Platform } from 'react-native';

// デバイスのサイズを取得
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ブレークポイント
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// デバイスタイプを判定
export const getDeviceType = () => {
  if (screenWidth < breakpoints.mobile) return 'mobile';
  if (screenWidth < breakpoints.tablet) return 'tablet';
  if (screenWidth < breakpoints.desktop) return 'desktop';
  return 'wide';
};

// レスポンシブな値を返す関数
export const responsive = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
  default: T;
}): T => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return values.mobile ?? values.default;
    case 'tablet':
      return values.tablet ?? values.desktop ?? values.default;
    case 'desktop':
      return values.desktop ?? values.wide ?? values.default;
    case 'wide':
      return values.wide ?? values.desktop ?? values.default;
    default:
      return values.default;
  }
};

// レスポンシブなスタイルを生成
export const responsiveStyles = {
  // パディング
  padding: (base: number) => responsive({
    mobile: base,
    tablet: base * 1.5,
    desktop: base * 2,
    default: base,
  }),
  
  // フォントサイズ
  fontSize: (base: number) => responsive({
    mobile: base,
    tablet: base * 1.1,
    desktop: base * 1.2,
    default: base,
  }),
  
  // グリッドカラム数
  gridColumns: () => responsive({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    default: 1,
  }),
  
  // 機能ボックスの幅
  featureBoxWidth: () => responsive({
    mobile: '100%',
    tablet: '48%',
    desktop: '31%',
    wide: '23%',
    default: '100%',
  }),
  
  // コンテナの最大幅（数値版）
  maxWidthValue: () => responsive({
    mobile: undefined, // 100% はここでは undefined として扱い、別途 '100%' を使用
    tablet: 720,
    desktop: 1024,
    wide: 1280,
    default: undefined,
  }),
  
  // コンテナの最大幅（文字列版）
  maxWidth: () => {
    const deviceType = getDeviceType();
    if (deviceType === 'tablet' || deviceType === 'desktop' || deviceType === 'wide') {
      const numValue = responsive({
        mobile: undefined,
        tablet: 720,
        desktop: 1024,
        wide: 1280,
        default: undefined,
      });
      return numValue as number;
    }
    return '100%' as const;
  },
  
  // PC用の幅（70%）
  pcWidth: (): string => responsive({
    mobile: '100%',
    tablet: '90%',
    desktop: '70%',
    wide: '70%',
    default: '100%',
  }),
};

// Webプラットフォーム判定
export const isWeb = Platform.OS === 'web';

// デバイス情報
export const deviceInfo = {
  screenWidth,
  screenHeight,
  deviceType: getDeviceType(),
  isWeb,
  isMobile: getDeviceType() === 'mobile',
  isTablet: getDeviceType() === 'tablet',
  isDesktop: getDeviceType() === 'desktop' || getDeviceType() === 'wide',
};
// Expo Router のルート解決のための default export
export default function UtilsPage() {
  return null; // ユーティリティファイルはルートとして使用しない
}
