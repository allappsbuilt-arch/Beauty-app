import React from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoginScreen  from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

import HomeScreen     from '../screens/HomeScreen';
import RoutineScreen  from '../screens/RoutineScreen';
import CoachScreen    from '../screens/CoachScreen';
import SocialScreen   from '../screens/SocialScreen';
import AllToolsScreen from '../screens/AllToolsScreen';
import ScanFaceScreen          from '../screens/ScanFaceScreen';
import ScanAnalyzingScreen     from '../screens/ScanAnalyzingScreen';
import ScanResultsScreen       from '../screens/ScanResultsScreen';
import FullScanAnalysisScreen  from '../screens/FullScanAnalysisScreen';
import RoutineStepScreen       from '../screens/RoutineStepScreen';
import RoutineCompleteScreen   from '../screens/RoutineCompleteScreen';
import WeeklyReportScreen      from '../screens/WeeklyReportScreen';
import EyebrowTrackerScreen    from '../screens/EyebrowTrackerScreen';
import BrowAnalysisScreen      from '../screens/BrowAnalysisScreen';
import EyelashTrackerScreen    from '../screens/EyelashTrackerScreen';
import LashStylerScreen        from '../screens/LashStylerScreen';
import AIHairstylistScreen     from '../screens/AIHairstylistScreen';
import UndereyeTrackerScreen   from '../screens/UndereyeTrackerScreen';
import LipVitalityScreen       from '../screens/LipVitalityScreen';
import ScalpTrackerScreen      from '../screens/ScalpTrackerScreen';
import OccasionPickerScreen    from '../screens/OccasionPickerScreen';
import MakeupResultsScreen     from '../screens/MakeupResultsScreen';
import IngredientScannerScreen from '../screens/IngredientScannerScreen';
import DupeFinderScreen        from '../screens/DupeFinderScreen';
import ProductShelfScreen      from '../screens/ProductShelfScreen';
import IngredientGuideScreen   from '../screens/IngredientGuideScreen';
import ProductReviewsScreen    from '../screens/ProductReviewsScreen';
import RewardsScreen           from '../screens/RewardsScreen';
import WelcomeBackScreen       from '../screens/WelcomeBackScreen';
import LeaderboardScreen       from '../screens/LeaderboardScreen';
import CommunitiesScreen       from '../screens/CommunitiesScreen';
import CommunityGroupScreen    from '../screens/CommunityGroupScreen';
import SettingsScreen          from '../screens/SettingsScreen';
import NotificationsScreen     from '../screens/NotificationsScreen';
import CoachStyleScreen        from '../screens/CoachStyleScreen';
import ChallengesScreen        from '../screens/ChallengesScreen';
import FriendCompareScreen     from '../screens/FriendCompareScreen';
import PrivacyScreen           from '../screens/PrivacyScreen';
import ScanHistoryScreen       from '../screens/ScanHistoryScreen';
import TeenageControlsScreen   from '../screens/TeenageControlsScreen';
import MyCommunitiesScreen     from '../screens/MyCommunitiesScreen';
import { colors } from '../theme/colors';

// ─── Tab config ───────────────────────────────────────────────────────────────

// Order matches the required bottom tab layout:
// Home | Routine | All Tools | Socials | Earn
// Coach moved off the tab bar onto the root stack (still reachable — see
// the "Coach" Stack.Screen below and the "Chat now" link on HomeScreen).
const TABS = [
  { name: 'Home',     label: 'Home',     component: HomeScreen,     iconOutline: 'home-outline',     iconFilled: 'home'     },
  { name: 'Routine',  label: 'Routine',  component: RoutineScreen,  iconOutline: 'checkbox-outline', iconFilled: 'checkbox' },
  { name: 'AllTools', label: 'All Tools',component: AllToolsScreen, iconOutline: 'grid-outline',     iconFilled: 'grid'     },
  { name: 'Social',   label: 'Socials',  component: SocialScreen,   iconOutline: 'chatbubble-outline',iconFilled: 'chatbubble'},
  { name: 'Rewards',  label: 'Earn',     component: RewardsScreen,  iconOutline: 'diamond-outline',  iconFilled: 'diamond'  },
];

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Icon + label helpers ─────────────────────────────────────────────────────

function TabIcon({ iconOutline, iconFilled, focused }) {
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Ionicons
        name={focused ? iconFilled : iconOutline}
        size={22}
        color={focused ? colors.primary : colors.textLight}
      />
    </View>
  );
}

function TabLabel({ label, focused }) {
  return (
    <Text
      style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
}

// ─── Tab navigator ────────────────────────────────────────────────────────────

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: ({ focused }) => <TabLabel label={tab.label} focused={focused} />,
            tabBarIcon: ({ focused }) => (
              <TabIcon iconOutline={tab.iconOutline} iconFilled={tab.iconFilled} focused={focused} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// ─── Root stack (adds full-screen modals) ────────────────────────────────────

function AuthLoadingScreen() {
  return (
    <View style={styles.authLoading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ animation: 'fade' }} />
          </>
        ) : (
        <>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="ScanFace"
          component={ScanFaceScreen}
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ScanAnalyzing"
          component={ScanAnalyzingScreen}
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="ScanResults"
          component={ScanResultsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="FullScanAnalysis"
          component={FullScanAnalysisScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="RoutineStep"
          component={RoutineStepScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="RoutineComplete"
          component={RoutineCompleteScreen}
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="WeeklyReport"
          component={WeeklyReportScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="EyebrowTracker"
          component={EyebrowTrackerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="BrowAnalysis"
          component={BrowAnalysisScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="EyelashTracker"
          component={EyelashTrackerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="LashStyler"
          component={LashStylerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AIHairstylist"
          component={AIHairstylistScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="UndereyeTracker"
          component={UndereyeTrackerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="LipVitality"
          component={LipVitalityScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ScalpTracker"
          component={ScalpTrackerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="OccasionPicker"
          component={OccasionPickerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="MakeupResults"
          component={MakeupResultsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="IngredientScanner"
          component={IngredientScannerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DupeFinder"
          component={DupeFinderScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ProductShelf"
          component={ProductShelfScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="IngredientGuide"
          component={IngredientGuideScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ProductReviews"
          component={ProductReviewsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Coach"
          component={CoachScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="WelcomeBack"
          component={WelcomeBackScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Communities"
          component={CommunitiesScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CommunityGroup"
          component={CommunityGroupScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CoachStyle"
          component={CoachStyleScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Challenges"
          component={ChallengesScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="FriendCompare"
          component={FriendCompareScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ScanHistory"
          component={ScanHistoryScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="TeenageControls"
          component={TeenageControlsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="MyCommunities"
          component={MyCommunitiesScreen}
          options={{ animation: 'slide_from_right' }}
        />
        </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  authLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    height: Platform.OS === 'ios' ? 84 : 62,
    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -3 },
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  tabIconWrapActive: { backgroundColor: colors.primaryPale },
  tabLabel: {
    fontSize: 10, fontWeight: '600', letterSpacing: 0.1, marginTop: 1,
  },
  tabLabelActive:   { color: colors.primary },
  tabLabelInactive: { color: colors.textLight },
});
