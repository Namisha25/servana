import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ActivityIndicator, Alert, Linking 
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Booking {
  _id: string;
  status: string;
  amount: string;
  address: string;
  serviceType: string;
  providerId?: {
    fullName: string;
    phone: string;
  };
}

export default function LiveTracking() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(10);

  // ✅ Updated to match your server.js IP
  const BASE_URL = "http://192.168.0.102:5000/api"; 
  const destination = { latitude: 19.0760, longitude: 72.8777 }; 
  const [markerPos, setMarkerPos] = useState({ latitude: 19.0700, longitude: 72.8700 });

  // ✅ FIXED: Fetching specific booking by ID with populated providerId
  const fetchTrackingData = async () => {
    try {
      // We use the specific GET /api/bookings/:id route from your server.js
      const response = await fetch(`${BASE_URL}/bookings/${bookingId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBooking(data);
        // data.providerId will now contain fullName and phone due to .populate()
      } else {
        console.warn("Server Error:", data.message);
        Alert.alert("Error", "Booking references found");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Connection Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchTrackingData();
      
      // Simulation of movement
      const interval = setInterval(() => {
        setMarkerPos((prev) => {
          const latDiff = destination.latitude - prev.latitude;
          const lngDiff = destination.longitude - prev.longitude;

          if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
            clearInterval(interval);
            setEta(0);
            return destination;
          }

          const moveLat = prev.latitude + (latDiff * 0.05);
          const moveLng = prev.longitude + (lngDiff * 0.05);
          setEta((prevEta) => (prevEta > 1 ? prevEta - 0.5 : 0));
          return { latitude: moveLat, longitude: moveLng };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [bookingId]);

  const handleCall = () => {
    const phone = booking?.providerId?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Unavailable", "Professional contact details not found.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#008542" />
        <Text style={styles.loaderText}>Locating Professional...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 19.0730, longitude: 72.8740,
          latitudeDelta: 0.015, longitudeDelta: 0.015,
        }}
      >
        <Marker coordinate={destination}>
          <Ionicons name="home" size={30} color="#008542" />
        </Marker>
        
        <Marker coordinate={markerPos}>
          <Ionicons name="bicycle" size={35} color="#1E88E5" />
        </Marker>

        <Polyline coordinates={[markerPos, destination]} strokeColor="#008542" strokeWidth={3} />
      </MapView>
      
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="person-circle" size={65} color="#008542" />
            <View style={styles.textContainer}>
              <Text style={styles.statusText}>
                {eta > 0 ? `Professional En Route • ${Math.round(eta)} mins` : "Arrived"}
              </Text>
              <Text style={styles.nameText}>{booking?.providerId?.fullName || "Professional"}</Text>
              <Text style={styles.amountText}>To Pay: ₹{booking?.amount || "0"}</Text>
            </View>
            <TouchableOpacity onPress={handleCall} style={styles.callBtn}>
              <Ionicons name="call" size={26} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => router.push({
              pathname: "/start-service",
              params: { bookingId: booking?._id, amount: booking?.amount }
            })}
          >
            <Text style={styles.actionBtnText}>Service Details & OTP</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#666' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 50, elevation: 5 },
  overlay: { position: 'absolute', bottom: 0, width: '100%', padding: 15 },
  card: { backgroundColor: 'white', borderRadius: 30, padding: 20, elevation: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  textContainer: { flex: 1, marginLeft: 10 },
  statusText: { fontSize: 11, color: '#008542', fontWeight: 'bold' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  amountText: { fontSize: 15, color: '#2E7D32', fontWeight: 'bold', marginTop: 4 },
  callBtn: { backgroundColor: '#008542', padding: 14, borderRadius: 50 },
  actionBtn: { backgroundColor: '#008542', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 10 }
});