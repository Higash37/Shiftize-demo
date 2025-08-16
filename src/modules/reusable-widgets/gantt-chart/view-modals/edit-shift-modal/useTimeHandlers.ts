export const useTimeHandlers = (
  onChange: (field: string, value: any) => void,
  updateState: (updates: any) => void
) => {
  // 時間のバリデーション
  const validateTime = (time: string) => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const handleTimeChange = (value: string, isStart: boolean) => {
    if (isStart) {
      updateState({ manualStartTime: value });
      if (validateTime(value)) {
        onChange("startTime", value);
      }
    } else {
      updateState({ manualEndTime: value });
      if (validateTime(value)) {
        onChange("endTime", value);
      }
    }
  };

  const handleToggleManualInput = () => {
    updateState((prev: any) => ({ isManualInput: !prev.isManualInput }));
  };

  return {
    validateTime,
    handleTimeChange,
    handleToggleManualInput,
  };
};