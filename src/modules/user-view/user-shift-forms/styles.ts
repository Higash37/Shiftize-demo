import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateItem: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  removeButton: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  picker: {
    height: 150,
  },
});