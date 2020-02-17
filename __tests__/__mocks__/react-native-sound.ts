export default jest.mock('react-native-sound', () => {
  class SoundMock {
    constructor(path, type, callback) {}
  }

  // @ts-ignore
  SoundMock.prototype.setVolume = jest.fn();
   // @ts-ignore
  SoundMock.prototype.setNumberOfLoops = jest.fn();
   // @ts-ignore
  SoundMock.prototype.play = jest.fn();
   // @ts-ignore
  SoundMock.prototype.stop = jest.fn();
   // @ts-ignore
  SoundMock.setCategory = jest.fn();

  return SoundMock;
});