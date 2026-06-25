import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [memories, setMemories] = useState([]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setNote('');
      setShowNote(true);
    }
  };

  const saveMemory = () => {
    const now = new Date();
    const memory = {
      id: Date.now(),
      image: image,
      note: note,
      date: now.toLocaleDateString('th-TH'),
      time: now.toLocaleTimeString('th-TH'),
    };
    setMemories([memory, ...memories]);
    setShowNote(false);
    setImage(null);
  };

  return (
    <View style={styles.container}>
      {!showNote ? (
        <>
          <Text style={styles.title}>Memory App</Text>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>📷 ถ่ายรูป</Text>
          </TouchableOpacity>
          <ScrollView style={styles.list}>
            {memories.map((m) => (
              <View key={m.id} style={styles.card}>
                <Image source={{ uri: m.image }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDate}>{m.date} {m.time}</Text>
                  <Text style={styles.cardNote}>{m.note}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.noteContainer}>
          <Image source={{ uri: image }} style={styles.preview} />
          <Text style={styles.label}>บันทึกความทรงจำ</Text>
          <TextInput
            style={styles.input}
            placeholder="ทำไมถึงถ่ายรูปนี้?"
            value={note}
            onChangeText={setNote}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={saveMemory}>
            <Text style={styles.buttonText}>บันทึก</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  list: { flex: 1 },
  card: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f5f5f5', borderRadius: 12, overflow: 'hidden' },
  cardImage: { width: 100, height: 100 },
  cardInfo: { flex: 1, padding: 10 },
  cardDate: { fontSize: 12, color: '#888' },
  cardNote: { fontSize: 14, marginTop: 5 },
  noteContainer: { flex: 1, alignItems: 'center' },
  preview: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20 },
  label: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
});