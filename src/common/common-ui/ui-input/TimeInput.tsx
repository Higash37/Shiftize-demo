import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TextInput, TextInputProps } from "react-native";
import { ErrorHandler } from "@/common/common-utils/error-handling/ErrorHandler";

/**
 * Time input validation result
 */
type TimeValidationResult = {
  isValid: boolean;
  formattedTime: string;
  error?: string;
};

/**
 * Time input component props with enhanced type safety
 */
interface TimeInputProps
  extends Omit<TextInputProps, "value" | "onChangeText" | "keyboardType" | "maxLength"> {
  /** Current time value in HH:MM format */
  value: string;
  /** Callback when time value changes - only called with valid HH:MM format */
  onChangeText: (value: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the input is in error state */
  isError?: boolean;
  /** Optional callback for validation errors */
  onError?: (error: string | null) => void;
}

/**
 * Enhanced time input component with robust validation and error handling
 * Supports HH:MM format with intelligent auto-formatting
 * 
 * Features:
 * - Automatic time formatting as user types
 * - Comprehensive input validation
 * - Accessibility support
 * - Production-ready error handling
 * - TypeScript strict mode compatibility
 */
export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChangeText,
  placeholder = "00:00",
  isError = false,
  onError,
  style,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value || "");
  const [internalError, setInternalError] = useState<string | null>(null);

  // Memoized validation to prevent unnecessary recalculations
  const validationResult = useMemo((): TimeValidationResult => {
    return TimeInputValidator.validateAndFormat(displayValue);
  }, [displayValue]);

  // Update display value when external value changes
  useEffect(() => {
    const normalizedValue = value || "";
    if (normalizedValue !== displayValue) {
      setDisplayValue(normalizedValue);
      setInternalError(null);
    }
  }, [value, displayValue]);

  // Report validation errors to parent component
  useEffect(() => {
    const error = validationResult.isValid ? null : (validationResult.error || null);
    setInternalError(error);
    onError?.(error);
  }, [validationResult, onError]);

  // Optimized formatting function with better error handling
  const formatTime = useCallback((input: string): string => {
    return TimeInputValidator.formatTimeInput(input);
  }, []);

  // Enhanced text change handler with better logic
  const handleTextChange = useCallback((text: string) => {
    const sanitizedText = TimeInputValidator.sanitizeInput(text);
    
    // Handle deletion operations
    if (sanitizedText.length < displayValue.length) {
      handleDeletion(sanitizedText);
      return;
    }

    // Handle input operations
    if (sanitizedText.length > displayValue.length) {
      handleInput(sanitizedText);
      return;
    }

    // Handle replacement operations
    handleReplacement(sanitizedText);
  }, [displayValue]);

  const handleDeletion = useCallback((text: string) => {
    // Special case: removing colon ("9:" → "9")
    if (displayValue.endsWith(":") && text === displayValue.slice(0, -1)) {
      setDisplayValue(text);
      return;
    }

    // Extract numbers only for deletion
    const numbers = text.replace(/\D/g, "");
    
    if (numbers === "") {
      setDisplayValue("");
      onChangeText("");
    } else {
      // Don't auto-format during deletion to respect user intent
      setDisplayValue(numbers);
    }
  }, [displayValue, onChangeText]);

  const handleInput = useCallback((text: string) => {
    const formatted = formatTime(text);
    setDisplayValue(formatted);

    // Only notify parent when we have a complete HH:MM format
    if (TimeInputValidator.isCompleteTimeFormat(formatted)) {
      onChangeText(formatted);
    } else if (formatted === "") {
      onChangeText("");
    }
  }, [formatTime, onChangeText]);

  const handleReplacement = useCallback((text: string) => {
    const formatted = formatTime(text);
    setDisplayValue(formatted);

    if (TimeInputValidator.isCompleteTimeFormat(formatted)) {
      onChangeText(formatted);
    } else if (formatted === "") {
      onChangeText("");
    }
  }, [formatTime, onChangeText]);

  // Enhanced blur handler with validation
  const handleBlur = useCallback(() => {
    if (!displayValue || displayValue.length === 0) {
      return;
    }

    const completedTime = TimeInputValidator.completeIncompleteTime(displayValue);
    
    if (completedTime && completedTime !== displayValue) {
      setDisplayValue(completedTime);
      onChangeText(completedTime);
    }
  }, [displayValue, onChangeText]);

  // Enhanced error styling
  const errorStyle = useMemo(() => {
    if (isError || internalError) {
      return { borderColor: "#FF4444", borderWidth: 1 };
    }
    return null;
  }, [isError, internalError]);

  return (
    <TextInput
      {...props}
      value={displayValue}
      onChangeText={handleTextChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      keyboardType="number-pad"
      maxLength={5}
      style={[style, errorStyle]}
      accessibilityLabel="時間入力"
      accessibilityHint="HH:MM形式で時間を入力してください"
    />
  );
};

