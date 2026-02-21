import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ServiceManagement() {
  const router = useRouter();
  
  // ✅ Extracting amount and planDuration from local params
  // amount is now the verified "truth" from the database via otp-verify
  const { bookingId, amount, planDuration } = useLocalSearchParams();

  // ✅ Convert planDuration (e.g., "2") to total seconds for the countdown
  const totalSeconds = Number(planDuration || 1) * 3600; 
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  // Countdown Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if (secondsLeft === 0) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // End Service Logic
  const handleEndService = async () => {
    Alert.alert(
      "Finish Job",
      "Are you sure you have completed the service?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Completed", 
          onPress: async () => {
            try {
              // Calculate actual time spent: (Initial Time - Remaining Time)
              const timeSpent = totalSeconds - secondsLeft;

              const response = await fetch('http://192.168.0.102:5000/api/complete-service', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  bookingId, 
                  duration: formatTime(timeSpent) 
                }),
              });

              if (response.ok) {
                // ✅ Passing the database-verified 'amount' to the summary screen
                // This ensures "Total Earnings" on the next screen is not 0
                router.push({
                  pathname: "/service-summary",
                  params: { 
                    bookingId: bookingId,
                    duration: formatTime(timeSpent),
                    amount: amount 
                  }
                });
              }
            } catch (error) {
              Alert.alert("Error", "Failed to update status.");
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job In Progress</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={[
            styles.timerValue, 
            secondsLeft < 300 && { color: '#FF5252' }
          ]}>
            {formatTime(secondsLeft)}
          </Text>
        </View>

        {/* ✅ Display the verified plan value from DB */}
        <View style={styles.planInfo}>
           <Text style={styles.planText}>Verified Plan Amount: ₹{amount || "Loading..."}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Checklist</Text>
          <View style={styles.checkItem}>
            <Ionicons name="checkbox" size={24} color="#4CAF50" />
            <Text style={styles.checkText}>Arrived at location</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkbox" size={24} color="#4CAF50" />
            <Text style={styles.checkText}>OTP Verified from Database</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="square-outline" size={24} color="#CCC" />
            <Text style={styles.checkText}>Complete designated tasks</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.endBtn} onPress={handleEndService}>
          <MaterialIcons name="done-all" size={24} color="white" />
          <Text style={styles.endBtnText}>End Service</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  badge: { backgroundColor: '#FF5252', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  content: { padding: 20 },
  timerCard: { backgroundColor: '#212121', padding: 40, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  timerLabel: { color: '#AAA', fontSize: 14, marginBottom: 10, textTransform: 'uppercase' },
  timerValue: { color: 'white', fontSize: 48, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  planInfo: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  planText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 16 },
  section: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkText: { marginLeft: 10, fontSize: 16, color: '#555' },
  footer: { padding: 20, backgroundColor: 'white' },
  endBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  endBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }
});