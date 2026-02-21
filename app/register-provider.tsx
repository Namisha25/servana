import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { useRouter } from "expo-router";
import * as DocumentPicker from 'expo-document-picker'; 
import * as ImagePicker from 'expo-image-picker'; 
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterProvider() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    fullName: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    serviceType: 'Nanny GoRound',
    experienceYears: '',
    language: 'English', 
    aadhaarDoc: null as any,
    videoIntro: null as any,
    bankAccount: '',
    ifscCode: ''
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        // ✅ Allows both PDF and Images for Aadhaar
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setForm({ ...form, aadhaarDoc: result.assets[0] });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const pickVideo = async (fromCamera: boolean) => {
    const { status } = fromCamera 
      ? await ImagePicker.requestCameraPermissionsAsync() 
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera/Gallery access is required.");
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['videos'], 
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 30, 
    };

    const result = fromCamera 
      ? await ImagePicker.launchCameraAsync(options) 
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setForm({ ...form, videoIntro: result.assets[0] });
    }
  };

  const handleSignUp = async () => {
    const { 
        fullName, email, phone, password, confirmPassword, 
        aadhaarDoc, videoIntro, bankAccount, ifscCode,
        serviceType, experienceYears, language 
    } = form;

    if (!fullName || !email || !phone || !aadhaarDoc || !videoIntro || !bankAccount || !ifscCode || !password) {
      Alert.alert("Missing Info", "Please fill all fields and upload required KYC documents.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('serviceType', serviceType);
    formData.append('experienceYears', experienceYears || "0");
    formData.append('language', language); 
    formData.append('bankAccount', bankAccount);
    formData.append('ifscCode', ifscCode);
    formData.append('role', 'Provider');

    if (videoIntro) {
        const videoUri = Platform.OS === 'android' ? videoIntro.uri : videoIntro.uri.replace('file://', '');
        formData.append('video', {
          uri: videoUri,
          name: videoIntro.fileName || `video_${Date.now()}.mp4`,
          type: 'video/mp4',
        } as any);
    }

    if (aadhaarDoc) {
        const docUri = Platform.OS === 'android' ? aadhaarDoc.uri : aadhaarDoc.uri.replace('file://', '');
        formData.append('aadhaar', {
          uri: docUri,
          name: aadhaarDoc.name || `aadhaar_${Date.now()}.${docUri.split('.').pop()}`,
          type: aadhaarDoc.mimeType || 'application/pdf',
        } as any);
    }

    try {
      // Using your local server IP (ensure this is correct)
      const response = await fetch('http://192.168.0.102:5000/api/register', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Registration Sent", "KYC documents and video are submitted for Admin review.", [
          { text: "Go to Login", onPress: () => router.replace("/") }
        ]);
      } else {
        Alert.alert("Failed", data.message || "Something went wrong.");
      }
    } catch (error: any) {
      Alert.alert("Network Error", "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFDE7' }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Partner Registration</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Full Name (As per Aadhaar)</Text>
          <TextInput placeholder="Full name" style={styles.input} onChangeText={(val) => setForm({...form, fullName: val})} />
          
          <Text style={styles.label}>Email & Phone</Text>
          <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" keyboardType="email-address" onChangeText={(val) => setForm({...form, email: val})} />
          <TextInput placeholder="Phone" style={styles.input} keyboardType="phone-pad" onChangeText={(val) => setForm({...form, phone: val})} />

          {/* ✅ Language Field */}
          <Text style={styles.label}>Primary Language</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.language} onValueChange={(val) => setForm({...form, language: val})}>
              <Picker.Item label="English" value="English" />
              <Picker.Item label="Hindi" value="Hindi" />
              <Picker.Item label="Marathi" value="Marathi" />
              <Picker.Item label="Bengali" value="Bengali" />
              <Picker.Item label="Tamil/Telugu" value="South Indian" />
            </Picker>
          </View>

          <Text style={styles.label}>Experience & Specialization</Text>
          <TextInput placeholder="Years of Experience" style={styles.input} keyboardType="numeric" onChangeText={(val) => setForm({...form, experienceYears: val})} />
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.serviceType} onValueChange={(val) => setForm({...form, serviceType: val})}>
              <Picker.Item label="Nanny GoRound" value="Nanny GoRound" />
              <Picker.Item label="Maid Easy" value="Maid Easy" />
              <Picker.Item label="Nurse With You" value="Nurse With You" />
            </Picker>
          </View>

          <Text style={styles.label}>Skill Verification Video</Text>
          <View style={styles.videoActionRow}>
            <TouchableOpacity style={[styles.videoSubBtn, form.videoIntro && styles.uploaded]} onPress={() => pickVideo(true)}>
              <Ionicons name="videocam" size={18} color="#008542" />
              <Text style={styles.videoSubBtnText}>{form.videoIntro ? "Re-record" : "Record"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.videoSubBtn, form.videoIntro && styles.uploaded]} onPress={() => pickVideo(false)}>
              <Ionicons name="images" size={18} color="#008542" />
              <Text style={styles.videoSubBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Digital KYC Aadhaar Section */}
          <Text style={styles.label}>Digital KYC (Aadhaar Card)</Text>
          <TouchableOpacity style={[styles.uploadButton, form.aadhaarDoc ? styles.uploaded : null]} onPress={pickDocument}>
            <MaterialCommunityIcons name="shield-account" size={22} color="#008542" />
            <Text style={styles.uploadButtonText}>
              {form.aadhaarDoc ? `✅ ${form.aadhaarDoc.name}` : "Upload Aadhaar (PDF/Image)"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Banking & Password</Text>
          <TextInput placeholder="Bank Account Number" style={styles.input} onChangeText={(val) => setForm({...form, bankAccount: val})} />
          <TextInput placeholder="IFSC Code" style={styles.input} autoCapitalize="characters" onChangeText={(val) => setForm({...form, ifscCode: val})} />
          <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={(val) => setForm({...form, password: val})} />
          <TextInput placeholder="Confirm Password" style={styles.input} secureTextEntry onChangeText={(val) => setForm({...form, confirmPassword: val})} />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}> 
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Submit Application</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 25 },
  title: { fontSize: 24, fontWeight: '900', color: '#F57C00', textAlign: 'center', marginBottom: 20 },
  formSection: { marginBottom: 10 },
  label: { fontSize: 13, color: '#F57C00', fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#FFECB3', padding: 15, marginBottom: 10, borderRadius: 12, backgroundColor: '#fff' },
  pickerContainer: { borderWidth: 1, borderColor: '#FFECB3', borderRadius: 12, backgroundColor: '#fff', marginBottom: 10 },
  videoActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  videoSubBtn: { flex: 0.48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#008542', borderStyle: 'dashed', padding: 12, borderRadius: 12 },
  videoSubBtnText: { color: '#008542', fontWeight: 'bold', marginLeft: 8 },
  uploadButton: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 2, borderColor: '#008542', borderStyle: 'dashed', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  uploaded: { backgroundColor: '#E8F5E9', borderStyle: 'solid' },
  uploadButtonText: { color: '#008542', fontWeight: 'bold', marginLeft: 10 },
  button: { backgroundColor: '#008542', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 4, marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});