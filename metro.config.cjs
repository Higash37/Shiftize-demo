const { getDefaultConfig } = require("expo/metro-config");
const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig(__dirname);

const config = getDefaultConfig(__dirname);

// Shadow警告を抑制
config.transformer = {
  ...config.transformer,
  // Web環境でのshadow非推奨警告を抑制
  minifierConfig: {
    // 抑制設定は将来的にここに追加可能
  }
};

module.exports = config;
