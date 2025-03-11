import { useSession } from "../../ctx";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Button, 
  ActivityIndicator, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Keyboard
} from "react-native";
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

// 🟢 Asegurarse de que SQLite esté disponible
const db = SQLite.openDatabase ? SQLite.openDatabase('tasks.db') : null;

export default function Index() {
  const { session, signOut, isLoading } = useSession();
  const router = useRouter();
  
  // Estados
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // ⚠️ Si SQLite no está disponible, mostrar error
  if (!db) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error: SQLite no está disponible</Text>
      </View>
    );
  }

  // Inicializar la base de datos
  useEffect(() => {
    if (session) {
      db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, title TEXT, completed INTEGER);',
          [],
          () => fetchTasks(),
          (_, error) => console.error('Error al crear tabla:', error)
        );
      });
    }
  }, [session]);

  // Redireccionar si no hay sesión
  useEffect(() => {
    if (!session && !isLoading) {
      console.log("🔄 No hay sesión activa. Redirigiendo al login...");
      router.replace("/sign-in"); 
    }
  }, [session, isLoading]);

  // Cargar tareas
  const fetchTasks = () => {
    if (!session) return;
    
    setIsLoadingTasks(true);
    const userId = session.email || 'anonymous';
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC;',
        [userId],
        (_, { rows }) => {
          setTasks(rows._array);
          setIsLoadingTasks(false);
        },
        (_, error) => console.error('Error al cargar tareas:', error)
      );
    });
  };

  // Agregar tarea
  const addTask = () => {
    if (newTaskTitle.trim() === '') {
      Alert.alert('Error', 'El título de la tarea no puede estar vacío');
      return;
    }

    setIsAddingTask(true);
    const userId = session.email || 'anonymous';

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO tasks (user_id, title, completed) VALUES (?, ?, 0);',
        [userId, newTaskTitle],
        () => {
          setNewTaskTitle('');
          fetchTasks();
          setIsAddingTask(false);
          Keyboard.dismiss();
        },
        (_, error) => console.error('Error al añadir tarea:', error)
      );
    });
  };

  // Eliminar tarea
  const deleteTask = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM tasks WHERE id = ?;',
                [id],
                () => fetchTasks(),
                (_, error) => console.error('Error al eliminar tarea:', error)
              );
            });
          }
        }
      ]
    );
  };

  // Cambiar estado de la tarea
  const toggleTaskCompletion = (id, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;
    
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE tasks SET completed = ? WHERE id = ?;',
        [newStatus, id],
        () => fetchTasks(),
        (_, error) => console.error('Error al actualizar tarea:', error)
      );
    });
  };

  // Renderizar tarea
  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => toggleTaskCompletion(item.id, item.completed)}>
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={item.completed ? "#4CAF50" : "#757575"}
        />
      </TouchableOpacity>
      <Text style={[styles.taskTitle, item.completed && styles.completedTaskTitle]}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mis Tareas</Text>
      <TextInput
        style={styles.input}
        placeholder="Añadir nueva tarea..."
        value={newTaskTitle}
        onChangeText={setNewTaskTitle}
      />
      <Button title="Añadir Tarea" onPress={addTask} disabled={isAddingTask} />
      {isLoadingTasks ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      <Button title="Cerrar sesión" onPress={() => signOut()} color="#FF5252" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 5, backgroundColor: '#fff' },
  taskTitle: { flex: 1, fontSize: 16 },
  completedTaskTitle: { textDecorationLine: 'line-through', color: '#9E9E9E' },
});

