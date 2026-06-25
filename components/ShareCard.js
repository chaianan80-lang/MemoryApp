import { useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function ShareCard({ memory, onClose }) {
  const viewRef = useRef();

  const handleShare = async () => {
    try {
      const uri = await viewRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถแชร์ได้');
    }
  };

  return (
    <View style={styles.overlay}>
      <ViewShot ref={viewRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={styles.card}>
          <Image source={{ uri: memory.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.note}>{memory.note}</Text>
            <Text style={styles.rating}>{'⭐'.repeat(memory.rating || 0)}</Text>
            <Text style={styles.meta}>📍 {memory.location}</Text>
            <Text style={styles.meta}>📅 {memory.date} · {memory.time}</Text>
            {memory.coords && (
              <Text style={styles.maps}>
                🗺️ maps.google.com/?q={memory.coords.latitude},{memory.coords.longitude}
              </Text>
            )}
          </View>
        </View>
      </ViewShot>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤 แชร์</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>ปิด</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  image: { width: '100%', height: 240 },
  info: { padding: 16 },
  note: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#000' },
  rating: { fontSize: 18, marginBottom: 8 },
  meta: { fontSize: 13, color: '#555', marginBottom: 4 },
  maps: { fontSize: 11, color: '#007AFF', marginTop: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  shareBtn: { flex: 1, backgroundColor: '#000', padding: 14, borderRadius: 12, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});