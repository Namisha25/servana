import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OTPVerify() {
  const router = useRouter();
  
  // ✅ bookingId is the only essential param we need now
  const { bookingId } = useLocalSearchParams(); 
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://192.168.0.102:5000/api";

  useEffect(() => {
    if (!bookingId) {
      console.error("❌ ERROR: bookingId is missing in OTPVerify screen");
      Alert.alert("Error", "No booking session found. Please try again.");
    }
  }, [bookingId]);

  const handleVerifyOTP = async () => {
    if (otp.length < 4) {
      Alert.alert("Invalid Code", "Please enter the 4-digit code provided by the customer.");
      return;
    }

    setLoading(true);
    try {
      console.log(`📡 Sending Verification: ID ${bookingId} | OTP ${otp}`);

      const response = await fetch(`${BASE_URL}/verify-service-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: bookingId, 
          otp: otp.trim() 
        }), // ✅ Do NOT send amount here; we receive it from the server response
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ SUCCESS: Server returned the stored amount (e.g., "9000")
        console.log(`✅ OTP Verified. Database returned amount: ${data.amount}`);
        
        router.push({
          pathname: "/service-management",
          params: { 
            bookingId: bookingId,
            amount: data.amount // ✅ Pass the server-confirmed amount to the next screen
          }
        });
      } else {
        Alert.alert("Verification Failed", data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <TouchableOpacity style={styles.backHeader} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.inner}>
          <View style={styles.iconCircle}>
            <Ionicons name="keypad-outline" size={40} color="#FF9800" />
          </View>

          <Text style={styles.title}>Enter Service Code</Text>
          <Text style={styles.subtitle}>
            Ask the customer for the unique 4-digit code displayed on their screen.
          </Text>
          
          <TextInput
            style={styles.otpInput}
            placeholder="0000"
            placeholderTextColor="#E0E0E0"
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
            autoFocus={true}
          />

          <TouchableOpacity 
            style={[styles.verifyBtn, { opacity: otp.length === 4 ? 1 : 0.6 }]} 
            onPress={handleVerifyOTP} 
            disabled={loading || otp.length < 4}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons name="play-circle" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Verify & Start Job</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            The service will officially start once this code is verified.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backHeader: { padding: 20 },
  inner: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', marginTop: -50 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 20
  },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginVertical: 20, lineHeight: 22 },
  otpInput: { 
    borderBottomWidth: 3, borderBottomColor: '#FF9800', 
    fontSize: 48, textAlign: 'center', marginBottom: 50, 
    letterSpacing: 15, fontWeight: 'bold', color: '#333'
  },
  verifyBtn: { 
    backgroundColor: '#FF9800', padding: 18, borderRadius: 15, 
    alignItems: 'center', elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  footerNote: { textAlign: 'center', color: '#999', marginTop: 30, fontSize: 13 }
});