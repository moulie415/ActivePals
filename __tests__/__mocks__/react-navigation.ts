export default jest.mock('react-navigation', () => {
  return {
    createAppContainer: jest
      .fn()
      .mockReturnValue(function NavigationContainer(props) {
        return null;
      }),
    createDrawerNavigator: jest.fn().mockImplementation(nav => {
      return {};
    }),
    createMaterialTopTabNavigator: jest.fn(),
    createStackNavigator: jest.fn().mockImplementation(nav => {
      return {};
    }),
    createSwitchNavigator: jest.fn().mockImplementation(nav => {
      return {};
    }),
    createBottomTabNavigator: jest.fn(),
    withNavigation: jest.fn().mockImplementation(component => component),
    StackActions: {
      push: jest
        .fn()
        .mockImplementation(x => ({ ...x, type: "Navigation/PUSH" })),
      replace: jest
        .fn()
        .mockImplementation(x => ({ ...x, type: "Navigation/REPLACE" }))
    },
    NavigationActions: {
      navigate: jest.fn().mockImplementation(x => x)
    },
    ThemeColors: {
      light: {
        bodyContent: ""
      },
      dark: {
        bodyContent: ""
      }
    },
    TabRouter: jest.fn(),
    createNavigator: jest.fn(),
    StackRouter: jest.fn(),
  };
});
