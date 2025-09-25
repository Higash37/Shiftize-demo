// Shadow警告を最初期に抑制
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // エラーとワーニングを上書き
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.warn = function(...args) {
    const message = String(args[0] || '');
    if (message.includes('shadow') && (message.includes('deprecated') || message.includes('boxShadow'))) {
      return; // Shadow関連の警告を抑制
    }
    originalConsoleWarn.apply(console, args);
  };

  console.error = function(...args) {
    const message = String(args[0] || '');
    if (message.includes('shadow') && (message.includes('deprecated') || message.includes('boxShadow'))) {
      return; // Shadow関連のエラーを抑制
    }
    originalConsoleError.apply(console, args);
  };
}

// expo-routerプラグインが有効になっているため、手動でのentryインポートは不要
// import "expo-router/entry";
