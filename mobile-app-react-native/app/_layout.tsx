import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // 1. Header ko ON rakhein taake patti nazar aaye
        headerShown: true,

        // 2. Title ko khali kar dein taake kuch likha nazar na aaye
        headerTitle: "",

        // 3. Header ki styling (Dark color aur border hatana)
        headerStyle: {
          backgroundColor: "#0f1116",
          // shadowColor: "transparent", // iOS ke liye line hatana
          // elevation: 0, // Android ke liye line hatana
        },
        headerTintColor: "#fff",

        // 4. Content background
        contentStyle: {
          backgroundColor: "#121212",
        },
      }}
    >
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/fingerlogin" options={{ headerShown: false }} />

      {/* Baaki screens par khali patti nazar aayegi */}
      <Stack.Screen name="pages/product" />
      <Stack.Screen name="pages/bill" />
      <Stack.Screen name="pages/searchbill" />
      <Stack.Screen name="pages/reports" />
    </Stack>
  );
}
