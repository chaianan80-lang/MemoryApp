import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Share } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapScreen from './screens/MapScreen';

export default function App() {
  const [image, setImage] = useState(null);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [memories, setMemories] = useState([]);
  const [location, setLocation] = useState('กำลังหาตำแหน่ง...');
  const [coords, setCoords] = useState(null);
  const [tab, setTab] = useState('list');

  useEffect(() => { getLocation(); }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setLocation('ไม่ได้รับอนุญาต'); return; }
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    const geo = await Location.reverseGeocodeAsync(loc.coords);
    if (geo[0]) {
      const { city, district, region } = geo[0];
      setLocation([district, city, region].filter(Boolean).join(', '));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setNote('');
      setRating(0);
      setShowNote(true);
      getLocation();
    }
  };

  const saveMemory = () => {
    const now = new Date();
    setMemories([{
      id: Date.now(),
      image, note, rating,
      date: now.toLocaleDateString('th-TH'),
      time: now.toLocaleTimeString('th-TH'),
      location, coords,
    }, ...memories]);
    setShowNote(false);
    setImage(null);
  };

  const shareLocation = async (m) => {
    await Share.share({
      message: `📍 ${m.location}\nhttps://maps.google.com/?q=${m.coords?.latitude},${m.coords?.longitude}`,
    });
  };

  if (showNote) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={styles.preview} />
        <View style={styles.template}>
          <Text style={styles.templateText}>📅 {new Date().toLocaleDateString('th-TH')}  🕐 {new Date().toLocaleTimeString('th-TH')}</Text>
          <Text style={styles.templateText}>📍 {location}</Text>
        </View>
        <Text style={styles.label}>ให้คะแนนสถานที่นี้</Text>
        <View style={styles.stars}>
          {[1,2,3,4,5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Text style={styles.star}>{s <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory App</Text>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'list' && styles.activeTab]} onPress={() => setTab('list')}>
          <Text style={[styles.tabText, tab === 'list' && styles.activeTabText]}>รายการ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'map' && styles.activeTab]} onPress={() => setTab('map')}>
          <Text style={[styles.tabText, tab === 'map' && styles.activeTabText]}>แผนที่</Text>
        </TouchableOpacity>
      </View>

      {tab === 'list' ? (
        <>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>📷 ถ่ายรูป</Text>
          </TouchableOpacity>
          <ScrollView style={styles.list}>
            {memories.map((m) => (
              <View key={m.id} style={styles.card}>
                <Image source={{ uri: m.image }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDate}>{m.date} {m.time}</Text>
                  <Text style={styles.cardLocation}>📍 {m.location}</Text>
                  <Text style={styles.cardRating}>{'⭐'.repeat(m.rating)}</Text>
                  <Text style={styles.cardNote}>{m.note}</Text>
                  <TouchableOpacity onPress={() => shareLocation(m)}>
                    <Text style={styles.shareBtn}>📤 แชร์ตำแหน่ง</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <MapScreen memories={memories} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  tabs: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f0f0f0', borderRadius: 12, padding: 4 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#000' },
  tabText: { fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#fff' },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  list: { flex: 1 },
  card: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f5f5f5', borderRadius: 12, overflow: 'hidden' },
  cardImage: { width: 100, height: 120 },
  cardInfo: { flex: 1, padding: 10 },
  cardDate: { fontSize: 12, color: '#888' },
  cardLocation: { fontSize: 12, color: '#888', marginTop: 2 },
  cardRating: { fontSize: 14, marginTop: 2 },
  cardNote: { fontSize: 14, marginTop: 4 },
  shareBtn: { fontSize: 13, color: '#007AFF', marginTop: 6 },
  preview: { width: '100%', height: 220, borderRadius: 12, marginBottom: 15 },
  template: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginBottom: 15 },
  templateText: { fontSize: 14, color: '#555', marginBottom: 4 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  stars: { flexDirection: 'row', marginBottom: 15 },
  star: { fontSize: 32, marginHorizontal: 4 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
});