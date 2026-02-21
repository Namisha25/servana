import React, { useState,useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Animated,Dimensions,Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentScreen() {
  const router = useRouter();
  const { serviceType } = useLocalSearchParams();

  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [details, setDetails] = useState({
    serviceName: "",
    planName: "",
    address: "",
    date: "",
    time: "", // ✅ ADDED: Time was missing from your state
    amount: "0"
  });

  useEffect(() => {
    const fetchFinalData = async () => {
      try {
        const data = await AsyncStorage.getItem('current_booking');
        if (data) {
          const parsedData = JSON.parse(data);
          
          const finalServiceName = serviceType 
            ? (Array.isArray(serviceType) ? serviceType[0] : serviceType) 
            : parsedData.serviceName;

          // ✅ FIX: Use fallbacks in case the keys are named differently in Storage
          setDetails({
            serviceName: finalServiceName || "Service",
            planName: parsedData.planName || "Standard",
            address: parsedData.address || "No address provided",
            // Look for 'date' OR 'bookingDate' OR 'selectedDate'
            date: parsedData.date || parsedData.bookingDate || parsedData.selectedDate || "Not scheduled",
            // Look for 'time' OR 'selectedTime'
            time: parsedData.time || parsedData.selectedTime || "Not set",
            amount: parsedData.amount || "0"
          });
          
          console.log("✅ Data Loaded:", parsedData);
        }
      } catch (error) {
        console.error("Error loading final booking data:", error);
      }
    };
    fetchFinalData();
  }, [serviceType]);

  const handleFinalPayment = () => {
    router.push({
      pathname: '/payment-success',
      params: { 
        serviceType: details.serviceName,
        // ✅ PASSING THE DATE AND TIME FORWARD
        dateString: details.date,
        timeString: details.time 
      }
    });
  };

 const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSunlight} />

      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backBtnCircle} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#451A03" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Final Payment</Text>
          <Text style={styles.headerSubtitle}>Secure Checkout</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* ORDER SUMMARY CARD */}
        <Animated.View style={[styles.luxuryCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.accentLine} />
            <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
          </View>
          
          {/* SERVICE HIGHLIGHT */}
          <View style={styles.serviceHighlight}>
            <View style={styles.serviceIconBg}>
                <MaterialCommunityIcons name="face-man-shimmer-outline" size={24} color="#A16207" />
            </View>
            <View>
                <Text style={styles.serviceLabel}>SELECTED SERVICE</Text>
                <Text style={styles.serviceValueText}>{details.serviceName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Tier</Text>
            <Text style={styles.value}>{details.planName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Commencement</Text>
            <Text style={styles.value}>{details.date}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Arrival Slot</Text>
            <Text style={[styles.value, {color: '#e9a13d'}]}>{details.time}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Location</Text>
            <Text style={[styles.value, styles.addressValue]} numberOfLines={2}>{details.address}</Text>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalPrice}>₹{Number(details.amount).toLocaleString()}</Text>
          </View>
        </Animated.View>

        {/* PAYMENT METHOD SELECTION */}
        <Animated.View style={[styles.luxuryCard, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.accentLine} />
            <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          </View>
          
          <View style={styles.methodGrid}>
            {['Card', 'UPI', 'Wallet', 'Net Banking'].map((method) => (
              <TouchableOpacity 
                key={method}
                activeOpacity={0.7}
                style={[styles.methodItem, selectedMethod === method && styles.methodSelected]}
                onPress={() => setSelectedMethod(method)}
              >
                <View style={[styles.radio, selectedMethod === method && styles.radioActive]}>
                    {selectedMethod === method && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.methodText, selectedMethod === method && styles.methodTextActive]}>{method}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedMethod === 'UPI' && (
            <TextInput 
                style={styles.input} 
                placeholder="VPA / UPI ID (e.g. name@upi)" 
                placeholderTextColor="#A8A29E"
            />
          )}
        </Animated.View>

        <View style={styles.secureBadge}>
          <Ionicons name="shield-checkmark" size={18} color="#15803D" />
          <Text style={styles.secureText}>PCI-DSS Compliant • Secure Transaction</Text>
        </View>

      </ScrollView>

      {/* FINAL ACTION BUTTON (GREEN) */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payBtn} 
          activeOpacity={0.9}
          onPress={handleFinalPayment}
        >
          <Text style={styles.payBtnText}>PAY ₹{Number(details.amount).toLocaleString()}</Text>
          <View style={styles.payIcon}>
            <Ionicons name="lock-closed" size={14} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF0' },
  topSunlight: { position: 'absolute', top: -120, left: -50, width:  + 100, height: 280, backgroundColor: '#feef4d', borderRadius: 150, opacity: 0.5 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 10 },
  backBtnCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  headerTextContainer: { marginLeft: 15 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#451A03' },
  headerSubtitle: { fontSize: 11, color: '#A16207', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  
  content: { padding: 20 },
  
  luxuryCard: { 
    backgroundColor: 'white', borderRadius: 30, padding: 24, marginBottom: 20,
    elevation: 5, shadowColor: '#EAB308', shadowOpacity: 0.15, shadowRadius: 15,
    borderWidth: 1, borderColor: '#FEF9C3'
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  accentLine: { width: 4, height: 16, backgroundColor: '#FACC15', borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#A16207', letterSpacing: 1.5 },
  
  // SERVICE HIGHLIGHT STYLE
  serviceHighlight: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  serviceIconBg: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFFDF0', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#FEF08A' },
  serviceLabel: { fontSize: 9, fontWeight: '800', color: '#78716C', letterSpacing: 0.5 },
  serviceValueText: { fontSize: 18, fontWeight: '700', color: '#451A03' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  label: { color: '#78716C', fontSize: 13, fontWeight: '500' },
  value: { fontWeight: '700', color: '#451A03', fontSize: 14 },
  addressValue: { maxWidth: '55%', textAlign: 'right', fontSize: 13 },
  
  divider: { height: 1, marginVertical: 15, borderStyle: 'dashed', borderWidth: 0.8, borderColor: '#FEF08A' },
  
  totalBox: { backgroundColor: '#FFFDF0', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#FEF08A' },
  totalLabel: { fontWeight: '800', fontSize: 14, color: '#451A03' },
  totalPrice: { fontWeight: '900', fontSize: 22, color: '#166534' },

  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  methodItem: { 
    width: '48%', padding: 16, borderWidth: 1, borderColor: '#FEF9C3', 
    borderRadius: 22, flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#FFFDF0' 
  },
  methodSelected: { backgroundColor: '#FACC15', borderColor: '#FACC15' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#A16207', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#0b2101', backgroundColor: 'white' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#70be03' },
  methodText: { fontSize: 12, fontWeight: '700', color: '#78716C' },
  methodTextActive: { color: '#451A03' },

  input: { backgroundColor: 'white', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#FDE047', marginTop: 5, color: '#451A03', fontWeight: '700' },
  
  secureBadge: { flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 15, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  secureText: { marginLeft: 10, color: '#166534', fontWeight: '700', fontSize: 11 },

  // GREEN FOOTER BUTTON
  footer: { padding: 25 },
  payBtn: { 
    backgroundColor: '#16A34A', padding: 22, borderRadius: 25, 
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    elevation: 8, shadowColor: '#16A34A', shadowOpacity: 0.4, shadowRadius: 15 
  },
  payBtnText: { color: 'white', fontWeight: '900', fontSize: 16, letterSpacing: 1.5 },
  payIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', marginLeft: 15, justifyContent: 'center', alignItems: 'center' }
});