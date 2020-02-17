export default jest.mock('@expo/react-native-action-sheet', () => {
  return {
    show: jest.fn(),
  };
});
