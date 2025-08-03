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
  
  // コンテナの最大幅
  maxWidth: () => responsive({
    mobile: '100%',
    tablet: 720,
    desktop: 1024,
    wide: 1280,
    default: '100%',
  }),
  
  // PC用の幅（70%）
  pcWidth: () => responsive({
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