/**
 * Time input validation and formatting utility class
 */
class TimeInputValidator {
  /**
   * Sanitize user input to remove invalid characters
   */
  static sanitizeInput(input: string): string {
    return ErrorHandler.sanitizeString(input, {
      allowedChars: /[0-9:]/g,
      maxLength: 5,
      trim: true,
    });
  }

  /**
   * Validate and format time input
   */
  static validateAndFormat(input: string): TimeValidationResult {
    if (!input) {
      return { isValid: true, formattedTime: "" };
    }

    // Check if it's a complete time format
    if (this.isCompleteTimeFormat(input)) {
      const parts = input.split(':');
      const hours = parseInt(parts[0] || "0", 10);
      const minutes = parseInt(parts[1] || "0", 10);
      
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { isValid: true, formattedTime: input };
      } else {
        return {
          isValid: false,
          formattedTime: input,
          error: "無効な時間です（00:00-23:59の範囲で入力してください）"
        };
      }
    }

    // Incomplete format is valid during input
    return { isValid: true, formattedTime: input };
  }

  /**
   * Format time input with intelligent auto-completion
   */
  static formatTimeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return "";
    }

    // Extract numbers only
    const numbers = input.replace(/\D/g, "");

    if (numbers === "") {
      return "";
    }

    // Handle different input lengths
    switch (numbers.length) {
      case 1:
        return this.formatSingleDigit(numbers);
      case 2:
        return this.formatTwoDigits(numbers);
      case 3:
        return this.formatThreeDigits(numbers);
      default:
        return this.formatFourOrMoreDigits(numbers);
    }
  }

  private static formatSingleDigit(digit: string): string {
    const num = parseInt(digit);
    // Auto-format 3-9 to "0X:"
    if (num >= 3) {
      return `0${digit}:`;
    }
    return digit;
  }

  private static formatTwoDigits(digits: string): string {
    const hour = Math.min(parseInt(digits), 23);
    return `${hour.toString().padStart(2, '0')}:`;
  }

  private static formatThreeDigits(digits: string): string {
    const hour = Math.min(parseInt(digits.substring(0, 2)), 23);
    const minute = digits.substring(2, 3);
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  private static formatFourOrMoreDigits(digits: string): string {
    const hour = Math.min(parseInt(digits.substring(0, 2)), 23);
    const minute = Math.min(parseInt(digits.substring(2, 4)), 59);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  /**
   * Check if input is a complete HH:MM format
   */
  static isCompleteTimeFormat(input: string): boolean {
    return /^\d{1,2}:\d{2}$/.test(input) && input.length >= 4;
  }

  /**
   * Complete incomplete time input on blur
   */
  static completeIncompleteTime(input: string): string | null {
    if (!input || input.length === 0 || input.length >= 5) {
      return null;
    }

    let completed = input;

    // Handle missing colon
    if (!completed.includes(":")) {
      if (completed.length === 1) {
        completed = `0${completed}:00`;
      } else if (completed.length === 2) {
        completed = `${completed}:00`;
      }
    } else {
      // Handle incomplete minutes
      const parts = completed.split(":");
      const firstPart = parts[0] || "";
      const secondPart = parts[1];
      
      if (secondPart && secondPart.length === 1) {
        completed = `${firstPart}:${secondPart}0`;
      } else if (!secondPart) {
        completed = `${firstPart}:00`;
      }
    }

    // Normalize leading zeros for single-digit hours
    if (completed.length === 5) {
      const parts = completed.split(":");
      const hour = parseInt(parts[0]);
      if (hour < 10 && parts[0].startsWith('0') && hour > 0) {
        completed = `${hour}:${parts[1]}`;
      }
    }

    return completed !== input ? completed : null;
  }
}