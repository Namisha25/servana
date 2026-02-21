import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, Image, TextInputProps, Alert 
} from 'react-native';
import { useRouter } from "expo-router"; 

interface InputFieldProps extends TextInputProps {
  label: string;
  iconSymbol: string; 
}

const RegisterUser = () => {
  const router = useRouter(); 
  const [form, setForm] = useState({ 
    fullName: '', email: '', phone: '', password: '', confirmPassword: '' 
  });

  const handleSignUp = async () => {
    const { fullName, email, phone, password, confirmPassword } = form;

    if (!fullName || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch('http://192.168.0.102:5000/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
          fullName, 
          email, 
          phone, 
          password,
          role: 'User' 
        }),
      });

      // --- GUARDIAN LOGIC: Check if response is actually JSON ---
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        
        if (response.ok) {
          Alert.alert("Success", "Account created successfully!");
          router.replace("/"); 
        } else {
          Alert.alert("Registration Failed", data.message || "Something went wrong");
        }
      } else {
        // If server sends HTML (like the "Cannot POST" error), catch it here
        const errorText = await response.text();
        console.error("Server Error (HTML):", errorText);
        Alert.alert("Server Route Error", "The backend route '/api/register' was not found on the server. Please check your Express code.");
      }

    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server. Ensure your backend is running and you are on the same Wi-Fi.");
      console.error("Registration Trace:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/609/609803.png' }} 
              style={styles.logoImage} 
            />
          </View>
          <Text style={styles.brandName}>Servana</Text>
          <Text style={styles.tagline}>✨ Join us for hassle-free home services ✨</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started with Servana</Text>
        </View>

        <View style={styles.form}>
          <InputField 
            label="Full Name" 
            placeholder="Enter your full name"
            iconSymbol="👤"
            value={form.fullName}
            onChangeText={(val) => setForm({...form, fullName: val})} 
          />
          <InputField 
            label="Email Address" 
            placeholder="Enter your email"
            iconSymbol="✉️"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(val) => setForm({...form, email: val})} 
          />
          <InputField 
            label="Phone Number" 
            placeholder="+91 98765 43210"
            iconSymbol="📞"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(val) => setForm({...form, phone: val})} 
          />
          <InputField 
            label="Password" 
            placeholder="Create a password"
            iconSymbol="🔒"
            secureTextEntry 
            value={form.password}
            onChangeText={(val) => setForm({...form, password: val})} 
          />
          <InputField 
            label="Confirm Password" 
            placeholder="Confirm your password"
            iconSymbol="🔒"
            secureTextEntry 
            value={form.confirmPassword}
            onChangeText={(val) => setForm({...form, confirmPassword: val})} 
          />

          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={handleSignUp} 
          >
            <Text style={styles.buttonText}>🚀 Create Servana Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InputField = ({ label, iconSymbol, ...props }: InputFieldProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Text style={styles.symbolStyle}>{iconSymbol}</Text>
      <TextInput 
        style={styles.input} 
        placeholderTextColor="#999" 
        {...props} 
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7' },
  scrollContent: { padding: 25 },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logoCircle: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoImage: { width: 40, height: 40 },
  brandName: { fontSize: 40, fontWeight: '900', color: '#F57C00', marginTop: 10 },
  tagline: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  titleSection: { alignItems: 'center', marginVertical: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 55,
    paddingLeft: 15
  },
  symbolStyle: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#333' },
  button: { 
    backgroundColor: '#008542', 
    borderRadius: 15, 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 15 
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default RegisterUser;