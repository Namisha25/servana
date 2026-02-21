import React, { useState, useRef,useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,Animated,Dimensions, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubscriptionPlans = () => {
  const router = useRouter();
  const { serviceType } = useLocalSearchParams();

  const [selectedPlan, setSelectedPlan] = useState('Standard Plan');
  const [isPaused, setIsPaused] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [extraHours, setExtraHours] = useState(0);
  const [serviceName, setServiceName] = useState("");

  const plans = [
    { name: 'Basic Plan', price: 6000, hours: '4h/day max', popular: false },
    { name: 'Standard Plan', price: 9000, hours: '8h/day max', popular: true },
    { name: 'Premium Plan', price: 14000, hours: '12h/day max', popular: false }
  ];

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        if (serviceType) {
          setServiceName(Array.isArray(serviceType) ? serviceType[0] : serviceType);
        } else {
          const data = await AsyncStorage.getItem('current_booking');
          if (data) {
            const parsedData = JSON.parse(data);
            // ✅ Sync key names
            setServiceName(parsedData.serviceName || "Service");
          }
        }
      } catch (error) {
        console.error("Error loading booking details:", error);
      }
    };
    loadBookingData();
  }, [serviceType]);

  const currentPlanData = plans.find(p => p.name === selectedPlan);
  const totalPrice = (currentPlanData?.price || 0) + (extraHours * 500);

  // ✅ HELPER: Save to Storage (Used by both Proceed and Update)
  const saveSubscriptionData = async () => {
    try {
      const existingData = await AsyncStorage.getItem('current_booking');
      const bookingObj = existingData ? JSON.parse(existingData) : {};

      const finalBookingData = {
        ...bookingObj, // KEEPS: address, date, time, customerName, etc.
        serviceName: serviceName, // Ensure this key is consistent
        planName: selectedPlan,
        amount: totalPrice.toString(),
        extraHours: extraHours,
        status: 'pending'
      };

      await AsyncStorage.setItem('current_booking', JSON.stringify(finalBookingData));
      return finalBookingData;
    } catch (error) {
      console.error("Save Error:", error);
      return null;
    }
  };

  const handleProceedToPayment = async () => {
    const saved = await saveSubscriptionData();
    if (saved) {
      router.push({
        pathname: "/payment",
        params: { serviceType: serviceName } 
      });
    } else {
      Alert.alert("Error", "Could not save plan.");
    }
  };

  // ✅ FIXED: Now actually saves the updated hours/price to Storage
  const handleUpdate = async () => {
    const saved = await saveSubscriptionData();
    if (saved) {
      Alert.alert("Success", "Your subscription preferences have been updated!");
      setIsEditMode(false);
    }
  };

  
 const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, [isEditMode]); // Re-run subtle slide when toggling edit mode

  return (
    <SafeAreaView style={styles.container}>
      {/* Visual Decor Elements */}
      <View style={styles.bgGlow} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnCircle}>
            <Ionicons name="chevron-back" size={24} color="#451A03" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Membership Plans</Text>
            <Text style={styles.headerSubtitle}>{serviceName || "Premium Care Selection"}</Text>
          </View>
        </Animated.View>

        {/* Status & Action Card */}
        <Animated.View style={[styles.actionCard, { transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.statusLabel}>{isEditMode ? "CUSTOMIZING" : "CURRENT STATUS"}</Text>
            <Text style={styles.statusTitle}>{isEditMode ? "Tailor your plan" : (isPaused ? "Paused" : "Active Plan")}</Text>
            <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)} style={styles.editToggle}>
                <Text style={styles.editLink}>{isEditMode ? "Cancel Changes" : "Modify Subscription"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.pauseBtn, isPaused ? styles.resumeBtn : styles.pauseBtnActive]}
            onPress={() => setIsPaused(!isPaused)}
            activeOpacity={0.8}
          >
            <MaterialIcons name={isPaused ? "play-arrow" : "pause"} size={20} color="white" />
            <Text style={styles.pauseBtnText}>{isPaused ? "Resume" : "Pause"}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Customization Section (Animated Appearance) */}
        {isEditMode && (
            <Animated.View style={[styles.editSection, { opacity: fadeAnim }]}>
                <View style={{flex: 1}}>
                  <Text style={styles.editLabel}>Extra Hours</Text>
                  <Text style={styles.editSubLabel}>₹500 / hr additional</Text>
                </View>
                <View style={styles.counterRow}>
                    <TouchableOpacity onPress={() => setExtraHours(Math.max(0, extraHours - 1))} style={styles.counterBtn}>
                        <Feather name="minus" size={18} color="#451A03" />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{extraHours} hrs</Text>
                    <TouchableOpacity onPress={() => setExtraHours(extraHours + 1)} style={styles.counterBtn}>
                        <Feather name="plus" size={18} color="#451A03" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )}

        {/* Plan Cards */}
        <Text style={styles.planSectionHeading}>SELECT A TIER</Text>
        {plans.map((plan, index) => (
          <Animated.View key={plan.name} style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity 
              activeOpacity={0.9}
              disabled={!isEditMode && selectedPlan !== plan.name}
              style={[
                styles.planCard, 
                selectedPlan === plan.name ? styles.selectedCard : styles.unselectedCard,
                !isEditMode && selectedPlan !== plan.name && { opacity: 0.5 }
              ]}
              onPress={() => setSelectedPlan(plan.name)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>⭐ MOST CHOSEN</Text>
                </View>
              )}
              
              <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>🕒 {plan.hours} Session</Text>
                    </View>
                  </View>
                  {selectedPlan === plan.name && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
              </View>
              
              <Text style={styles.price}>
                ₹{plan.price.toLocaleString()}<Text style={styles.month}> /month</Text>
              </Text>
              
              <View style={styles.benefitList}>
                <Text style={styles.benefitText}>• Elite verified providers</Text>
                <Text style={styles.benefitText}>• 24/7 Priority Concierge</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Floating Final Button */}
        <TouchableOpacity 
          style={[styles.paymentBtn, isEditMode ? styles.updateBtn : styles.payBtnColor]} 
          activeOpacity={0.9}
          onPress={() => isEditMode ? handleUpdate() : handleProceedToPayment()}
        >
          <View style={styles.btnContent}>
            <Text style={styles.paymentBtnText}>
              {isEditMode ? "UPDATE MEMBERSHIP" : "PROCEED TO CHECKOUT"}
            </Text>
            <Text style={styles.btnPrice}>₹{totalPrice.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF0' },
  bgGlow: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: '#FEF9C3', opacity: 0.5 },
  scrollContent: { padding: 25, paddingBottom: 40 },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtnCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  titleContainer: { marginLeft: 15 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#451A03' },
  headerSubtitle: { color: '#A16207', fontSize: 12, fontWeight: '600', letterSpacing: 1 },

  // Action/Status Card
  actionCard: { backgroundColor: '#451A03', padding: 25, borderRadius: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, elevation: 10, shadowColor: '#451A03', shadowOpacity: 0.3, shadowRadius: 15 },
  editToggle: {
    marginTop: 8,
    paddingVertical: 4,
  },
  statusLabel: { color: '#FACC15', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  statusTitle: { color: 'white', fontSize: 20, fontWeight: '600', marginTop: 2 },
  editLink: { color: '#FACC15', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', marginTop: 8 },
  pauseBtn: { flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  pauseBtnActive: { backgroundColor: '#EF4444' }, 
  resumeBtn: { backgroundColor: '#22C55E' },    
  pauseBtnText: { color: 'white', fontWeight: '900', marginLeft: 6, fontSize: 11, textTransform: 'uppercase' },

  // Edit Section
  editSection: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#FEF08A' },
  editLabel: { fontSize: 14, fontWeight: '700', color: '#451A03' },
  editSubLabel: { fontSize: 11, color: '#A16207', marginTop: 2 },
  counterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF0', padding: 5, borderRadius: 15, borderWidth: 1, borderColor: '#FEF08A' },
  counterBtn: { backgroundColor: '#FACC15', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  counterText: { marginHorizontal: 15, fontWeight: '800', fontSize: 15, color: '#451A03' },

  // Plan Cards
  planSectionHeading: { fontSize: 10, fontWeight: '900', color: '#A16207', letterSpacing: 2, marginBottom: 15, marginLeft: 5 },
  planCard: { backgroundColor: 'white', borderRadius: 30, padding: 25, marginBottom: 18, elevation: 4, shadowColor: '#EAB308', shadowOpacity: 0.1, shadowRadius: 10 },
  unselectedCard: { borderWidth: 1, borderColor: '#FEF9C3' },
  selectedCard: { borderColor: '#FACC15', borderWidth: 2 },
  popularBadge: { backgroundColor: '#FACC15', position: 'absolute', top: -12, left: 25, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  popularText: { color: '#451A03', fontSize: 9, fontWeight: '900' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 20, fontWeight: '700', color: '#451A03' },
  checkCircle: { backgroundColor: '#FACC15', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  price: { fontSize: 28, fontWeight: '700', marginTop: 15, color: '#451A03' },
  month: { fontSize: 14, fontWeight: '400', color: '#713F12' },
  tag: { backgroundColor: '#FFFDF0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start', marginTop: 5, borderWidth: 1, borderColor: '#FEF08A' },
  tagText: { fontSize: 10, color: '#A16207', fontWeight: '800' },
  benefitList: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#FFFDF0' },
  benefitText: { fontSize: 12, color: '#713F12', marginBottom: 6, fontWeight: '500' },

  // Footer Button
  paymentBtn: { padding: 22, borderRadius: 25, marginTop: 10, elevation: 8, shadowColor: '#FACC15', shadowOpacity: 0.4, shadowRadius: 15 },
  payBtnColor: { backgroundColor: '#f1ad3fs' },
  updateBtn: { backgroundColor: '#451A03' },
  btnContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentBtnText: { color: '#451A03', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  btnPrice: { color: '#451A03', fontSize: 18, fontWeight: '800' }
});

export default SubscriptionPlans;