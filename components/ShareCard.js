import { useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, Share, ScrollView } from 'react-native';
import ViewShot from 'react-native-view-shot';

export default function ShareCard({ memory, onClose }) {
  const viewRef = useRef();

  const handleShare = async () => {
    try {
      const uri = await viewRef.current.capture();
      await Share.share({
        url: uri,
        message: `📍 ${memory.location}\n${'⭐'.repeat(memory.rating || 0)} ${memory.note}\n\n🗺️ https://maps.google.com/?q=${memory.coords?.latitude},${memory.coords?.longitude}`,
      });
    } catch (e) {
      Alert.alert('Error', 'Unable to share. Please try again.');
    }
  };

  const firstImage = memory.images?.[0] || memory.image;

  return (
    <View style={styles.overlay}>
      <ViewShot ref={viewRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={styles.card}>
          {memory.images?.length > 1 ? (
            <ScrollView horizontal style={styles.imageScroll}>
              {memory.images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.multiImage} />
              ))}
            </ScrollView>
          ) : (
            <Image source={{ uri: firstImage }} style={styles.image} />
          )}
          <View style={styles.info}>
            <Text style={styles.note}>{memory.note}</Text>
            <Text style={styles.rating}>{'⭐'.repeat(memory.rating || 0)}</Text>
            <Text style={styles.meta}>📍 {memory.location}</Text>
            <Text style={styles.meta}>📅 {memory.date} · {memory.time}</Text>
            {memory.coords && (
              <Text style={styles.mapsText}>
                maps.google.com/?q={memory.coords.latitude},{memory.coords.longitude}
              </Text>
            )}
          </View>
        </View>
      </ViewShot>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤 Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  image: { width: '100%', height: 220 },
  imageScroll: { height: 180 },
  multiImage: { width: 180, height: 180, marginRight: 4 },
  info: { padding: 16 },
  note: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#000' },
  rating: { fontSize: 18, marginBottom: 8 },
  meta: { fontSize: 13, color: '#555', marginBottom: 4 },
  mapsText: { fontSize: 11, color: '#007AFF', marginTop: 8 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  shareBtn: { flex: 1, backgroundColor: '#000', padding: 14, borderRadius: 12, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  closeBtn: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});