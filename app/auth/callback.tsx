import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<Record<string, string>>();

  useEffect(() => {
    const handle = async () => {
      // Supabase will parse the fragment internally; calling getSession ensures we pick up the new session
      await supabase.auth.getSession();
      router.replace("/login");
    };
    handle();
  }, [params]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#0891b2" />
    </View>
  );
}


