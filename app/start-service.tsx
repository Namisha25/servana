import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Alert, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';

export default function StartService() {
  const router = useRouter();
  
  // ✅ Capturing params from LiveTracking
  const { bookingId, amount } = useLocalSearchParams(); 
  
  const [otp, setOtp] = useState('----');
  const [updating, setUpdating] = useState(false);

  // ✅ Updated to match your server.js (192.168.0.102)
  const BASE_URL = "http://192.168.0.102:5000/api";

  const generateNewOtp = async () => {
    // Check if bookingId exists (from router params)
    if (!bookingId) {
      console.error("❌ Missing bookingId in StartService");
      Alert.alert("Error", "No booking reference found. Please go back and try again.");
      return;
    }

    setUpdating(true);
    // Generate a secure 4-digit OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    try {
      // ✅ Matches server.js route: app.patch('/api/update-booking-otp', ...)
      const response = await fetch(`${BASE_URL}/update-booking-otp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: bookingId, 
          serviceOtp: newOtp,
          amount: amount ? amount.toString() : "0"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sync OTP");
      }

      setOtp(newOtp);
      console.log(`📡 [SYNC SUCCESS] OTP: ${newOtp} | Amount: ₹${amount}`); 
    } catch (error) {
      console.error("Sync Error:", error);
      Alert.alert("Connection Error", "Could not sync code with server.");
    } finally {
      setUpdating(false);
    }
  };

  // Run automatically when the screen loads
  useEffect(() => {
    if (bookingId) {
      generateNewOtp();
    }
  }, [bookingId]);

  const handleEndService = () => {
    Alert.alert(
      "End Service",
      "Are you sure the service is complete?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          style: "destructive", 
          onPress: () => router.push({
            pathname: "/review-rating",
            params: { bookingId, amount } 
          }) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Session</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.iconContainer}>
            {updating ? (
              <ActivityIndicator size="large" color="#008542" />
            ) : (
              <Ionicons name="shield-checkmark" size={60} color="#008542" />
            )}
          </View>
          
          <Text style={styles.title}>Service OTP</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              Please provide this code to the professional to authenticate the start of your service.
            </Text>
            <Text style={styles.planHighlight}>
              Plan Amount: ₹{amount || "0"}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.split('').map((digit, index) => (
              <View key={index} style={styles.digitBox}>
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.refreshBtn} 
            onPress={generateNewOtp}
            disabled={updating}
          >
            <Ionicons name="refresh" size={20} color={updating ? "#CCC" : "#008542"} />
            <Text style={[styles.refreshText, updating && { color: "#CCC" }]}>
              {updating ? "Syncing..." : "Re-generate OTP"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.endBtn]} 
            onPress={handleEndService}
          >
            <Ionicons name="stop-circle-outline" size={22} color="white" />
            <Text style={styles.endBtnText}>End Service</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.homeBtn]} 
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.homeBtnText}>Minimize to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 40 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: 'white' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  mainCard: { 
    backgroundColor: 'white', 
    margin: 20, 
    borderRadius: 25, 
    padding: 30, 
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  iconContainer: { 
    backgroundColor: '#E8F5E9', 
    padding: 20, 
    borderRadius: 50, 
    marginBottom: 20 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitleContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  subtitle: { 
    textAlign: 'center', 
    color: '#666', 
    lineHeight: 20,
    marginBottom: 10,
    paddingHorizontal: 10
  },
  planHighlight: { fontSize: 16, fontWeight: 'bold', color: '#008542' },
  otpContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  digitBox: { 
    width: 60, 
    height: 75, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#008542'
  },
  digitText: { fontSize: 32, fontWeight: 'bold', color: '#008542' },
  refreshBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  refreshText: { 
    color: '#008542', 
    fontWeight: 'bold', 
    marginLeft: 8,
    textDecorationLine: 'underline'
  },
  footerActions: { paddingHorizontal: 20, gap: 15 },
  actionBtn: { 
    flexDirection: 'row',
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  endBtn: { backgroundColor: '#FF3B30' },
  endBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  homeBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#DDD' },
  homeBtnText: { color: '#666', fontWeight: 'bold' }
});