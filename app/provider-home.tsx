import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Switch, Alert, RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ProviderHome() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [providerName, setProviderName] = useState("");

  // ✅ Matches your laptop's current Wi-Fi IP
  const BASE_URL = "http://192.168.0.102:5000/api";

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_details');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setProviderName(user.fullName || "Professional");
        // Pass the MongoDB _id to the fetch function
        fetchIncomingRequest(user._id);
      } else {
        setLoading(false);
        router.replace('/'); 
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const fetchIncomingRequest = async (id: string) => {
    try {
      // ✅ FIX: Updated route to match server.js (/api/bookings/provider/:id)
      const response = await fetch(`${BASE_URL}/bookings/provider/${id}`);
      if (response.ok) {
        const data = await response.json();
        
        // ✅ FIX: server.js returns an ARRAY. We take the first 'pending' booking.
        if (Array.isArray(data) && data.length > 0) {
          const activeRequest = data.find((b: any) => b.status === 'pending');
          console.log("📡 Active Booking Found:", activeRequest);
          setBooking(activeRequest || null);
        } else {
          setBooking(null);
        }
      }
    } catch (error) {
      console.log("Fetch Error: Check if server is running at " + BASE_URL);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProviderData();
  };

  const handleAcceptJob = async () => {
    if (!booking?._id) return;
    try {
      // ✅ FIX: Updated to a generic update or specific accept route if you add one later
      // For now, we use verify-service-otp logic or similar status update
      // Since your server.js uses /api/verify-service-otp, we'll navigate to the OTP screen
      router.push({
        pathname: '/job-active',
        params: { bookingId: booking._id }
      });
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  const handleDeclineJob = async () => {
    // UI logical decline (simply hide it for now as server doesn't have a specific decline route yet)
    setBooking(null);
    Alert.alert("Job Declined", "Request removed from your view.");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_details');
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 10 }}>Syncing Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.greetingText}>Hello, {providerName}! 👋</Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={[styles.statusText, { color: isOnline ? '#4CAF50' : '#F44336' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch value={isOnline} onValueChange={setIsOnline} />
          <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isOnline && booking ? (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
                <Text style={styles.headingLabel}>New Service Request</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{booking.status.toUpperCase()}</Text></View>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.serviceTitle}>{booking.serviceType}</Text>
              <Text style={styles.price}>₹{booking.amount || "0"}</Text>
            </View>
            
            <Text style={styles.planName}>{booking.planName || "Standard Plan"}</Text>
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Customer Details</Text>

            <View style={styles.detailRow}>
              <Ionicons name="person" size={18} color="#FF9800" />
              <View style={styles.textWrapper}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{booking.customerName}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="call" size={18} color="#FF9800" />
              <View style={styles.textWrapper}>
                <Text style={styles.detailLabel}>Contact</Text>
                <Text style={styles.detailValue}>{booking.customerPhone}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location" size={18} color="#FF9800" />
              <View style={styles.textWrapper}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{booking.address}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={handleDeclineJob}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={handleAcceptJob}>
                <Text style={styles.acceptText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clock-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>
              {isOnline ? "Waiting for new requests...\n(Pull down to refresh)" : "Go online to see requests"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', elevation: 2, paddingTop: 50 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  greetingText: { fontSize: 14, color: '#666' },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: 'bold', marginRight: 5 },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headingLabel: { fontSize: 12, fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  badge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#EF6C00', fontSize: 10, fontWeight: 'bold' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  price: { fontSize: 24, color: '#2E7D32', fontWeight: 'bold' },
  planName: { color: '#FF9800', fontWeight: '600', marginTop: 4, fontSize: 16 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  textWrapper: { marginLeft: 15, flex: 1 },
  detailLabel: { fontSize: 11, color: '#AAA', textTransform: 'uppercase', fontWeight: 'bold' },
  detailValue: { fontSize: 15, color: '#444', marginTop: 2, fontWeight: '500' },

  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  btn: { flex: 0.48, padding: 16, borderRadius: 15, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#FF9800' },
  declineBtn: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  acceptText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  declineText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 },
  
  emptyContainer: { alignItems: 'center', marginTop: 120 },
  emptyText: { marginTop: 15, color: '#888', textAlign: 'center', lineHeight: 20 }
});