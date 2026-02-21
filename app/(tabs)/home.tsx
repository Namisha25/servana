import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState({ 
    _id: "", 
    fullName: "User", 
    email: "", 
    phone: "Not Provided" 
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // ✅ FIX: Use 'user_details' to match index.tsx
        const jsonValue = await AsyncStorage.getItem('user_details');
        
        if (jsonValue !== null) {
          const parsedData = JSON.parse(jsonValue);
          const storedUser = parsedData.user ? parsedData.user : parsedData;
          const userId = storedUser._id;

          if (userId) {
            // 1. Show cached data immediately
            setUser({
              _id: userId,
              fullName: storedUser.fullName || "",
              email: storedUser.email || "",
              phone: storedUser.phone || ""
            });

            // 2. ✅ FIX: Fetch fresh data (phone number) from Database
            const response = await fetch(`http://192.168.0.102:5000/api/users/${userId}`);
            
            if (response.ok) {
              const dbUser = await response.json();
              const freshUser = {
                _id: dbUser._id,
                fullName: dbUser.fullName,
                email: dbUser.email,
                phone: dbUser.phone || "Not Provided"
              };

              setUser(freshUser);
              // Save the fresh data back to storage
              await AsyncStorage.setItem('user_details', JSON.stringify(freshUser));
            }
          }
        }
      } catch (e) {
        console.error("Home Refresh Error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_details');
    setModalVisible(false);
    router.replace("/");
  };

  const navigateToBooking = (serviceName: string) => {
    router.push({
      pathname: "/booking-details",
      params: { serviceType: serviceName } 
    });
  };

 return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>NICE TO HAVE YOU HERE</Text>
          {loading && !user?._id ? (
            <ActivityIndicator size="small" color="#EAB308" />
          ) : (
            <Text style={styles.userName}>{user?.fullName || "Guest"}</Text>
          )}
        </View>
        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.profileCircle} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.profileInitial}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "S"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* WELCOME MODULE */}
        <View style={styles.welcomeModuleContainer}>
          <View style={styles.welcomeAccentLine} />
          <Text style={styles.welcomeTitleText}>Welcome Home,</Text>
          <Text style={styles.welcomeSubText}>
            Please select a bespoke service below to begin your personalized care experience.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Bespoke Services</Text>

        {/* HORIZONTAL SERVICE CAROUSEL */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={300}
            decelerationRate="fast"
          >
            {/* Service 1: Nanny */}
            <View style={styles.luxuryCard}>
              <View style={styles.cardVisual}>
                <View style={styles.minimalIcon}><Text style={styles.yellowIconText}>🍼</Text></View>
                <Text style={styles.serviceNameText}>Nanny GoRound</Text>
                <Text style={styles.serviceDesc}>Curated childcare you can trust.</Text>
              </View>
              <TouchableOpacity 
                style={styles.bookButton} 
                onPress={() => navigateToBooking("Nanny GoRound")}
              >
                <Text style={styles.bookButtonText}>BOOK NOW</Text>
              </TouchableOpacity>
            </View>

            {/* Service 2: Maid */}
            <View style={styles.luxuryCard}>
              <View style={styles.cardVisual}>
                <View style={styles.minimalIcon}><Text style={styles.yellowIconText}>🧹</Text></View>
                <Text style={styles.serviceNameText}>Maid Easy</Text>
                <Text style={styles.serviceDesc}>Reliable home cleaning services.</Text>
              </View>
              <TouchableOpacity 
                style={styles.bookButton} 
                onPress={() => navigateToBooking("Maid Easy")}
              >
                <Text style={styles.bookButtonText}>BOOK NOW</Text>
              </TouchableOpacity>
            </View>

            {/* Service 3: Nurse */}
            <View style={styles.luxuryCard}>
              <View style={styles.cardVisual}>
                <View style={styles.minimalIcon}><Text style={styles.yellowIconText}>🩺</Text></View>
                <Text style={styles.serviceNameText}>Nurse With You</Text>
                <Text style={styles.serviceDesc}>Private, professional medical assistance.</Text>
              </View>
              <TouchableOpacity 
                style={styles.bookButton} 
                onPress={() => navigateToBooking("Nurse With You")}
              >
                <Text style={styles.bookButtonText}>BOOK NOW</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* TRUSTED VERIFICATION SECTION (Using Local Assets) */}
        <View style={styles.trustSection}>
            <Text style={styles.trustHeadline}>Verified. Trained. Top-rated.</Text>
            
            <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                    {/* Ensure these paths exist in your project */}
                    <Image source={require("../../assets/images/KYC.png")} style={styles.gridImage} />
                    <Text style={styles.gridText}>Digital KYC completed</Text>
                </View>
                <View style={styles.gridItem}>
                    <Image source={require("../../assets/images/check.png")} style={styles.gridImage} />
                    <Text style={styles.gridText}>Thorough background checks</Text>
                </View>
            </View>
            <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                    <Image source={require("../../assets/images/training.png")} style={styles.gridImage} />
                    <Text style={styles.gridText}>3-day professional training</Text>
                </View>
                <View style={styles.gridItem}>
                    <Image source={require("../../assets/images/star.png")} style={styles.gridImage} />
                    <Text style={styles.gridText}>4.8 Top Rated Experts</Text>
                </View>
            </View>

            <View style={styles.trustFooter}>
                <Text style={styles.trustFooterText}>India's most trusted quick service app</Text>
            </View>
        </View>

      </ScrollView>

      {/* PROFILE MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderIndicator} />
            <Text style={styles.modalTitle}>CLIENT PROFILE</Text>
            
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailText}>{user?.fullName || "Not Available"}</Text>
              
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailText}>{user?.email || "Not Available"}</Text>

               <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailText}>{user?.phone || "Not Available"}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>SIGN OUT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>RETURN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf7d3" },
  header: { 
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcomeLabel: { fontSize: 10, color: '#A16207', fontWeight: '700', letterSpacing: 2 },
  userName: { fontSize: 18, color: '#451A03', marginTop: 2, fontWeight: '700' }, // Small font as requested
  profileCircle: { 
    width: 38, height: 38, borderRadius: 19, 
    backgroundColor: '#FACC15', 
    justifyContent: 'center', alignItems: 'center'
  },
  profileInitial: { color: '#451A03', fontSize: 14, fontWeight: 'bold' },

  welcomeModuleContainer: { paddingHorizontal: 25, marginVertical: 20 },
  welcomeAccentLine: { width: 35, height: 3, backgroundColor: '#FACC15', marginBottom: 12 },
  welcomeTitleText: { color: '#451A03', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  welcomeSubText: { color: '#713F12', fontSize: 14, lineHeight: 20, maxWidth: '90%' },

  sectionTitle: { fontSize: 12, color: '#A16207', marginBottom: 15, marginLeft: 25, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  
  carouselContainer: { paddingLeft: 25, paddingRight: 25, paddingBottom: 40 },
  
  luxuryCard: { 
    width: 280, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16,
    padding: 24, 
    marginRight: 20, 
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FEF08A', 
    shadowColor: '#FDE047',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  cardVisual: { flex: 1 },
  minimalIcon: { marginBottom: 15 },
  yellowIconText: { fontSize: 28 },
  serviceNameText: { fontSize: 20, color: '#451A03', fontWeight: '700' },
  serviceDesc: { fontSize: 13, color: '#713F12', marginTop: 8, lineHeight: 18 },
  
  bookButton: { 
    marginTop: 25,
    backgroundColor: '#FEF9C3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FDE047'
  },
  bookButtonText: { color: '#854D0E', fontWeight: '800', fontSize: 11, letterSpacing: 1 },

  // TRUST SECTION
  trustSection: { padding: 25, backgroundColor: '#FFF', marginTop: 10, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  trustHeadline: { fontSize: 18, fontWeight: '800', color: '#451A03', marginBottom: 25 },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  gridItem: { width: '45%', alignItems: 'flex-start' },
  gridImage: { width: 90, height: 90, marginBottom: 10 }, // Ensures uniform yellow theme
  gridText: { fontSize: 13, color: '#713F12', fontWeight: '500', lineHeight: 18 },
  
  trustFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#FEF08A', paddingTop: 20 },
  trustFooterText: { fontSize: 24, fontWeight: '800', color: '#D1D5DB', lineHeight: 32 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(69, 26, 3, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFFDF0', padding: 30, alignItems: 'center', borderRadius: 24, borderWidth: 2, borderColor: '#FACC15' },
  modalHeaderIndicator: { width: 40, height: 4, backgroundColor: '#FDE047', borderRadius: 2, marginBottom: 25 },
  modalTitle: { fontSize: 14, fontWeight: '800', color: '#451A03', letterSpacing: 2, marginBottom: 25 },
  detailBox: { width: '100%', marginBottom: 25 },
  detailLabel: { fontSize: 10, color: '#A16207', fontWeight: '700', textTransform: 'uppercase' },
  detailText: { fontSize: 16, color: '#451A03', borderBottomWidth: 1, borderBottomColor: '#FEF08A', paddingBottom: 8, marginTop: 5, marginBottom: 15 },
  logoutButton: { width: '100%', padding: 15, backgroundColor: '#EAB308', alignItems: 'center', borderRadius: 12 },
  logoutText: { color: '#451A03', fontWeight: '800', fontSize: 13 },
  closeBtn: { marginTop: 20 },
  closeBtnText: { color: '#A16207', fontSize: 12, fontWeight: '600' }
})