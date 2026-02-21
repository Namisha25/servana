import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function JobActive() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(12);

  const BASE_URL = "http://192.168.0.102:5000/api";

  // Dummy coordinates for simulation (Mumbai area)
  const destination = { latitude: 19.0760, longitude: 72.8777 };
  const [markerPos, setMarkerPos] = useState({ latitude: 19.0700, longitude: 72.8700 });

  useEffect(() => {
    fetchActiveJob();

    const interval = setInterval(() => {
      setMarkerPos((prev) => {
        const newLat = prev.latitude + 0.0002;
        const newLng = prev.longitude + 0.0002;
        if (newLat >= 19.0755) {
          clearInterval(interval);
          setEta(0);
          return { latitude: 19.0760, longitude: 72.8777 };
        }
        setEta((prevEta) => (prevEta > 1 ? prevEta - 0.1 : 1));
        return { latitude: newLat, longitude: newLng };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchActiveJob = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_details');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // ✅ FIX: Match the actual server.js route for provider bookings
        const response = await fetch(`${BASE_URL}/bookings/provider/${user._id}`);
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
          // ✅ FIX: Find the job that is either accepted or still pending
          const activeJob = data.find((b: any) => b.status === 'accepted' || b.status === 'pending');
          
          if (activeJob) {
            console.log("✅ Active Job Data Found:", activeJob);
            setBooking(activeJob);
          } else {
            console.log("No active job found in the list.");
          }
        }
      }
    } catch (error) {
      console.log("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (booking?.customerPhone) {
      Linking.openURL(`tel:${booking.customerPhone}`);
    } else {
      Alert.alert("Error", "Customer phone number not available.");
    }
  };

  const handleReachedDestination = () => {
    if (booking?._id) {
      // ✅ Navigating to the verification screen with the booking ID
      router.push(`/otp-verify?bookingId=${booking._id}`);
    } else {
      Alert.alert("Please Wait", "Still fetching job details...");
      fetchActiveJob();
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF9800" />
      <Text style={{marginTop: 10}}>Locating Customer...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 19.0730,
          longitude: 72.8740,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        <Marker coordinate={destination} title="Home">
          <Ionicons name="home" size={30} color="#008542" />
        </Marker>

        <Marker coordinate={markerPos} title="Professional">
          <Ionicons name="bicycle" size={35} color="#1E88E5" />
        </Marker>
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="person-circle" size={60} color="#FF9800" />
            <View style={styles.textContainer}>
              <Text style={styles.onWayText}>On the Way • {Math.round(eta)} mins</Text>
              <Text style={styles.nameText}>{booking?.customerName || "Customer"}</Text>
              <Text style={styles.phoneText}>+91 {booking?.customerPhone || "Not Found"}</Text>
              <Text style={styles.amountText}>Collect: ₹{booking?.amount || "0"}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleCall} 
              style={styles.callBtn}
            >
              <Ionicons name="call" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleReachedDestination}>
            <Text style={styles.btnText}>I have Reached Destination</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  overlay: { position: 'absolute', bottom: 0, width: '100%', padding: 15 },
  card: { backgroundColor: 'white', borderRadius: 30, padding: 20, elevation: 15, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  textContainer: { marginLeft: 15, flex: 1 },
  onWayText: { fontSize: 13, color: '#FF9800', fontWeight: 'bold', textTransform: 'uppercase' },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  phoneText: { fontSize: 16, color: '#666', marginTop: 2 },
  amountText: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold', marginTop: 4 },
  callBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 50, elevation: 5 },
  btn: { backgroundColor: '#FF9800', padding: 18, borderRadius: 15, alignItems: 'center', elevation: 3 },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});