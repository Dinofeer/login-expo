import { useSession } from "../../ctx";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllTasks, addTask, updateTask, deleteTask } from "../../Database";

export default function Index() {
  const { session, signOut, isLoading } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  
  
  useEffect(() => {
    if (session) {
      fetchTasks();
    } else if (!isLoading) {
      router.replace("/sign-in");
    }
  }, [session, isLoading]);

  
  async function fetchTasks() {
    setIsLoadingTasks(true);
    const data = await getAllTasks();
    setTasks(data);
    setIsLoadingTasks(false);
  }

  
  async function handleAddTask() {
    if (newTaskTitle.trim() === "") {
      Alert.alert("Error", "El título no puede estar vacío");
      return;
    }
    await addTask(newTaskTitle);
    setNewTaskTitle("");
    fetchTasks();
  }

  async function handleToggleTask(id, completed) {
    await updateTask(id, completed ? 0 : 1);
    fetchTasks();
  }

  
  async function handleDeleteTask(id) {
    Alert.alert("Confirmar eliminación", "¿Eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteTask(id);
          fetchTasks();
        }
      }
    ]);
  }

  
  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => handleToggleTask(item.id, item.completed)}>
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={item.completed ? "#4CAF50" : "#757575"}
        />
      </TouchableOpacity>
      <Text style={[styles.taskTitle, item.completed && styles.completedTaskTitle]}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Tareas</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Añadir nueva tarea..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        <Button title="Agregar" onPress={handleAddTask} />
      </View>

      {isLoadingTasks ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : tasks.length === 0 ? (
        <Text>No hay tareas disponibles</Text>
      ) : (
        <FlatList data={tasks} renderItem={renderTaskItem} keyExtractor={(item) => item.id.toString()} />
      )}

      <Button title="Cerrar sesión" onPress={signOut} color="#FF5252" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { flexDirection: "row", marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  taskItem: { flexDirection: "row", justifyContent: "space-between", padding: 15, backgroundColor: "#FFF", marginBottom: 10, borderRadius: 5 },
  taskTitle: { fontSize: 16 },
  completedTaskTitle: { textDecorationLine: "line-through", color: "#9E9E9E" },
});
