import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function WelcomeScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login since welcome module was removed
    router.replace("/(auth)/login");
  }, []);
  
  return null;
}
