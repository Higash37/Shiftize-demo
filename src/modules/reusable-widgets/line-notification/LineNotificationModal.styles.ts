import { StyleSheet } from 'react-native';
import { colors } from '@/common/common-constants/ThemeConstants';
import { layout } from '@/common/common-constants/LayoutConstants';
import { shadows } from '@/common/common-constants/ShadowConstants';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: layout.borderRadius.large,
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: layout.padding.small,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.padding.large,
    backgroundColor: colors.primary + '10',
    gap: 8,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    flex: 1,
  },
  shiftsList: {
    padding: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.padding.large,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  shiftItem: {
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shiftInfo: {
    gap: 8,
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  shiftTime: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  shiftDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  noShiftsContainer: {
    alignItems: 'center',
    padding: layout.padding.xlarge,
  },
  noShiftsText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  commentSection: {
    padding: layout.padding.large,
    paddingTop: 0,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: layout.padding.large,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  sendButton: {
    flex: 2,
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.success,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.secondary,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '600',
  },
});