import { NavigatorScreenParams } from "@react-navigation/native";

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "select-user-type": undefined;
      login: undefined;
      signup: { userType: "farmer" | "analyst" };
      "verify-email": undefined;
      "(farmer)": NavigatorScreenParams<{
        dashboard: undefined;
      }>;
      "(analyst)": NavigatorScreenParams<{
        dashboard: undefined;
      }>;
    }
  }
}
