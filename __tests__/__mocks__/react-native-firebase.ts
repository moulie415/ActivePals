export default jest.mock('react-native-firebase', () => {
  return {
      admob: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn(),
              interstitial: jest.fn()
          }
      }),
      analytics: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      auth: jest.fn(() => {
          return {
              hasPermission: jest.fn(() => Promise.resolve(true)),
              subscribeToTopic: jest.fn(),
              unsubscribeFromTopic: jest.fn(),
              requestPermission: jest.fn(() => Promise.resolve(true)),
              getToken: jest.fn(() => Promise.resolve('RN-Firebase-Token'))
          }
      }),
      crashlytics: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      firestore: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      perf: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      links: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      database: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      config: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      storage: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      iid: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      }),
      messaging: jest.fn(() => {
          return {
              hasPermission: jest.fn(() => Promise.resolve(true)),
              subscribeToTopic: jest.fn(),
              unsubscribeFromTopic: jest.fn(),
              requestPermission: jest.fn(() => Promise.resolve(true)),
              getToken: jest.fn(() => Promise.resolve('RN-Firebase-Token'))
          }
      }),
      notifications: jest.fn(() => {
          return {
              onNotification: jest.fn(),
              onNotificationDisplayed: jest.fn()
          }
      })
  }
})
