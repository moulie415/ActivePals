import { NavigationActions } from 'react-navigation'
import { Stack } from 'Anyone/js/App'

export const initialState = Stack.router.getStateForAction(
  NavigationActions.init()
)

// const initialState = AppNavigation.router.getStateForAction(
//     AppNavigation.router.getActionForPathAndParams('Setup')
// )

export default function(state = initialState, action) {
  const nextState = Stack.router.getStateForAction(action, state)
  return nextState || state
}