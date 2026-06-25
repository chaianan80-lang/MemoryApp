import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapScreen({ memories }) {
  const [selected, setSelected] = useState(null);

  const validMemories = memories.filter((m) => m.coords);

  const initialRegion = validMemories.length > 0 ? {
    latitude: validMemories[0].coords.latitude,
    longitude: validMemories[0].coords.longitude,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  } : {
    latitude: 13.7563,
    longitude: 100.5018,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        {validMemories.map((m) => (
          <Marker
            key={m.id}
            coordinate={m.coords}
            onPress={() => setSelected(m)}
          />
        ))}
      </MapView>

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {selected && (
              <>
                <Image source={{ uri: selected.image }} style={styles.modalImage} />
                <Text style={styles.modalDate}>{selected.date} {selected.time}</Text>
                <Text style={styles.modalLocation}>📍 {selected.location}</Text>
                <Text style={styles.modalRating}>{'⭐'.repeat(selected.rating || 0)}</Text>
                <Text style={styles.modalNote}>{selected.note}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelected(null)}>
                  <Text style={styles.closeText}>ปิด</Text>
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
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  modalDate: { fontSize: 12, color: '#888' },
  modalLocation: { fontSize: 14, color: '#555', marginTop: 4 },
  modalRating: { fontSize: 20, marginTop: 4 },
  modalNote: { fontSize: 16, marginTop: 8, marginBottom: 16 },
  closeButton: { backgroundColor: '#000', padding: 12, borderRadius: 12, alignItems: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold' },
});