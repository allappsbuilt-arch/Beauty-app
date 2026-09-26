import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { remindersSupported, syncRemindersFromServer, cancelReminders } from '../utils/reminders';
import LoginScreen  from '../screens/LoginScreen';
import OnboardingWelcomeScreen   from '../screens/OnboardingWelcomeScreen';
import OnboardingProfileScreen   from '../screens/OnboardingProfileScreen';
import OnboardingVoiceScreen     from '../screens/OnboardingVoiceScreen';
import OnboardingAllergiesScreen from '../screens/OnboardingAllergiesScreen';
import OnboardingAllSetScreen    from '../screens/OnboardingAllSetScreen';

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
import VirtualTryOnScreen      from '../screens/VirtualTryOnScreen';
import AgingSimulatorScreen    from '../screens/AgingSimulatorScreen';
import SymmetryCheckScreen     from '../screens/SymmetryCheckScreen';
import TransformationTimelapseScreen from '../screens/TransformationTimelapseScreen';
import CreatePostScreen        from '../screens/CreatePostScreen';
import PostCommentsScreen      from '../screens/PostCommentsScreen';
import UserProfileScreen       from '../screens/UserProfileScreen';
import StoryViewerScreen       from '../screens/StoryViewerScreen';
import MindfulnessSessionScreen from '../screens/MindfulnessSessionScreen';
import WaterLogScreen          from '../screens/WaterLogScreen';
import ReferFriendScreen       from '../screens/ReferFriendScreen';
import PointsStatementScreen   from '../screens/PointsStatementScreen';
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

const navigationRef = createNavigationContainerRef();

// Keeps the device's routine reminders in step with the signed-in account,
// and opens the right routine when a reminder is tapped.
function useRoutineReminders({ isAuthenticated }) {
  const request = useAuthedRequest();
  // A tapped reminder waits here until the user is signed in and navigation
  // is ready (e.g. the app was launched by tapping it).
  const pendingRoutine = useRef(null);
  const signedIn = useRef(isAuthenticated);
  signedIn.current = isAuthenticated;

  const flushPending = useCallback(() => {
    if (pendingRoutine.current && signedIn.current && navigationRef.isReady()) {
      navigationRef.navigate('RoutineStep', { routineTitle: pendingRoutine.current });
      pendingRoutine.current = null;
    }
  }, []);

  useEffect(() => {
    if (!remindersSupported) return;
    if (!isAuthenticated) { cancelReminders(); return; }
    // No permission prompt here — that happens when the user saves a reminder.
    syncRemindersFromServer(request).catch(() => {});
    flushPending();
  }, [isAuthenticated, request, flushPending]);

  useEffect(() => {
    if (!remindersSupported) return undefined;
    const open = (response) => {
      const routineTitle = response?.notification?.request?.content?.data?.routineTitle;
      if (!routineTitle) return;
      pendingRoutine.current = routineTitle;
      flushPending();
    };
    // Launched by tapping a reminder (checked once per app start).
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [flushPending]);

  return flushPending; // NavigationContainer onReady
}

const ONBOARDING_ANIMATION = { animation: 'slide_from_right' };

export default function AppNavigator() {
  const { isAuthenticated, isLoading, onboardingPending, isReturningDevice } = useAuth();
  const onNavigationReady = useRoutineReminders({ isAuthenticated });

  // New devices start at the welcome step; a new account continues at the
  // coach-voice step; everyone else lands on Home.
  const phase = !isAuthenticated ? 'guest' : onboardingPending ? 'onboarding' : 'app';
  const initialRoute = {
    guest: isReturningDevice ? 'Login' : 'OnboardingWelcome',
    onboarding: 'OnboardingVoice',
    app: 'Tabs',
  }[phase];

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
      {/* Keyed by phase so signing in/out or finishing onboarding starts a
          fresh stack at that phase's first screen (e.g. a new account moves
          on to the coach-voice step rather than staying on the profile step). */}
      <Stack.Navigator key={phase} screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        {phase === 'guest' ? (
          <>
            <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} options={ONBOARDING_ANIMATION} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
          </>
        ) : phase === 'onboarding' ? (
          <>
            <Stack.Screen name="OnboardingVoice" component={OnboardingVoiceScreen} options={ONBOARDING_ANIMATION} />
            <Stack.Screen name="OnboardingAllergies" component={OnboardingAllergiesScreen} options={ONBOARDING_ANIMATION} />
            <Stack.Screen name="OnboardingAllSet" component={OnboardingAllSetScreen} options={ONBOARDING_ANIMATION} />
            {/* Reached with Back from the voice step. */}
            <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} options={ONBOARDING_ANIMATION} />
            <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} options={ONBOARDING_ANIMATION} />
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
        {/* All Tools: "See All" category list + photo-based AI tools */}
        <Stack.Screen
          name="ToolCategory"
          component={AllToolsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="VirtualTryOn"
          component={VirtualTryOnScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AgingSimulator"
          component={AgingSimulatorScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="SymmetryCheck"
          component={SymmetryCheckScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="TransformationTimelapse"
          component={TransformationTimelapseScreen}
          options={{ animation: 'slide_from_right' }}
        />
        {/* Socials */}
        <Stack.Screen
          name="CreatePost"
          component={CreatePostScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="PostComments"
          component={PostCommentsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfileScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="StoryViewer"
          component={StoryViewerScreen}
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="MindfulnessSession"
          component={MindfulnessSessionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        {/* Earn */}
        <Stack.Screen
          name="WaterLog"
          component={WaterLogScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ReferFriend"
          component={ReferFriendScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="PointsStatement"
          component={PointsStatementScreen}
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
