import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SuccessScreen() {
  const router = useRouter();
  const { serviceType } = useLocalSearchParams();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const userData = await AsyncStorage.getItem("user_details");
      if (userData) {
        const parsed = JSON.parse(userData);
        // Supports nested or flat user objects
        setUserName(parsed.fullName || parsed.user?.fullName || "Valued User");
      }
    };
    getUser();
  }, []);

  const handleFindProvider = async () => {
    try {
      // 1. Get the current booking object which contains the address and date
      const bookingData = await AsyncStorage.getItem("current_booking");
      const parsedBooking = bookingData ? JSON.parse(bookingData) : {};

      const selectedService = Array.isArray(serviceType) ? serviceType[0] : serviceType;
      
      // 2. Prepare FULL params. These will be sent to your MongoDB in the next screen.
      const searchParams = {
        serviceType: selectedService || parsedBooking.serviceName || "Service",
        customerName: parsedBooking.customerName || userName,
        customerPhone: parsedBooking.customerPhone || "Not provided",
        address: parsedBooking.address || "Address missing",
        amount: parsedBooking.amount || "0",
        planName: parsedBooking.planName || "Standard",
        dateString: parsedBooking.date || "Today"
      };

      console.log("🚀 Moving to matching screen with all data:", searchParams);

      router.replace({
        pathname: '/assign-provider',
        params: searchParams
      });

    } catch (error) {
      console.error("Navigation Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={100} color="#00C853" />
      <Text style={styles.title}>Payment Successful!</Text>
      
      <Text style={styles.subtitle}>
        {userName ? `Hi ${userName}, ` : ""}your payment for{" "}
        <Text style={{ fontWeight: 'bold' }}>{serviceType || "your service"}</Text>{" "}
        has been confirmed.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={handleFindProvider}>
        <Text style={styles.btnText}>Find a Service Provider</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBE6', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 40 },
  btn: { backgroundColor: '#00C853', padding: 18, borderRadius: 12, width: '80%', alignItems: 'center', elevation: 3 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});