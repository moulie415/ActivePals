module.exports = {
    preset: 'react-native',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    setupFiles: [
      "<rootDir>/jest/setup.js"
    ],
    // setupFilesAfterEnv: [
    //   '<rootDir>/__tests__/__mocks__/firebase.ts',
    //   '<rootDir>/__tests__/__mocks__/@react-native-community/geolocation.ts',
    // ],
    transform: {
      '^.+\\.(js)$': '<rootDir>/node_modules/babel-jest',
      '\\.(ts|tsx)$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    testPathIgnorePatterns: ['\\.snap$', '<rootDir>/node_modules/', '/__tests__/fixtures/', '/__tests__/__mocks__/'],
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|react-native-.*|react-navigation|react-navigation-.*|@synapsestudios/react-native-.*)/)',
    ],
    cacheDirectory: '.jest/cache',
  };
  