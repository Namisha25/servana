import React, { useState,useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform,Animated,Dimensions, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingDetails = () => {
  const router = useRouter();
  const { serviceType } = useLocalSearchParams();

  const [serviceName, setServiceName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState('2');
  const [address, setAddress] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [userInfo, setUserInfo] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user_details");
        if (userData) {
          const parsed = JSON.parse(userData);
          const user = parsed.user ? parsed.user : parsed;
          setUserInfo({
            fullName: user.fullName || "User",
            phone: user.phone || "N/A"
          });
        }
        if (serviceType) {
          setServiceName(Array.isArray(serviceType) ? serviceType[0] : serviceType);
        }
      } catch (error) {
        console.error("Error loading data", error);
      }
    };
    loadInitialData();
  }, [serviceType]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setTime(selectedTime);
  };

  const handleProceed = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Info", "Please enter a service address.");
      return;
    }

    const currentService = serviceType || serviceName || "General Service";

    // ✅ FIXED: Using keys that match Payment and Database logic
    const completeBookingData = {
      serviceName: currentService,
      customerName: userInfo.fullName,
      customerPhone: userInfo.phone,
      address: address,
      date: date.toLocaleDateString(), 
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${duration} Hours`,
    };

    try {
      await AsyncStorage.setItem('current_booking', JSON.stringify(completeBookingData));
      router.push({
        pathname: "/subscriptions-plans",
        params: { serviceType: currentService } 
      });
    } catch (error) {
      Alert.alert("Error", "Failed to save booking details.");
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 600, 
        useNativeDriver: true 
      })
    ]).start();

    // Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* CREATIVE BACKGROUND ELEMENTS */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backBtnGlass} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>✕</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.topKicker}>EXECUTIVE BOOKING</Text>
            <Text style={styles.mainTitle}>{serviceName || 'Bespoke Care'}</Text>
          </View>
        </Animated.View>

        {/* REIMAGINED SUMMARY BANNER */}
        <Animated.View style={[styles.summaryBanner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.summaryLabel}>CLIENT</Text>
            <Text style={styles.summaryValue}>{userInfo.fullName}</Text>
          </View>
          
          <View style={styles.statusContainer}>
             <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
             <Text style={styles.statusText}>CURRENT SLOT OPEN</Text>
          </View>
        </Animated.View>

        {/* SCHEDULE CARD */}
        <Animated.View style={[styles.luxuryCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardHeader}>SELECT YOUR SLOT 🕒</Text>
          
          <View style={styles.selectionRow}>
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.selectorLabel}>DATE</Text>
              <Text style={styles.selectorValue}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.selectorLabel}>START TIME</Text>
              <Text style={styles.selectorValue}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && <DateTimePicker value={date} mode="date" display="calendar" onChange={onDateChange} minimumDate={new Date()} />}
          {showTimePicker && <DateTimePicker value={time} mode="time" display="clock" is24Hour={false} onChange={onTimeChange} />}

          <View style={styles.durationSection}>
             <Text style={styles.selectorLabel}>DURATION</Text>
             <View style={styles.pickerWrapper}>
                <Picker selectedValue={duration} onValueChange={(v) => setDuration(v)} style={styles.pickerStyle} dropdownIconColor="#854D0E">
                  <Picker.Item label="2 Hours (Express)" value="2" />
                  <Picker.Item label="4 Hours (Standard)" value="4" />
                  <Picker.Item label="8 Hours (Elite)" value="8" />
                </Picker>
             </View>
          </View>
        </Animated.View>

        {/* LOCATION CARD */}
        <Animated.View style={[styles.luxuryCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardHeader}>📍DESTINATION</Text>
          <TextInput 
            style={styles.creativeInput} 
            placeholder="Service Address..." 
            placeholderTextColor="#A8A29E"
            multiline 
            value={address}
            onChangeText={setAddress}
          />
        </Animated.View>

        {/* GLOWING ACTION BUTTON */}
        <TouchableOpacity activeOpacity={0.9} style={styles.glowButton} onPress={handleProceed}>
          <Text style={styles.glowButtonText}>CONFIRM  BOOKING</Text>
          <View style={styles.buttonArrow}><Text style={{color: '#451A03'}}>➞</Text></View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF0' },
  
  // BACKGROUND SHAPES
  bgCircle1: {
    position: 'absolute', top: -50, right: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#fdf08e', opacity: 0.6
  },
  bgCircle2: {
    position: 'absolute', bottom: 100, left: -150,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: '#fee20e', opacity: 0.3
  },

  scrollContent: { padding: 25, paddingTop: 40 },
  
  // HEADER
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtnGlass: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
    borderWidth: 1, borderColor: '#FDE047', elevation: 3
  },
  backBtnText: { fontSize: 18, color: '#451A03' },
  topKicker: { fontSize: 10, fontWeight: '800', color: '#A16207', letterSpacing: 3 },
  mainTitle: { fontSize: 30, fontWeight: '300', color: '#451A03' },

  // BANNER WITH PULSE
  summaryBanner: {
    backgroundColor: '#451A03',
    padding: 22,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#451A03', shadowOpacity: 0.4, shadowRadius: 15, elevation: 10
  },
  summaryLabel: { color: '#FACC15', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  summaryValue: { color: '#FFFDF0', fontSize: 18, fontWeight: '600' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 8 },
  statusText: { color: '#4ADE80', fontSize: 9, fontWeight: '800' },

  // CARDS
  luxuryCard: { 
    backgroundColor: '#FFF', borderRadius: 30, padding: 25, marginBottom: 20,
    borderWidth: 1, borderColor: '#FEF08A',
    shadowColor: '#EAB308', shadowOpacity: 0.1, shadowRadius: 20, elevation: 4
  },
  cardHeader: { fontSize: 14, fontWeight: '900', color: '#A16207', letterSpacing: 2, marginBottom: 20 },
  selectionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateSelector: { 
    width: '48%', padding: 18, borderRadius: 22, backgroundColor: '#FFFDF0',
    borderWidth: 1, borderColor: '#FDE047' 
  },
  selectorLabel: { fontSize: 12, fontWeight: '800', color: '#A16207', marginBottom: 4 },
  selectorValue: { fontSize: 15, fontWeight: '700', color: '#451A03' },

  durationSection: { marginTop: 20 },
  pickerWrapper: { 
    marginTop: 10, backgroundColor: '#FFFDF0', borderRadius: 18, 
    borderWidth: 1, borderColor: '#FDE047', overflow: 'hidden' 
  },
  pickerStyle: { height: 55, color: '#451A03' },
  creativeInput: { fontSize: 16, color: '#451A03', padding: 10, minHeight: 90, textAlignVertical: 'top' },

  // BUTTON
  glowButton: { 
    backgroundColor: '#f1ad3f', height: 75, borderRadius: 25, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 15, shadowColor: '#FACC15', shadowOpacity: 0.5, shadowRadius: 20, elevation: 8
  },
  glowButtonText: { color: '#451A03', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  buttonArrow: { 
    width: 40, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.4)', 
    marginLeft: 15, justifyContent: 'center', alignItems: 'center' 
  }
});

export default BookingDetails;