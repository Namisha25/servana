import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Modal,
  Linking, // ✅ Required for opening documents
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

// --- INTERFACES ---
interface Provider {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  status: string;
  experienceYears: string;
  language: string;
  aadhaarDocName: string;
  videoIntroUrl?: string; 
  bankAccount?: string;   
  ifscCode?: string;      
}

interface Booking {
  _id: string;
  customerName: string;
  serviceType: string;
  address: string;
  amount: string;
  status: string;
  bookingDate: string;
}

interface Stats {
  accepted: number;
  pending: number;
  totalRevenue: number;
  serviceDemand: Array<{ _id: string; count: number }>;
}

type AdminTab = 'pending' | 'accepted' | 'rejected' | 'stats' | 'bookings';

export default function AdminHome() {
  const router = useRouter();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTab, setCurrentTab] = useState<AdminTab>('pending');

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ Updated to match your current IPv4 Address: 192.168.0.102
  const SERVER_IP = '192.168.0.102';
  const API_URL = `http://${SERVER_IP}:5000/api/admin`;

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  const fetchData = async () => {
    if (!refreshing) setLoading(true);
    try {
      let endpoint = '';
      if (currentTab === 'stats') endpoint = `${API_URL}/stats`;
      else if (currentTab === 'bookings') endpoint = `${API_URL}/bookings`;
      else endpoint = `${API_URL}/list/${currentTab}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (currentTab === 'stats') {
        setStats(data);
      } else if (currentTab === 'bookings') {
        setBookings(Array.isArray(data) ? data : []);
      } else {
        setProviders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      Alert.alert("Connection Error", `Ensure backend is running at ${API_URL}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`${API_URL}/approve/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setModalVisible(false);
        Alert.alert("Success", `Partner ${status}`);
        fetchData();
      }
    } catch (e) {
      Alert.alert("Error", "Update failed");
    }
  };

  // ✅ Function to open Aadhaar (Image or PDF) in the system browser
  const handleOpenDocument = (fileName: string) => {
    const url = `http://${SERVER_IP}:5000/uploads/${fileName}`;
    Linking.openURL(url).catch(err => {
      Alert.alert("Error", "Unable to open document. Check if the file exists on the server.");
    });
  };

  // --- RENDER FUNCTIONS ---

  const renderProvider = ({ item }: { item: Provider }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => { setSelectedProvider(item); setModalVisible(true); }}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.providerName}>{item.fullName}</Text>
        <Text style={styles.providerEmail}>{item.email}</Text>
        <View style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.serviceType}</Text>
          </View>
          <Text style={styles.viewDetailText}>View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.row}>
          <Text style={styles.providerName}>{item.serviceType}</Text>
          <Text style={styles.amountText}>₹{item.amount}</Text>
        </View>
        <Text style={styles.providerEmail}>Customer: {item.customerName}</Text>
        <Text style={styles.subText}>📍 {item.address}</Text>
        <View style={styles.bookingFooter}>
          <Text style={styles.subText}>📅 {item.bookingDate}</Text>
          <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.bookingStatusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Servana Admin</Text>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <View style={styles.chipWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {(['pending', 'accepted', 'rejected', 'bookings', 'stats'] as AdminTab[]).map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.chip, currentTab === tab && styles.chipActive]}
              onPress={() => setCurrentTab(tab)}
            >
              <Text style={[styles.chipText, currentTab === tab && styles.chipTextActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#F57C00" /></View>
      ) : (
        <View style={{ flex: 1 }}>
          {currentTab === 'stats' ? (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} style={{ padding: 20 }}>
               <View style={[styles.card, { backgroundColor: '#F1F8E9' }]}>
                  <Text style={{ color: '#558B2F' }}>Total Revenue</Text>
                  <Text style={styles.revenueText}>₹{stats?.totalRevenue || 0}</Text>
               </View>
               <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Demand Analysis</Text>
                  {stats?.serviceDemand.map((s, i) => (
                    <View key={i} style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 12 }}>{s._id}: {s.count}</Text>
                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${(s.count / (Math.max(...stats.serviceDemand.map(x => x.count)) || 1)) * 100}%` }]} />
                      </View>
                    </View>
                  ))}
               </View>
            </ScrollView>
          ) : (
            <FlatList
              data={(currentTab === 'bookings' ? bookings : providers) as any[]}
              keyExtractor={(item) => item._id}
              renderItem={(info) => {
                if (currentTab === 'bookings') {
                  return renderBooking({ item: info.item as Booking });
                }
                return renderProvider({ item: info.item as Provider });
              }}
              contentContainerStyle={styles.listContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          )}
        </View>
      )}

      {/* DETAIL MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verification Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProvider && (
                <>
                  <Text style={styles.sectionLabel}>Skill Introduction Video</Text>
                  {selectedProvider.videoIntroUrl ? (
                    <Video
                      style={styles.videoPlayer}
                      // ✅ Ensure the URI uses the latest server IP
                      source={{ uri: selectedProvider.videoIntroUrl.replace('10.26.245.202', SERVER_IP) }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                    />
                  ) : (
                    <View style={styles.noVideo}><Text>No video uploaded</Text></View>
                  )}

                  <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>Experience</Text>
                      <Text style={styles.infoValue}>{selectedProvider.experienceYears} Years</Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>Language</Text>
                      <Text style={styles.infoValue}>{selectedProvider.language}</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionLabel}>Banking Details</Text>
                  <View style={styles.bankCard}>
                    <Text style={styles.bankText}>A/C: {selectedProvider.bankAccount || 'N/A'}</Text>
                    <Text style={styles.bankText}>IFSC: {selectedProvider.ifscCode || 'N/A'}</Text>
                  </View>

                  <Text style={styles.sectionLabel}>Digital KYC (Aadhaar)</Text>
                  <TouchableOpacity 
                    style={styles.docLink} 
                    onPress={() => handleOpenDocument(selectedProvider.aadhaarDocName)}
                  >
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#D32F2F" />
                    <Text style={styles.docText}>Click to View Document</Text>
                  </TouchableOpacity>

                  {selectedProvider.status === 'pending' && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleUpdateStatus(selectedProvider._id, 'rejected')}>
                        <Text style={styles.btnTextWhite}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.approveBtn} onPress={() => handleUpdateStatus(selectedProvider._id, 'accepted')}>
                        <Text style={styles.btnTextWhite}>Approve Partner</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#F57C00' },
  logoutBtn: { padding: 8, backgroundColor: '#FFEBEE', borderRadius: 10 },
  chipWrapper: { height: 60 },
  chipContainer: { paddingHorizontal: 15, marginVertical: 10 },
  chip: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: '#FFECB3' 
  },
  chipActive: { backgroundColor: '#F57C00', borderColor: '#F57C00' },
  chipText: { fontSize: 11, color: '#666', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  listContainer: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, elevation: 2 },
  cardInfo: { flex: 1 },
  providerName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  providerEmail: { fontSize: 13, color: '#777', marginVertical: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontWeight: 'bold', color: '#2E7D32' },
  subText: { fontSize: 11, color: '#777' },
  badge: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#FFF3E0', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    marginTop: 5 
  },
  badgeText: { fontSize: 10, color: '#E65100', fontWeight: 'bold' },
  viewDetailText: { fontSize: 12, color: '#F57C00', fontWeight: 'bold' },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
  bookingStatusText: { fontSize: 10, color: '#1976D2', fontWeight: 'bold' },
  revenueText: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  progressBarBackground: { height: 6, backgroundColor: '#EEE', borderRadius: 3, marginTop: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#F57C00', borderRadius: 3 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    height: '85%' 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#F57C00', marginTop: 15, marginBottom: 8 },
  videoPlayer: { width: '100%', height: 200, backgroundColor: '#000', borderRadius: 12 },
  noVideo: { height: 100, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  infoBox: { flex: 0.48, backgroundColor: '#FFF9C4', padding: 12, borderRadius: 10 },
  infoLabel: { fontSize: 11, color: '#777' },
  infoValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  bankCard: { 
    backgroundColor: '#E8F5E9', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#C8E6C9' 
  },
  bankText: { fontSize: 14, fontWeight: '600', color: '#2E7D32', fontFamily: 'monospace' },
  docLink: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    borderStyle: 'dashed', 
    borderWidth: 1.5, 
    borderColor: '#008542' 
  },
  docText: { marginLeft: 10, color: '#008542', fontSize: 14, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 20 },
  approveBtn: { flex: 0.6, backgroundColor: '#008542', padding: 15, borderRadius: 12, alignItems: 'center' },
  rejectBtn: { flex: 0.35, backgroundColor: '#D32F2F', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnTextWhite: { color: '#fff', fontWeight: 'bold' }
});