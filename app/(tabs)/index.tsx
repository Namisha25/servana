import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 1. SESSION CHECK
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_details');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          navigateBasedOnRole(user.role);
        }
      } catch (e) {
        console.error("Session check error", e);
      }
    };
    checkExistingSession();
  }, []);

  // ✅ 2. NAVIGATION LOGIC (Corrected for Case Sensitivity)
  const navigateBasedOnRole = (role: string) => {
    // Converts "Provider" from MongoDB to "provider"
    const rawRole = role ? role.toLowerCase().trim() : '';

    if (rawRole === 'admin') {
      router.replace("/admin-home");
    } else if (rawRole === 'provider') { // ✅ Fixed: lowercase 'provider'
      router.replace("/provider-home");
    } else {
      router.replace("/(tabs)/home"); 
    }
  };

  // ✅ 3. SIGN IN HANDLER (Corrected for IP Address)
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // ✅ Updated IP to 192.168.0.102 based on your ipconfig
      const response = await fetch('http://192.168.0.102:5000/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); 

      if (response.ok) {
        if (data.user) {
          await AsyncStorage.setItem('user_details', JSON.stringify(data.user));
          navigateBasedOnRole(data.user.role);
        } else {
          Alert.alert("Error", "User data missing from server response.");
        }
      } else {
        Alert.alert("Login Failed", data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      // ✅ Matches your actual current network IP
      Alert.alert("Network Error", "Ensure your backend is running at 192.168.0.102:5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
          </View>
          <Text style={styles.brandName}>Servana</Text>
          <Text style={styles.tagline}>✨ no stress no drama, ghar ka kaam with servana ✨</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitleText}>Sign in to access your dashboard</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.symbol}>✉️</Text>
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.symbol}>🔒</Text>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.signInButton, loading && { opacity: 0.7 }]} 
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign in to Servana</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/register-user")}>
              <Text style={styles.secondaryButtonText}>Create new User account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryButton, { marginTop: 10 }]} 
              onPress={() => router.push("/register-provider")}
            >
              <Text style={styles.secondaryButtonText}>Register as Service Provider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDE7" },
  scrollContent: { padding: 25, alignItems: "center" },
  header: { alignItems: "center", marginTop: 10, marginBottom: 20 },
  logoCircle: { backgroundColor: "white", padding: 15, borderRadius: 50, elevation: 4 },
  logo: { width: 40, height: 40 },
  brandName: { fontSize: 42, fontWeight: "900", color: "#F57C00", marginTop: 10 },
  tagline: { fontSize: 11, color: "#888", fontStyle: "italic", textAlign: "center" },
  titleSection: { alignItems: "center", marginBottom: 25 },
  welcomeText: { fontSize: 26, fontWeight: "bold", color: "#333" },
  subtitleText: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 5 },
  form: { width: "100%" },
  label: { fontSize: 14, fontWeight: "700", color: "#444", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    height: 55,
    paddingLeft: 15,
    marginBottom: 15,
  },
  symbol: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, height: "100%", fontSize: 15, color: "#333" },
  signInButton: { backgroundColor: "#008542", borderRadius: 15, height: 60, justifyContent: "center", alignItems: "center", elevation: 3, marginTop: 10 },
  signInButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  footer: { marginTop: 30, alignItems: "center" },
  secondaryButton: { width: "100%", height: 50, borderWidth: 1, borderColor: "#DDD", borderRadius: 15, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  secondaryButtonText: { color: "#555", fontWeight: "600" },
});