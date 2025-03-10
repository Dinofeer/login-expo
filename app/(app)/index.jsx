import { useSession } from "../../ctx";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";

export default function Index() {
  const { session, signOut, isLoading } = useSession();
  const router = useRouter();

  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando sesión...</Text>
      </View>
    );
  }

  useEffect(() => {
    if (!session) {
      console.log("🔄 No hay sesión activa. Redirigiendo al login...");
      router.replace("/sign-in"); 
    }
  }, [session]);

  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>¡Bienvenido!</Text>
      <Text>Funciona!: {session?.email}</Text>
      <Button title="Cerrar sesión" onPress={() => signOut()} />
    </View>
  );
}
