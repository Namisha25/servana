import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceSummary() {
  const router = useRouter();
  
  // ✅ 1. Extract database-verified amount from Service Management
  const { bookingId, duration, amount } = useLocalSearchParams();

  // ✅ 2. Convert to Number to handle financial calculations
  const totalAmount = Number(amount || 0);
  
  // ✅ 3. Financial breakdown (Matches the logic requested)
  const platformFeeRate = 0.10; // 10% commission
  const commission = totalAmount * platformFeeRate;
  const takeHomePay = totalAmount - commission;

  const handleFinish = () => {
    // Navigate back to the main dashboard and clear the stack
    router.replace('/provider-home'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successHeader}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.title}>Service Completed</Text>
          <Text style={styles.subtitle}>Your earnings have been processed</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{duration || "00:00:00"}</Text>
          </View>
          <View style={[styles.statBox, styles.borderLeft]}>
            <Text style={styles.statLabel}>Total Pay</Text>
            {/* Display verified amount directly from server response */}
            <Text style={styles.statValue}>₹{totalAmount}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Earnings Breakdown</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Base Plan Amount</Text>
            <Text style={styles.value}>₹{totalAmount}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Platform Fee (10%)</Text>
            <Text style={[styles.value, { color: '#F44336' }]}>- ₹{commission.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Your Take-Home</Text>
            <Text style={styles.totalValue}>₹{takeHomePay.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={18} color="#666" />
          <Text style={styles.noteText}>
            Earnings will be reflected in your wallet within 24 hours.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 25, alignItems: 'center' },
  successHeader: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#777' },
  statsRow: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 15, marginBottom: 25, width: '100%' },
  statBox: { flex: 1, padding: 20, alignItems: 'center' },
  borderLeft: { borderLeftWidth: 1, borderLeftColor: '#EEE' },
  statLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginTop: 5 },
  card: { 
    width: '100%', 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    padding: 20, 
    borderWidth: 1, // ✅ FIXED: Corrected from borderWeight
    borderColor: '#EEE',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#666' },
  value: { fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  noteBox: { flexDirection: 'row', marginTop: 20, alignItems: 'center', paddingHorizontal: 10 },
  noteText: { marginLeft: 8, fontSize: 12, color: '#888', fontStyle: 'italic' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  button: { backgroundColor: '#FF9800', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});