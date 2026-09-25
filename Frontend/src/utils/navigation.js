// Switches to a bottom tab from anywhere. From a pushed stack screen this
// pops back to the existing tab navigator — `navigate('Tabs', ...)` would
// push a second copy of it in React Navigation 7 and break Back.
export function goToTab(navigation, tab) {
  if (navigation?.popTo) navigation.popTo('Tabs', { screen: tab });
  else navigation?.navigate('Tabs', { screen: tab });
}
