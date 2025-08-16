import React from "react";
import { ShiftItem, ClassTimeSlot } from "@/common/common-models/ModelIndex";
import { EditShiftModalView } from "../view-modals/EditShiftModalView";
import { AddShiftModalView } from "../view-modals/AddShiftModalView";
import { PayrollDetailModal } from "../view-modals/PayrollDetailModal";
import { DatePickerModal } from "@/modules/reusable-widgets/calendar/modals/DatePickerModal";
import BatchConfirmModal from "../view-modals/BatchConfirmModal";
import { ShiftHistoryModal } from "../view-modals/ShiftHistoryModal";
import { GanttState, BatchModalState } from "./types";

interface GanttModalsProps {
  state: GanttState;
  updateState: (updates: Partial<GanttState>) => void;
  batchModal: BatchModalState;
  setBatchModal: (modal: BatchModalState) => void;
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string }>;
  classTimes: ClassTimeSlot[];
  onShiftUpdate?: () => void;
  onMonthChange?: (date: Date) => void;
}

export const GanttModals: React.FC<GanttModalsProps> = ({
  state,
  updateState,
  batchModal,
  setBatchModal,
  shifts,
  users,
  classTimes,
  onShiftUpdate,
  onMonthChange,
}) => {
  const {
    showEditModal,
    showAddModal,
    showDatePicker,
    showPayrollModal,
    showHistoryModal,
    editingShift,
    selectedDate,
    editModalType,
    isLoading,
  } = state;

  return (
    <>
      {/* 編集モーダル */}
      {showEditModal && editingShift && (
        <EditShiftModalView
          visible={showEditModal}
          shift={editingShift}
          users={users}
          modalType={editModalType || "edit"}
          isLoading={isLoading}
          classTimes={classTimes}
          onClose={() => updateState({ 
            showEditModal: false, 
            editingShift: null, 
            editModalType: null 
          })}
          onUpdate={onShiftUpdate}
        />
      )}

      {/* 追加モーダル */}
      {showAddModal && editingShift && (
        <AddShiftModalView
          visible={showAddModal}
          initialShift={editingShift}
          users={users}
          classTimes={classTimes}
          isLoading={isLoading}
          onClose={() => updateState({ 
            showAddModal: false, 
            editingShift: null 
          })}
          onUpdate={onShiftUpdate}
        />
      )}

      {/* 日付選択モーダル */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          updateState({ selectedDate: date, showDatePicker: false });
          onMonthChange?.(date);
        }}
        onClose={() => updateState({ showDatePicker: false })}
      />

      {/* 給与詳細モーダル */}
      <PayrollDetailModal
        visible={showPayrollModal}
        shifts={shifts}
        users={users}
        selectedDate={selectedDate}
        onClose={() => updateState({ showPayrollModal: false })}
      />

      {/* 履歴モーダル */}
      <ShiftHistoryModal
        visible={showHistoryModal}
        onClose={() => updateState({ showHistoryModal: false })}
      />

      {/* 一括処理モーダル */}
      <BatchConfirmModal
        visible={batchModal.visible}
        type={batchModal.type}
        shifts={shifts.filter((shift) => shift.status === "pending")}
        onConfirm={() => {
          setBatchModal({ visible: false, type: null });
          onShiftUpdate?.();
        }}
        onCancel={() => setBatchModal({ visible: false, type: null })}
      />
    </>
  );
};