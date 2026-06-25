import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Modal, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const DISTANCE_THRESHOLD = 0.001;

function groupMemories(memories) {
  const groups = [];
  memories.forEach((m) => {
    if (!m.coords) return;
    const existing = groups.find(
      (g) =>
        Math.abs(g.coords.latitude - m.coords.latitude) < DISTANCE_THRESHOLD &&
        Math.abs(g.coords.longitude - m.coords.longitude) < DISTANCE_THRESHOLD
    );
    if (existing) {
      existing.items.push(m);
    } else {
      groups.push({ coords: m.coords, items: [m] });
    }
  });
  return groups;
}

export default function MapScreen({ memories }) {
  const [selected, setSelected] = useState(null);

  const groups = groupMemories(memories);

  const initialRegion = groups.length > 0 ? {
    latitude: groups[0].coords.latitude,
    longitude: groups[0].coords.longitude,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  } : {
    latitude: 13.7563,
    longitude: 100.5018,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const allImages = (group) => {
    const imgs = [];
    group.items.forEach((m) => {
      (m.images || [m.image]).filter(Boolean).forEach((uri) => imgs.push({ uri, m }));
    });
    return imgs;
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        {groups.map((group, index) => {
          const firstImage = group.items[0].images?.[0] || group.items[0].image;
          return (
            <Marker
              key={index}
              coordinate={group.coords}
              onPress={() => setSelected(group)}
            >
              <View style={styles.pin}>
                <Image source={{ uri: firstImage }} style={styles.pinImage} />
                {group.items.length > 1 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{group.items.length}</Text>
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>
                  📍 {selected.items[0].location}
                </Text>
                <Text style={styles.modalCount}>
                  {selected.items.length} memory{selected.items.length > 1 ? 's' : ''} here
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {allImages(selected).map(({ uri, m }, i) => (
                    <View key={i} style={styles.imageCard}>
                      <Image source={{ uri }} style={styles.modalImage} />
                      <Text style={styles.imageDate}>{m.date}</Text>
                      <Text style={styles.imageNote} numberOfLines={2}>{m.note}</Text>
                      <Text style={styles.imageRating}>{'⭐'.repeat(m.rating || 0)}</Text>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelected(null)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: { borderRadius: 20, overflow: 'visible', borderWidth: 2, borderColor: '#fff' },
  pinImage: { width: 44, height: 44, borderRadius: 18 },
  badge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#000', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  modalCount: { fontSize: 13, color: '#888', marginBottom: 12 },
  imageScroll: { marginBottom: 16 },
  imageCard: { width: 160, marginRight: 12 },
  modalImage: { width: 160, height: 120, borderRadius: 12, marginBottom: 6 },
  imageDate: { fontSize: 11, color: '#888' },
  imageNote: { fontSize: 13, color: '#333', marginTop: 2 },
  imageRating: { fontSize: 13, marginTop: 2 },
  closeButton: { backgroundColor: '#000', padding: 12, borderRadius: 12, alignItems: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold' },
});