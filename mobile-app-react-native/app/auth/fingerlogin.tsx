import * as LocalAuthentication from "expo-local-authentication";
import { Fingerprint, Layers } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const FingerprintLoginScreen = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [statusText, setStatusText] = useState("Checking device...");
  const [subText, setSubText] = useState("");

  // ── Step 1: Check device support ─────────────────────────────────────────
  useEffect(() => {
    const checkSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible) {
        setStatusText("NOT SUPPORTED");
        setSubText("This device has no biometric hardware");
        setIsSupported(false);
        return;
      }

      if (!enrolled) {
        setStatusText("NOT ENROLLED");
        setSubText("Please set up fingerprint in device settings");
        setIsSupported(false);
        return;
      }

      setIsSupported(true);
      setStatusText("TOUCH TO LOGIN");
      setSubText("Place your finger on the sensor");
    };

    checkSupport();
  }, []);

  // ── Step 2: Authenticate ──────────────────────────────────────────────────
  const handleFingerprintLogin = async () => {
    if (!isSupported || isLoading) return;

    setIsLoading(true);
    setStatusText("SCANNING...");
    setSubText("Keep your finger on the sensor");

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login to Invento",
        fallbackLabel: "Use Password",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // ── Fingerprint verified — now get token from backend ─────────────
        setStatusText("AUTHENTICATED");
        setSubText("Logging you in...");

        const token = await AsyncStorage.getItem("token");

        if (token) {
          // Token already exists — validate it
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/me`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.ok) {
            router.replace("/pages/product");
          } else {
            // Token expired
            await AsyncStorage.removeItem("token");
            setStatusText("SESSION EXPIRED");
            setSubText("Please login with password first");
            Alert.alert(
              "Session Expired",
              "Please login with password once to restore your session.",
              [{ text: "OK", onPress: () => router.back() }],
            );
          }
        } else {
          // No token — user needs to login with password first
          setStatusText("LOGIN REQUIRED");
          setSubText("Please login with password first");
          Alert.alert(
            "No Session Found",
            "Please login with your password once. After that fingerprint will work automatically.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        }
      } else if (result.error === "user_cancel") {
        setStatusText("TOUCH TO LOGIN");
        setSubText("Place your finger on the sensor");
      } else {
        setStatusText("NOT RECOGNIZED");
        setSubText("Try again or use password");
        console.warn("[FINGERPRINT] Failed:", result.error);
      }
    } catch (error: any) {
      console.error("[FINGERPRINT] Error:", error.message);
      Alert.alert("Error", "Something went wrong. Try again.");
      setStatusText("TOUCH TO LOGIN");
      setSubText("Place your finger on the sensor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — same as LoginScreen */}
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Layers color="#00e5ff" size={45} strokeWidth={1.5} />
        </View>
        <Text style={styles.logoTextMain}>INVENTO</Text>
        <Text style={styles.logoTextSub}>
          {process.env.EXPO_PUBLIC_APP_NAME}
        </Text>
      </View>

      {/* Fingerprint Scanner UI */}
      <View style={styles.scannerWrapper}>
        <TouchableOpacity
          onPress={handleFingerprintLogin}
          disabled={!isSupported || isLoading}
          activeOpacity={0.8}
        >
          <View
            style={[styles.outerRing, !isSupported && styles.outerRingDisabled]}
          >
            <View
              style={[
                styles.innerCircle,
                isLoading && styles.innerCircleActive,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#00e5ff" />
              ) : (
                <Fingerprint
                  color={isSupported ? "#00e5ff" : "#444"}
                  size={80}
                  strokeWidth={1.2}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ marginTop: 35, alignItems: "center" }}>
          <Text style={styles.instructionText}>{statusText}</Text>
          <Text style={styles.subInstruction}>{subText}</Text>
        </View>
      </View>

      {/* Footer — same as LoginScreen */}
      <View style={styles.footer}>
        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.passwordBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.passwordBtnText}>USE PASSWORD INSTEAD</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1116",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },

  // ── Header (same as LoginScreen) ─────────────────────────────────────────
  logoContainer: { alignItems: "center" },
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

  // ── Scanner ───────────────────────────────────────────────────────────────
  scannerWrapper: { alignItems: "center" },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(0, 229, 255, 0.4)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  outerRingDisabled: {
    borderColor: "rgba(100, 100, 100, 0.4)",
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(0, 229, 255, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(0, 229, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircleActive: {
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderColor: "rgba(0, 229, 255, 0.5)",
  },
  instructionText: {
    color: "#00e5ff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  subInstruction: {
    color: "#888",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // ── Footer (same as LoginScreen) ──────────────────────────────────────────
  footer: { width: "100%", paddingHorizontal: width * 0.08 },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#333" },
  orText: { color: "#888", marginHorizontal: 10, fontSize: 14 },
  passwordBtn: {
    height: Math.min(60, height * 0.07),
    borderWidth: 1.5,
    borderColor: "#00e5ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordBtnText: {
    color: "#00e5ff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default FingerprintLoginScreen;
