export default jest.mock('react-native-admob', () => {
  return {
    AdMobInterstitial: {
      setAdUnitID: () => jest.fn(),
      setTestDevices: () => jest.fn(),
    },
  };
});
