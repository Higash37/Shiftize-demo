/**
 * Comprehensive error handling and defensive programming utility
 * Provides consistent error management patterns across the application
 */

/**
 * Standard error result type for consistent error handling
 */
export type ErrorResult<T = unknown> = {
  success: false;
  error: string;
  originalError?: T;
  code?: string;
};

/**
 * Standard success result type
 */
export type SuccessResult<T = unknown> = {
  success: true;
  data: T;
};

/**
 * Combined result type for operations that can succeed or fail
 */
export type Result<T = unknown, E = unknown> = SuccessResult<T> | ErrorResult<E>;

/**
 * Validation result with detailed error information
 */
export type ValidationResult = {
  isValid: boolean;
  error?: string;
  field?: string;
  code?: string;
};

/**
 * Main error handler utility class
 */
export class ErrorHandler {
  /**
   * Create a success result
   */
  static success<T>(data: T): SuccessResult<T> {
    return {
      success: true,
      data,
    };
  }

  /**
   * Create an error result
   */
  static error<T = unknown>(
    message: string,
    originalError?: T,
    code?: string
  ): ErrorResult<T> {
    const result: ErrorResult<T> = {
      success: false,
      error: message,
    };

    if (originalError !== undefined) {
      result.originalError = originalError;
    }

    if (code !== undefined) {
      result.code = code;
    }

    return result;
  }

