import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapScreen from './screens/MapScreen';
import ShareCard from './components/ShareCard';

export default function App() {
  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [memories, setMemories] = useState([]);
  const [location, setLocation] = useState('Finding location...');
  const [coords, setCoords] = useState(null);
  const [tab, setTab] = useState('list');
  const [shareMemory, setShareMemory] = useState(null);
  const [multiMode, setMultiMode] = useState(false);
  const [editMemory, setEditMemory] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editRating, setEditRating] = useState(0);

  useEffect(() => {
    loadMemories();
    getLocation();
  }, []);

  const loadMemories = async () => {
    try {
      const data = await AsyncStorage.getItem('memories');
      if (data) setMemories(JSON.parse(data));
    } catch (e) {}
  };

  const saveToStorage = async (newMemories) => {
    try {
      await AsyncStorage.setItem('memories', JSON.stringify(newMemories));
    } catch (e) {}
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setLocation('Location not permitted'); return; }
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    const geo = await Location.reverseGeocodeAsync(loc.coords);
    if (geo[0]) {
      const { city, district, region } = geo[0];
      setLocation([district, city, region].filter(Boolean).join(', '));
    }
  };

  const takePhoto = async (isMulti) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (isMulti) {
        setMultiMode(true);
        setImages((prev) => [...prev, uri]);
      } else {
        setMultiMode(false);
        setImages([uri]);
        setNote('');
        setRating(0);
        setShowNote(true);
        getLocation();
      }
    }
  };

  const startMultiMode = async () => {
    setImages([]);
    setNote('');
    setRating(0);
    setMultiMode(true);
    getLocation();
    await takePhoto(true);
  };

  const finishMultiPhoto = () => {
    if (images.length === 0) return;
    setShowNote(true);
    setMultiMode(false);
  };

  const saveMemory = async () => {
    const now = new Date();
    const memory = {
      id: Date.now(),
      images, note, rating,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      location, coords,
    };
    const newMemories = [memory, ...memories];
    setMemories(newMemories);
    await saveToStorage(newMemories);
    setShowNote(false);
    setImages([]);
  };

  const openEdit = (m) => {
    setEditMemory(m);
    setEditNote(m.note);
    setEditRating(m.rating || 0);
  };

  const saveEdit = async () => {
    const updated = memories.map((m) =>
      m.id === editMemory.id ? { ...m, note: editNote, rating: editRating } : m
    );
    setMemories(updated);
    await saveToStorage(updated);
    setEditMemory(null);
  };

  if (multiMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Multiple Photos</Text>
        <Text style={styles.subTitle}>{images.length} photo{images.length !== 1 ? 's' : ''} taken</Text>
        <ScrollView horizontal style={styles.previewScroll}>
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.previewThumb} />
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={() => takePhoto(true)}>
          <Text style={styles.buttonText}>📷 Take Another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonOutline} onPress={finishMultiPhoto}>
          <Text style={styles.buttonOutlineText}>✅ Done — Add Note</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showNote) {
    return (
      <View style={styles.container}>
        <ScrollView horizontal style={styles.previewScroll}>
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.previewThumb} />
          ))}
        </ScrollView>
        <View style={styles.template}>
          <Text style={styles.templateText}>📅 {new Date().toLocaleDateString('en-GB')}  🕐 {new Date().toLocaleTimeString('en-GB')}</Text>
          <Text style={styles.templateText}>📍 {location}</Text>
        </View>
        <Text style={styles.label}>Rate this place</Text>
        <View style={styles.stars}>
          {[1,2,3,4,5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Text style={styles.star}>{s <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Why did you take this photo?"
          value={note}
          onChangeText={setNote}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={saveMemory}>
          <Text style={styles.buttonText}>Save Memory</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory App</Text>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'list' && styles.activeTab]} onPress={() => setTab('list')}>
          <Text style={[styles.tabText, tab === 'list' && styles.activeTabText]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'map' && styles.activeTab]} onPress={() => setTab('map')}>
          <Text style={[styles.tabText, tab === 'map' && styles.activeTabText]}>Map</Text>
        </TouchableOpacity>
      </View>

      {tab === 'list' ? (
        <>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 8 }]} onPress={() => takePhoto(false)}>
              <Text style={styles.buttonText}>📷 Single</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonOutline, { flex: 1 }]} onPress={startMultiMode}>
              <Text style={styles.buttonOutlineText}>📷 Multiple</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.list}>
            {memories.map((m) => (
              <View key={m.id} style={styles.card}>
                <ScrollView horizontal style={styles.cardImageScroll}>
                  {(m.images || [m.image]).filter(Boolean).map((uri, i) => (
                    <Image key={i} source={{ uri }} style={styles.cardImage} />
                  ))}
                </ScrollView>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDate}>{m.date} {m.time}</Text>
                  <Text style={styles.cardLocation}>📍 {m.location}</Text>
                  <Text style={styles.cardRating}>{'⭐'.repeat(m.rating || 0)}</Text>
                  <Text style={styles.cardNote}>{m.note}</Text>
                  <View style={styles.cardButtons}>
                    <TouchableOpacity onPress={() => openEdit(m)}>
                      <Text style={styles.editBtn}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShareMemory(m)}>
                      <Text style={styles.shareBtn}>📤 Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <MapScreen memories={memories} />
      )}

      <Modal visible={!!shareMemory} transparent animationType="fade">
        {shareMemory && (
          <ShareCard memory={shareMemory} onClose={() => setShareMemory(null)} />
        )}
      </Modal>

      <Modal visible={!!editMemory} transparent animationType="slide">
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>Edit Memory</Text>
            <Text style={styles.label}>Rating</Text>
            <View style={styles.stars}>
              {[1,2,3,4,5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setEditRating(s)}>
                  <Text style={styles.star}>{s <= editRating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={editNote}
              onChangeText={setEditNote}
              multiline
              placeholder="Write your memory..."
            />
            <TouchableOpacity style={styles.button} onPress={saveEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonOutline} onPress={() => setEditMemory(null)}>
              <Text style={styles.buttonOutlineText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subTitle: { fontSize: 16, color: '#888', marginBottom: 12 },
  tabs: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f0f0f0', borderRadius: 12, padding: 4 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#000' },
  tabText: { fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#fff' },
  photoButtons: { flexDirection: 'row', marginBottom: 15 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonOutline: { borderWidth: 2, borderColor: '#000', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  buttonOutlineText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  previewScroll: { marginBottom: 15 },
  previewThumb: { width: 120, height: 120, borderRadius: 12, marginRight: 8 },
  list: { flex: 1 },
  card: { marginBottom: 15, backgroundColor: '#f5f5f5', borderRadius: 12, overflow: 'hidden' },
  cardImageScroll: { flexDirection: 'row' },
  cardImage: { width: 120, height: 120 },
  cardInfo: { padding: 10 },
  cardDate: { fontSize: 12, color: '#888' },
  cardLocation: { fontSize: 12, color: '#888', marginTop: 2 },
  cardRating: { fontSize: 14, marginTop: 2 },
  cardNote: { fontSize: 14, marginTop: 4 },
  cardButtons: { flexDirection: 'row', gap: 16, marginTop: 8 },
  editBtn: { fontSize: 13, color: '#555' },
  shareBtn: { fontSize: 13, color: '#007AFF' },
  template: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginBottom: 15 },
  templateText: { fontSize: 14, color: '#555', marginBottom: 4 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  stars: { flexDirection: 'row', marginBottom: 15 },
  star: { fontSize: 32, marginHorizontal: 4 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 15 },
  editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  editModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  editTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
});