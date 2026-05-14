import { Fingerprint, Layers } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await checkStatus();
    };
    // loadData();
  }, []);

  const checkStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/me`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        await AsyncStorage.removeItem("token");
        return null;
      }

      router.replace("/pages/product");
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/login`,
        { email, password },
      );

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        router.replace("/pages/product");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Layers color="#00e5ff" size={45} strokeWidth={1.5} />
            </View>
            <Text style={styles.logoTextMain}>INVENTO</Text>
            <Text style={styles.logoTextSub}>
              {process.env.EXPO_PUBLIC_APP_NAME}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email or Username"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.7}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            {/* ── Fingerprint Login ─────────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.faceLoginBtn, { marginTop: 12 }]}
              activeOpacity={0.7}
              onPress={() => router.push("/auth/fingerlogin")}
            >
              <Fingerprint
                color="#00e5ff"
                size={20}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.faceLoginText}>LOGIN WITH FINGERPRINT</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1116" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.08,
    paddingVertical: 20,
  },
  logoContainer: { alignItems: "center", marginBottom: height * 0.05 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(0, 229, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(0, 229, 255, 0.05)",
  },
  logoTextMain: {
    color: "#00e5ff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 6,
  },
  logoTextSub: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 4,
    marginTop: -2,
  },
  form: { width: "100%" },
  input: {
    height: Math.min(60, height * 0.07),
    borderWidth: 1.5,
    borderColor: "rgba(0, 229, 255, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 15,
    color: "#fff",
    marginBottom: 15,
    backgroundColor: "#1a1d24",
    fontSize: 16,
  },
  loginButton: {
    height: Math.min(60, height * 0.07),
    backgroundColor: "#00e5ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },
  buttonText: { color: "#000", fontSize: 18, fontWeight: "bold" },
  faceLoginBtn: {
    height: Math.min(60, height * 0.07),
    borderWidth: 1.5,
    borderColor: "#00e5ff",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  faceLoginText: { color: "#00e5ff", fontSize: 16, fontWeight: "bold" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: "#333" },
  orText: { color: "#888", marginHorizontal: 10, fontSize: 14 },
});

export default LoginScreen;
