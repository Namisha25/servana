import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, Image, TextInputProps, Alert 
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  iconSymbol: string;
}

const ResetPassword = () => {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    // Logic for password reset (e.g., Firebase sendPasswordResetEmail)
    Alert.alert("Success", "Password reset link sent to your email!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section matching your branding */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/609/609803.png' }} 
              style={styles.logoImage} 
            />
          </View>
          <Text style={styles.brandName}>Servana</Text>
          <Text style={styles.tagline}>✨ no stress no drama, ghar ka kaam with servana ✨</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a recovery link</Text>
        </View>

        {/* Form Field */}
        <View style={styles.form}>
          <InputField 
            label="Email address" 
            placeholder="Enter your email"
            iconSymbol="✉️"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(val: string) => setEmail(val)} // Explicit type to fix TS(7006)
          />

          {/* Styled Reset Button matching your Login page */}
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleReset}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity style={styles.backLink}>
            <Text style={styles.backText}>Back to Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Input with Icon Symbol to avoid "Module Not Found" errors
const InputField = ({ label, iconSymbol, ...props }: InputFieldProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Text style={styles.symbol}>{iconSymbol}</Text>
      <TextInput 
        style={styles.input} 
        placeholderTextColor="#999" 
        {...props} 
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFDE7' // Soft yellow background from your UI
  },
  scrollContent: { 
    padding: 25, 
    alignItems: 'center' 
  },
  header: { 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 30 
  },
  logoCircle: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoImage: { 
    width: 40, 
    height: 40 
  },
  brandName: { 
    fontSize: 42, 
    fontWeight: '900', 
    color: '#F57C00', // Orange brand color
    marginTop: 10 
  },
  tagline: { 
    fontSize: 11, 
    color: '#888', 
    fontStyle: 'italic',
    textAlign: 'center' 
  },
  titleSection: { 
    alignItems: 'center', 
    marginBottom: 25 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 5,
    textAlign: 'center' 
  },
  form: { 
    width: '100%' 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#444', 
    marginBottom: 8 
  },
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
  symbol: { 
    fontSize: 18, 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    height: '100%', 
    fontSize: 15, 
    color: '#333' 
  },
  button: { 
    backgroundColor: '#008542', // Green button color from your UI
    borderRadius: 15, 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 3
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  backText: {
    color: '#F57C00',
    fontWeight: '600',
    fontSize: 14
  }
});

export default ResetPassword;