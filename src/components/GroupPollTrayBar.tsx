import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore, MAX_POLL_CANDIDATES } from '@/stores/usePollStore';
import { CreateGroupPollModal } from '@/components/CreateGroupPollModal';
import { Radii } from '@/theme';

export function GroupPollTrayBar() {
  const { candidatePlaceIds, clearCandidates } = usePollStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (candidatePlaceIds.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.trayContainer}>
        <View style={styles.trayCard}>
          <View style={styles.trayLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles" size={14} color="#047857" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.trayTitle}>
                {candidatePlaceIds.length} of {MAX_POLL_CANDIDATES} spots picked
              </Text>
              <Text style={styles.traySub}>
                {candidatePlaceIds.length >= 2 ? 'Ready to vote with friends!' : 'Pick at least 1 more spot'}
              </Text>
            </View>
          </View>

          <View style={styles.trayActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear poll candidates"
              onPress={clearCandidates}
              style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={16} color="#94A3B8" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Group Poll Creator"
              onPress={() => setShowCreateModal(true)}
              style={[
                styles.createBtn,
                candidatePlaceIds.length < 2 && styles.createBtnDisabled,
              ]}>
              <Text style={styles.createBtnText}>Vote ➔</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {showCreateModal ? (
        <CreateGroupPollModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  trayContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 70 : 60,
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'center',
  },
  trayCard: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E382C',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#047857',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(14, 56, 44, 0.35)' },
      default: {
        elevation: 6,
        shadowColor: '#0E382C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
    }),
  },
  trayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.pill,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  trayTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  traySub: {
    color: '#A7F3D0',
    fontSize: 11,
  },
  trayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearBtn: {
    padding: 6,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  createBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  createBtnDisabled: {
    backgroundColor: '#64748B',
  },
  createBtnText: {
    color: '#0E382C',
    fontSize: 12,
    fontWeight: '900',
  },
});
