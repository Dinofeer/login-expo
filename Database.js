import * as SQLite from 'expo-sqlite';

let db;

export async function initDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('tasks.db');
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY NOT NULL, 
        title TEXT NOT NULL, 
        completed INTEGER DEFAULT 0
      );
    `);
  }
  return db;
}

export async function getAllTasks() {
  await initDatabase();
  return await db.getAllAsync('SELECT * FROM tasks ORDER BY id DESC');
}

export async function addTask(title) {
  await initDatabase();
  return await db.runAsync('INSERT INTO tasks (title) VALUES (?)', title);
}

export async function updateTask(id, completed) {
  await initDatabase();
  return await db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?', completed, id);
}

export async function deleteTask(id) {
  await initDatabase();
  return await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}
