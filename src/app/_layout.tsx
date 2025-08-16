import React, { useEffect, useCallback, useMemo } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider } from "@/services/auth/AuthContext";
import { useAuth } from "@/services/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { View, AppState } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Enhanced root layout navigation with safe route segments access
 * and production-ready error handling
 */
function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Memoized route analysis with safe segment access
  const routeAnalysis = useMemo(() => {
    return LayoutNavigationHelper.analyzeCurrentRoute(segments);
  }, [segments]);

  // Enhanced navigation handler with error handling
  const handleNavigation = useCallback(() => {
    if (loading) return;

    try {
      const navigationAction = LayoutNavigationHelper.determineNavigationAction({
        user,
        role,
        routeAnalysis,
      });

      // Debug logging in development mode
      if (__DEV__) {
        console.log("Navigation Debug:", {
          segments: segments || [],
          user: !!user,
          role,
          loading,
          routeAnalysis,
          navigationAction,
        });
      }

      // Execute navigation action if needed
      if (navigationAction) {
        LayoutNavigationHelper.executeNavigation(router, navigationAction);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to safe route in case of navigation errors
      if (!user) {
        LayoutNavigationHelper.executeNavigation(router, { type: 'login' });
      }
    }
  }, [user, role, loading, routeAnalysis, router]);

  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  // Enhanced app state change handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && !loading) {
        try {
          // Skip authentication check for landing pages
          if (routeAnalysis.inLandingGroup) {
            return;
          }

          // Re-validate authentication state after app becomes active
          timeoutId = setTimeout(() => {
            if (!user && !loading) {
              LayoutNavigationHelper.executeNavigation(router, { type: 'login' });
            }
          }, 1000); // 1 second delay for stability
        } catch (error) {
          console.error("App state change error:", error);
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.remove();
    };
  }, [user, loading, routeAnalysis, router]);

  // Enhanced layout styling with memoization
  const layoutStyle = useMemo(() => {
    return {
      flex: 1,
      backgroundColor: "#F2F2F7",
    };
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <View style={layoutStyle}>
        <Slot />
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={{
          dark: false,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.background,
            text: colors.text.primary,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '900' },
          },
        }}
      >
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Layout navigation helper utility class
 * Provides safe route analysis and navigation logic
 */
class LayoutNavigationHelper {
  /**
   * Safely analyze current route segments
   */
  static analyzeCurrentRoute(segments: string[] | undefined) {
    const safeSegments = Array.isArray(segments) ? segments : [];
    const firstSegment = safeSegments[0] || "";
    
    return {
      segments: safeSegments,
      firstSegment,
      inAuthGroup: firstSegment === "(auth)",
      inLandingGroup: firstSegment === "(landing)",
      inMainGroup: firstSegment === "(main)",
      atRoot: safeSegments.length === 0,
      hasSegments: safeSegments.length > 0,
    };
  }

  /**
   * Determine what navigation action should be taken
   */
  static determineNavigationAction(params: {
    user: any;
    role: string | null | undefined;
    routeAnalysis: ReturnType<typeof LayoutNavigationHelper.analyzeCurrentRoute>;
  }): { type: 'login' | 'master-home' | 'user-home' | 'none' } | null {
    const { user, role, routeAnalysis } = params;

    // Landing pages and root are always accessible
    if (routeAnalysis.inLandingGroup || routeAnalysis.atRoot) {
      return { type: 'none' };
    }

    // Unauthenticated user trying to access protected routes
    if (!user) {
      if (routeAnalysis.inMainGroup) {
        return { type: 'login' };
      }
      return { type: 'none' };
    }

    // Authenticated user on auth pages should be redirected to main app
    if (routeAnalysis.inAuthGroup) {
      if (role === "master") {
        return { type: 'master-home' };
      } else if (role === "user") {
        return { type: 'user-home' };
      }
    }

    return { type: 'none' };
  }

  /**
   * Execute navigation action safely
   */
  static executeNavigation(
    router: any,
    action: { type: 'login' | 'master-home' | 'user-home' | 'none' }
  ): void {
    if (!router || typeof router.replace !== 'function') {
      console.error("Invalid router object provided to executeNavigation");
      return;
    }

    try {
      switch (action.type) {
        case 'login':
          router.replace("/(auth)/login");
          break;
        case 'master-home':
          router.replace("/(main)/master/home");
          break;
        case 'user-home':
          router.replace("/(main)/user/home");
          break;
        case 'none':
        default:
          // No navigation needed
          break;
      }
    } catch (error) {
      console.error("Failed to execute navigation:", error);
      // Fallback navigation in case of error
      try {
        router.replace("/(auth)/login");
      } catch (fallbackError) {
        console.error("Fallback navigation also failed:", fallbackError);
      }
    }
  }

  /**
   * Validate route segments for safety
   */
  static isValidSegment(segment: unknown): segment is string {
    return typeof segment === 'string' && segment.length > 0;
  }

  /**
   * Get safe segment at index
   */
  static getSafeSegment(segments: unknown, index: number): string {
    if (!Array.isArray(segments) || index < 0 || index >= segments.length) {
      return "";
    }
    
    const segment = segments[index];
    return this.isValidSegment(segment) ? segment : "";
  }
}
