import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, 
  TouchableOpacity, Alert, SafeAreaView, Linking, ScrollView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';


const AssignProvider = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); 

  const [isLoading, setIsLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // ✅ Your Current Server Configuration
  const SERVER_IP = '192.168.0.102';
  const BASE_URL = `http://${SERVER_IP}:5000`;

  const getParam = (val: string | string[] | undefined): string => {
    if (!val) return "";
    return Array.isArray(val) ? val[0] : val;
  };

  const serviceType = getParam(params.serviceType);
  const address = getParam(params.address);
  const customerName = getParam(params.customerName);
  const customerPhone = getParam(params.customerPhone);
  const amount = getParam(params.amount);
  const planName = getParam(params.planName);
  const dateString = getParam(params.dateString);

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async (excludeId?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/assign-provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: serviceType || "General",
          customerName,
          customerPhone,
          address,
          amount: amount || "0",
          planName: planName || "Standard",
          dateString,
          excludeId: excludeId 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProvider(data.provider);
        setBookingId(data.bookingId);
      } else {
        Alert.alert("Availability Update", data.message || "No other professionals found.");
        if (!excludeId) router.replace('/home');
      }
    } catch (error) {
      Alert.alert("Error", "Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    Alert.alert(
      "Reject Professional?",
      "Would you like us to find another expert for you?",
      [
        { text: "Keep Current", style: "cancel" },
        { 
          text: "Find Another", 
          style: "destructive",
          onPress: () => fetchProvider(provider._id) 
        }
      ]
    );
  };

  const makeCall = () => {
    if (provider?.phone) Linking.openURL(`tel:${provider.phone}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Searching for {serviceType} Specialists...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Professional Matched!</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.providerCard}>
            
            {/* ✅ FIXED: Skill Verification Video with IP Patch */}
            {provider?.videoIntroUrl && (
              <View style={styles.videoWrapper}>
                <Text style={styles.videoTag}>Verification Video</Text>
                <Video
                  // We use .replace() to ensure the video points to your current laptop IP
                  source={{ 
                    uri: provider.videoIntroUrl.replace('10.26.245.202', SERVER_IP) 
                  }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  useNativeControls
                  style={styles.videoPlayer}
                  onError={(err) => console.log("Video Playback Error:", err)}
                />
              </View>
            )}
            
            <Text style={styles.providerName}>{provider?.fullName}</Text>
            <Text style={styles.providerService}>{serviceType} Expert</Text>
            
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD600" />
              <Text style={styles.ratingText}>4.9 | {provider?.experienceYears || 5}+ yrs exp</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.communicationRow}>
              <TouchableOpacity style={[styles.commBtn, styles.callBtn]} onPress={makeCall}>
                  <Ionicons name="call" size={20} color="white" />
                  <Text style={styles.commBtnText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.commBtn, styles.rejectBtn]} onPress={handleReject}>
                  <Ionicons name="close-circle" size={20} color="#D32F2F" />
                  <Text style={[styles.commBtnText, {color: '#D32F2F'}]}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusBox}>
             <Ionicons name="shield-checkmark" size={20} color="#2E7D32" />
             <Text style={styles.statusText}>Background Checked & Verified</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.trackingBtn} 
            onPress={() => {
              if (bookingId) {
                router.push({
                  pathname: '/live-tracking',
                  params: { bookingId: bookingId }
                });
              }
            }}
          >
            <Text style={styles.trackingBtnText}>Accept & Track Live</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignProvider;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBE6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, fontSize: 16, color: '#666' },
  header: { padding: 20, alignItems: 'center', paddingTop: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20' },
  content: { paddingHorizontal: 20 },
  providerCard: { 
    backgroundColor: 'white', 
    borderRadius: 25, 
    padding: 20, 
    alignItems: 'center',
    elevation: 4,
  },
  videoWrapper: { width: '100%', height: 200, borderRadius: 15, overflow: 'hidden', marginBottom: 15, backgroundColor: '#000' },
  videoPlayer: { width: '100%', height: '100%' },
  videoTag: { position: 'absolute', top: 10, right: 10, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 10, padding: 4, borderRadius: 4 },
  providerName: { fontSize: 20, fontWeight: 'bold' },
  providerService: { fontSize: 14, color: '#FF9800', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  ratingText: { marginLeft: 5, color: '#666' },
  divider: { width: '100%', height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  communicationRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  commBtn: { flex: 0.48, flexDirection: 'row', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  callBtn: { backgroundColor: '#4CAF50' },
  rejectBtn: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' },
  commBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  statusBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  statusText: { marginLeft: 8, color: '#2E7D32', fontWeight: '500' },
  footer: { padding: 20, marginTop: 20 },
  trackingBtn: { backgroundColor: '#FF9800', padding: 18, borderRadius: 15, alignItems: 'center' },
  trackingBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});