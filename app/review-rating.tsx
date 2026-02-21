import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReviewRating() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Wait", "Please select a star rating before submitting.");
      return;
    }

    // Optional: You could save the review to your backend here
    Alert.alert("Thank You!", "Your feedback has been submitted.");
    
    // Clear the current booking data since the service is over
    await AsyncStorage.removeItem('current_booking');
    
    // Redirect back to the main Home tab
    router.replace("/(tabs)/home");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout", 
      "Are you sure you want to logout?", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            // Clear all user data and booking data
            await AsyncStorage.clear(); 
            router.replace("/"); // Go back to Login/Welcome screen
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="ribbon-outline" size={50} color="#008542" />
        </View>

        <Text style={styles.title}>Service Completed!</Text>
        <Text style={styles.subtitle}>How would you rate your experience with the professional?</Text>

        {/* Star Rating System */}
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Ionicons 
                name={s <= rating ? "star" : "star-outline"} 
                size={45} 
                color={s <= rating ? "#FFD700" : "#CBD5E0"} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment Box */}
        <TextInput
          style={styles.input}
          placeholder="What did you like (or dislike)? (Optional)"
          multiline
          value={comment}
          onChangeText={setComment}
          placeholderTextColor="#999"
        />

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmitReview}
          >
            <Text style={styles.submitText}>Submit & Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { textAlign: 'center', color: '#666', marginTop: 10, marginBottom: 30, lineHeight: 22 },
  starRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  input: { 
    width: '100%', 
    height: 120, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 15, 
    padding: 15, 
    textAlignVertical: 'top', 
    backgroundColor: '#F8FAFC',
    fontSize: 16
  },
  buttonGroup: { width: '100%', marginTop: 30, gap: 15 },
  submitBtn: { 
    backgroundColor: '#008542', 
    width: '100%', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    shadowColor: '#008542',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3
  },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { 
    flexDirection: 'row',
    width: '100%', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30'
  },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', marginLeft: 8 },
});