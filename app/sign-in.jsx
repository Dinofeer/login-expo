import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useSession();
  const router = useRouter();

  const handleLogin = () => {
    console.log("🔍 Intentando iniciar sesión con:", `"${email}"`, `"${password}"`);

    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    const emailNormalized = email.trim().toLowerCase();
    const passwordNormalized = password.trim();

    
    if (emailNormalized === "usuario@ejemplo.com" && passwordNormalized === "password123") {
      console.log(" Credenciales correctas, guardando sesión...");

      const success = signIn(email, password);
      
      if (success) {
        
        Alert.alert("Éxito", "Inicio de sesión correcto", [
          { text: "OK", onPress: () => router.replace('/') } //
        ]);
      } else {
        
        Alert.alert("Error", "No se pudo guardar la sesión");
      }
    } else {
      
      Alert.alert("Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor="#666"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#666"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button title="Ingresar" onPress={handleLogin} color="#007bff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', 
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});
