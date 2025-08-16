import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function OnboardingScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login since onboarding module was removed
    router.replace("/(auth)/login");
  }, []);
  
  return null;
}
