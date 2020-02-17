export default jest.mock('react-native-actionsheet', () => {
  return {
    show: jest.fn(),
  };
});
