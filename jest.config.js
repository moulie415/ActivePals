module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/__mocks__/react-native-firebase.ts',
  ],
  setupFiles: [
    '<rootDir>/jest/setup.js',
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  collectCoverage: true,
  collectCoverageFrom: ['app/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['app/types', 'app/styles', 'styles.ts'],
  // setupFilesAfterEnv: [
  //   '<rootDir>/__tests__/__mocks__/firebase.ts',
  //   '<rootDir>/__tests__/__mocks__/@react-native-community/geolocation.ts',
  // ],
  transform: {
    '^.+\\.(js)$': '<rootDir>/node_modules/babel-jest',
    '\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
    '/__tests__/fixtures/',
    '/__tests__/__mocks__/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-.*|react-navigation|react-navigation-.*|@synapsestudios/react-native-.*)/)',
  ],
  cacheDirectory: '.jest/cache',
};
