import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // Global Dark Theme Styling
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: "#121212", // Saari screens ka background dark rakhe ga
        },
      }}
    >
      {/* 
        name="index" ka matlab hai app/index.tsx khulay gi. 
        Isay hum Login screen banayenge.
      */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Baaki screens ke paths */}
      <Stack.Screen name="pages/product" options={{ headerShown: false }} />
      <Stack.Screen name="pages/bill" options={{ headerShown: false }} />
      <Stack.Screen name="pages/searchbill" options={{ headerShown: false }} />
      <Stack.Screen name="pages/reports" options={{ headerShown: false }} />
    </Stack>
  );
}
