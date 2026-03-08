module.exports = function babelConfig(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@components": "./src/common/common-ui",
            "@utils": "./src/common/common-utils",
            "@types": "./src/common/common-models",
            "@services": "./src/services",
            "@providers": "./src/providers",
            "@core": "./src/common",
            "@features": "./src/modules",
            "@backend": "./src/backend-migration",
            "@styles": "./src/styles",
            "@hooks": "./src/hooks",
            "@constants": "./src/common/common-constants",
            "@theme": "./src/common/common-theme",
            "react-native": "react-native-web",
          },
        },
      ],
    ],
  };
};
