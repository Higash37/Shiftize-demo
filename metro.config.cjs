const { getDefaultConfig } = require("expo/metro-config");
const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig(__dirname);

const config = getDefaultConfig(__dirname);

// WSL最適化設定
config.resolver = {
  ...config.resolver,
  // キャッシュ最適化
  hasteImplModulePath: undefined,
};

// ファイル監視最適化
config.watchFolders = [];
config.transformer = {
  ...config.transformer,
  // 並列処理最適化
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// WSL用ファイルシステム最適化
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // CORS最適化
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
