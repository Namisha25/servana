import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ProviderReviewDetail() {
  const { id } = useLocalSearchParams(); // Grabs the MongoDB _id from the URL
  const router = useRouter();
  
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch details on page load ---
  useEffect(() => {
    if (id) fetchProviderDetails();
  }, [id]);

  const fetchProviderDetails = async () => {
    try {
      // Matches your backend route: GET /api/admin/provider/:id
      const response = await fetch(`http://192.168.0.102:5000/api/admin/provider/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProvider(data);
      } else {
        Alert.alert("Error", "Provider details not found.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handle Admin Decision ---
  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    try {
      // Matches your backend route: PATCH /api/admin/approve/:id
      const response = await fetch(`http://192.168.0.102:5000/api/admin/approve/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        Alert.alert(
          "Success", 
          `Provider application has been ${status}.`,
          [{ text: "OK", onPress: () => router.replace("/admin-home") }]
        );
      } else {
        Alert.alert("Error", "Failed to update status.");
      }
    } catch (error) {
      Alert.alert("Error", "Check your internet connection.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F57C00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Personal Identity Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>BASIC INFORMATION</Text>
          
          <DetailRow label="Full Name" value={provider?.fullName} />
          <DetailRow label="Email Address" value={provider?.email} />
          <DetailRow label="Phone Number" value={provider?.phone} />
        </View>

        {/* Professional Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SERVICE DETAILS</Text>
          
          <DetailRow label="Service Type" value={provider?.serviceType} isHighlight />
          <DetailRow label="Work Experience" value={`${provider?.experienceYears || 0} Years`} />
          <DetailRow label="Native Language" value={provider?.language} />
        </View>

        {/* Verification Documents Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>DOCUMENTS PROVIDED</Text>
          <View style={styles.docRow}>
            <Text style={styles.docLabel}>Aadhaar Card (PDF/Image):</Text>
            <Text style={styles.docValue}>📄 {provider?.aadhaarDocName || "No file uploaded"}</Text>
          </View>
        </View>

        {/* Final Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]} 
            onPress={() => handleUpdateStatus("accepted")}
          >
            <Text style={styles.btnText}>APPROVE PROVIDER</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]} 
            onPress={() => handleUpdateStatus("rejected")}
          >
            <Text style={styles.btnText}>REJECT APPLICATION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Custom Component for clean data display
const DetailRow = ({ label, value, isHighlight }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, isHighlight && styles.highlightText]}>
      {value || "Not provided"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDE7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 20, 
    backgroundColor: "white",
    elevation: 3 
  },
  backBtn: { padding: 5 },
  backText: { color: "#F57C00", fontWeight: "bold", fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#333" },
  scrollContent: { padding: 20 },
  card: { 
    backgroundColor: "white", 
    borderRadius: 15, 
    padding: 20, 
    marginBottom: 20, 
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#F57C00"
  },
  cardHeader: { fontSize: 12, fontWeight: "bold", color: "#999", marginBottom: 15, letterSpacing: 1 },
  detailRow: { marginBottom: 15 },
  label: { fontSize: 12, color: "#777", textTransform: "uppercase" },
  value: { fontSize: 17, fontWeight: "600", color: "#333", marginTop: 2 },
  highlightText: { color: "#F57C00", fontWeight: "900" },
  docRow: { marginTop: 5 },
  docLabel: { fontSize: 14, color: "#333", fontWeight: "500" },
  docValue: { fontSize: 14, color: "#007BFF", marginTop: 5, fontWeight: "bold" },
  actionContainer: { marginTop: 10, paddingBottom: 30 },
  actionBtn: { 
    height: 60, 
    borderRadius: 15, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 15,
    elevation: 4
  },
  approveBtn: { backgroundColor: "#008542" },
  rejectBtn: { backgroundColor: "#D32F2F" },
  btnText: { color: "white", fontSize: 16, fontWeight: "bold", letterSpacing: 1 }
});