  /**
   * Safely extract error message from various error types
   */
  static extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === 'object') {
      if ('message' in error && typeof (error as any).message === 'string') {
        return (error as any).message;
      }

      if ('error' in error && typeof (error as any).error === 'string') {
        return (error as any).error;
      }

      if ('description' in error && typeof (error as any).description === 'string') {
        return (error as any).description;
      }
    }

    return "予期しないエラーが発生しました";
  }

  /**
   * Safely execute an async operation with error handling
   */
  static async safeAsync<T>(
    operation: () => Promise<T>,
    fallbackValue?: T,
    customErrorMessage?: string
  ): Promise<Result<T>> {
    try {
      const result = await operation();
      return this.success(result);
    } catch (error) {
      const errorMessage = customErrorMessage || this.extractErrorMessage(error);
      
      if (__DEV__) {
        console.error('SafeAsync operation failed:', error);
      }

      return this.error(errorMessage, error);
    }
  }

  /**
   * Safely execute a synchronous operation with error handling
   */
  static safeSync<T>(
    operation: () => T,
    fallbackValue?: T,
    customErrorMessage?: string
  ): Result<T> {
    try {
      const result = operation();
      return this.success(result);
    } catch (error) {
      const errorMessage = customErrorMessage || this.extractErrorMessage(error);
      
      if (__DEV__) {
        console.error('SafeSync operation failed:', error);
      }

      return this.error(errorMessage, error);
    }
  }

  /**
   * Validate that a value is not null or undefined
   */
  static validateRequired<T>(
    value: T | null | undefined,
    fieldName: string
  ): ValidationResult {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: `${fieldName}は必須です`,
        field: fieldName,
        code: 'REQUIRED',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate string input
   */
  static validateString(
    value: unknown,
    fieldName: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
    } = {}
  ): ValidationResult {
    const { required = false, minLength, maxLength, pattern } = options;

    if (required) {
      const requiredValidation = this.validateRequired(value, fieldName);
      if (!requiredValidation.isValid) {
        return requiredValidation;
      }
    }

    if (value === null || value === undefined) {
      return { isValid: !required };
    }

    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `${fieldName}は文字列である必要があります`,
        field: fieldName,
        code: 'INVALID_TYPE',
      };
    }

    const trimmedValue = value.trim();

    if (minLength !== undefined && trimmedValue.length < minLength) {
      return {
        isValid: false,
        error: `${fieldName}は${minLength}文字以上で入力してください`,
        field: fieldName,
        code: 'MIN_LENGTH',
      };
    }

    if (maxLength !== undefined && trimmedValue.length > maxLength) {
      return {
        isValid: false,
        error: `${fieldName}は${maxLength}文字以下で入力してください`,
        field: fieldName,
        code: 'MAX_LENGTH',
      };
    }

    if (pattern && !pattern.test(trimmedValue)) {
      return {
        isValid: false,
        error: `${fieldName}の形式が正しくありません`,
        field: fieldName,
        code: 'INVALID_FORMAT',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate numeric input
   */
  static validateNumber(
    value: unknown,
    fieldName: string,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      integer?: boolean;
    } = {}
  ): ValidationResult {
    const { required = false, min, max, integer = false } = options;

    if (required) {
      const requiredValidation = this.validateRequired(value, fieldName);
      if (!requiredValidation.isValid) {
        return requiredValidation;
      }
    }

    if (value === null || value === undefined) {
      return { isValid: !required };
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);

    if (!Number.isFinite(numericValue)) {
      return {
        isValid: false,
        error: `${fieldName}は有効な数値である必要があります`,
        field: fieldName,
        code: 'INVALID_NUMBER',
      };
    }

    if (integer && !Number.isInteger(numericValue)) {
      return {
        isValid: false,
        error: `${fieldName}は整数である必要があります`,
        field: fieldName,
        code: 'NOT_INTEGER',
      };
    }

    if (min !== undefined && numericValue < min) {
      return {
        isValid: false,
        error: `${fieldName}は${min}以上である必要があります`,
        field: fieldName,
        code: 'MIN_VALUE',
      };
    }

    if (max !== undefined && numericValue > max) {
      return {
        isValid: false,
        error: `${fieldName}は${max}以下である必要があります`,
        field: fieldName,
        code: 'MAX_VALUE',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate email format
   */
  static validateEmail(value: unknown, required: boolean = false): ValidationResult {
    if (!required && (value === null || value === undefined || value === '')) {
      return { isValid: true };
    }

    const stringValidation = this.validateString(value, 'メールアドレス', {
      required,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    });

    if (!stringValidation.isValid) {
      const errorMessage = stringValidation.code === 'INVALID_FORMAT' 
        ? '有効なメールアドレスを入力してください'
        : stringValidation.error || 'メールアドレスが無効です';
      
      return {
        ...stringValidation,
        error: errorMessage,
      };
    }

    return { isValid: true };
  }

  /**
   * Sanitize string input by removing dangerous characters
   */
  static sanitizeString(
    input: unknown,
    options: {
      allowedChars?: RegExp;
      maxLength?: number;
      trim?: boolean;
    } = {}
  ): string {
    const { allowedChars = /[^<>\"'&]/g, maxLength, trim = true } = options;

    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input.match(allowedChars)?.join('') || '';

    if (trim) {
      sanitized = sanitized.trim();
    }

    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(
    input: unknown,
    options: {
      allowDecimals?: boolean;
      maxDigits?: number;
    } = {}
  ): string {
    const { allowDecimals = true, maxDigits } = options;

    if (typeof input !== 'string') {
      return '';
    }

    const pattern = allowDecimals ? /[^0-9.]/g : /[^0-9]/g;
    let sanitized = input.replace(pattern, '');

    // Handle multiple decimal points
    if (allowDecimals) {
      const parts = sanitized.split('.');
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    if (maxDigits && sanitized.replace('.', '').length > maxDigits) {
      const nonDecimalLength = sanitized.replace('.', '').length;
      const excessLength = nonDecimalLength - maxDigits;
      sanitized = sanitized.substring(0, sanitized.length - excessLength);
    }

    return sanitized;
  }

  /**
   * Create a defensive wrapper for object property access
   */
  static safeGet<T, K extends keyof T>(
    obj: T | null | undefined,
    key: K,
    fallback?: T[K]
  ): T[K] | undefined {
    if (obj === null || obj === undefined) {
      return fallback;
    }

    try {
      const value = obj[key];
      return value !== undefined ? value : fallback;
    } catch (error) {
      if (__DEV__) {
        console.warn(`SafeGet failed for key ${String(key)}:`, error);
      }
      return fallback;
    }
  }

  /**
   * Create a defensive wrapper for array access
   */
  static safeArrayGet<T>(
    array: T[] | null | undefined,
    index: number,
    fallback?: T
  ): T | undefined {
    if (!Array.isArray(array) || index < 0 || index >= array.length) {
      return fallback;
    }

    try {
      return array[index] !== undefined ? array[index] : fallback;
    } catch (error) {
      if (__DEV__) {
        console.warn(`SafeArrayGet failed for index ${index}:`, error);
      }
      return fallback;
    }
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastExecution = 0;

    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecution >= delay) {
        lastExecution = now;
        func(...args);
      }
    };
  }
}

/**
 * Firebase-specific error handler
 */
export class FirebaseErrorHandler extends ErrorHandler {
  /**
   * Map Firebase error codes to user-friendly messages
   */
  static getFirebaseErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          return 'ユーザーが見つかりません';
        case 'auth/wrong-password':
          return 'パスワードが正しくありません';
        case 'auth/email-already-in-use':
          return 'このメールアドレスは既に使用されています';
        case 'auth/weak-password':
          return 'パスワードは6文字以上で入力してください';
        case 'auth/invalid-email':
          return 'メールアドレスの形式が正しくありません';
        case 'auth/too-many-requests':
          return '試行回数が上限に達しました。しばらく時間をおいてから再試行してください';
        case 'auth/network-request-failed':
          return 'ネットワークエラーが発生しました。接続を確認してください';
        case 'permission-denied':
          return 'アクセス権限がありません';
        case 'not-found':
          return 'データが見つかりません';
        case 'already-exists':
          return 'データが既に存在します';
        case 'resource-exhausted':
          return 'リクエスト制限に達しました。しばらく時間をおいてから再試行してください';
        case 'unauthenticated':
          return '認証が必要です。ログインしてください';
        case 'unavailable':
          return 'サービスが一時的に利用できません';
        default:
          return firebaseError.message || this.extractErrorMessage(error);
      }
    }
    
    return this.extractErrorMessage(error);
  }

  /**
   * Handle Firebase operation with specific error mapping
   */
  static async handleFirebaseOperation<T>(
    operation: () => Promise<T>,
    customErrorMessage?: string
  ): Promise<Result<T>> {
    try {
      const result = await operation();
      return this.success(result);
    } catch (error) {
      const errorMessage = customErrorMessage || this.getFirebaseErrorMessage(error);
      
      if (__DEV__) {
        console.error('Firebase operation failed:', error);
      }

      return this.error(errorMessage, error);
    }
  }
}

/**
 * React Native specific error handler
 */
export class ReactNativeErrorHandler extends ErrorHandler {
  /**
   * Handle React Native specific errors
   */
  static getReactNativeErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      
      // Handle network errors
      if (errorObj.code === 'NETWORK_ERROR' || errorObj.message?.includes('Network')) {
        return 'ネットワークエラーが発生しました。接続を確認してください';
      }

      // Handle permission errors
      if (errorObj.code === 'PERMISSION_DENIED' || errorObj.message?.includes('permission')) {
        return 'アプリの権限設定を確認してください';
      }

      // Handle storage errors
      if (errorObj.code === 'STORAGE_ERROR' || errorObj.message?.includes('storage')) {
        return 'ストレージエラーが発生しました。容量を確認してください';
      }
    }

    return this.extractErrorMessage(error);
  }
}