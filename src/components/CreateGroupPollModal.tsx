import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { usePollStore, MAX_POLL_CANDIDATES } from '@/stores/usePollStore';
import { restaurantRepository } from '@/repositories/restaurantRepository';
import { pollRepository } from '@/repositories/pollRepository';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { RestaurantDiscoveryItem } from '@/types/restaurant';
import { Radii } from '@/theme';

export interface CreateGroupPollModalProps {
  visible: boolean;
  onClose: () => void;
  initialCandidateIds?: string[];
}

export function CreateGroupPollModal({
  visible,
  onClose,
  initialCandidateIds = [],
}: CreateGroupPollModalProps) {
  const { candidatePlaceIds, addCandidate, removeCandidate, clearCandidates } = usePollStore();
  const { selectedCity } = usePreferencesStore();

  const [pollTitle, setPollTitle] = useState('Friday Night Dawat Scene 🍕');
  const [organizerName, setOrganizerName] = useState('Ali');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Sync initial candidate IDs into store if provided
  useEffect(() => {
    if (initialCandidateIds.length > 0 && candidatePlaceIds.length === 0) {
      initialCandidateIds.forEach((id) => addCandidate(id));
    }
  }, [initialCandidateIds, candidatePlaceIds.length, addCandidate]);

  // Fetch restaurant suggestions from city if candidates < 2
  const { data: exploreData } = useQuery({
    queryKey: ['explore-sections-poll', selectedCity],
    queryFn: () => restaurantRepository.getExploreSections(selectedCity),
    enabled: visible,
  });

  const availableSuggestions: RestaurantDiscoveryItem[] = exploreData
    ? [...exploreData.khanaScenePicks, ...exploreData.budgetFriendly].slice(0, 10)
    : [];

  const handleLaunchPoll = async () => {
    if (candidatePlaceIds.length < 2) {
      setErrorNotice('Please choose at least 2 restaurants to vote on!');
      return;
    }
    setErrorNotice(null);
    setIsSubmitting(true);

    try {
      const poll = await pollRepository.createPoll({
        title: pollTitle.trim() || 'KhanaScene Group Poll',
        creatorName: organizerName.trim() || 'Organizer',
        candidatePlaceIds,
      });

      clearCandidates();
      onClose();
      router.push(`/poll/${poll.id}` as any);
    } catch {
      setErrorNotice('Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.pollBadge}>
                <Ionicons name="chatbubbles" size={12} color="#047857" />
                <Text style={styles.pollBadgeText}>Group Scene Decider</Text>
              </View>
              <Text style={styles.title}>Create 4–5 Restaurant Poll</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <Text style={styles.subtitle}>
              Shortlist 2 to 5 restaurants. Friends can open the link in WhatsApp, cast their vote live, and see real-time results!
            </Text>

            {errorNotice ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorNotice}</Text>
              </View>
            ) : null}

            {/* Section 1: Poll Title & Organizer */}
            <Text style={styles.sectionHeading}>1. Poll Details</Text>
            <Text style={styles.fieldLabel}>Poll Title / Occasion</Text>
            <TextInput
              style={styles.textInput}
              value={pollTitle}
              onChangeText={setPollTitle}
              placeholder="e.g. Saturday Night Dawat 🍕"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.fieldLabel}>Your Name (Organizer)</Text>
            <TextInput
              style={styles.textInput}
              value={organizerName}
              onChangeText={setOrganizerName}
              placeholder="e.g. Ali"
              placeholderTextColor="#94A3B8"
            />

            {/* Section 2: Selected Candidates */}
            <View style={styles.candidatesHeaderRow}>
              <Text style={styles.sectionHeading}>
                2. Shortlisted Restaurants ({candidatePlaceIds.length}/{MAX_POLL_CANDIDATES})
              </Text>
            </View>

            {candidatePlaceIds.length === 0 ? (
              <View style={styles.emptyNoticeBox}>
                <Text style={styles.emptyNoticeText}>
                  No restaurants added yet. Tap from the popular suggestions below!
                </Text>
              </View>
            ) : (
              <View style={styles.candidatePillsWrap}>
                {candidatePlaceIds.map((id, index) => {
                  const match = availableSuggestions.find((s) => s.placeId === id);
                  const name = match?.googleData.name ?? id.replace(/[-_]/g, ' ').slice(0, 24);
                  return (
                    <View key={id} style={styles.selectedCandidateCard}>
                      <View style={styles.candidateNumberBox}>
                        <Text style={styles.candidateNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.candidateDetails}>
                        <Text style={styles.candidateTitle} numberOfLines={1}>
                          {name}
                        </Text>
                        {match?.googleData.neighbourhood ? (
                          <Text style={styles.candidateSub}>{match.googleData.neighbourhood}</Text>
                        ) : null}
                      </View>
                      <Pressable onPress={() => removeCandidate(id)} style={styles.removeCandidateBtn}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Section 3: Add More Candidates */}
            {candidatePlaceIds.length < MAX_POLL_CANDIDATES && availableSuggestions.length > 0 ? (
              <>
                <Text style={styles.sectionHeading}>3. Tap to Add Candidates</Text>
                <View style={styles.suggestionsList}>
                  {availableSuggestions
                    .filter((s) => !candidatePlaceIds.includes(s.placeId))
                    .slice(0, 6)
                    .map((item) => (
                      <Pressable
                        key={item.placeId}
                        onPress={() => addCandidate(item.placeId)}
                        style={styles.suggestionRow}>
                        <View style={styles.suggestionTextWrap}>
                          <Text style={styles.suggestionName} numberOfLines={1}>
                            {item.googleData.name}
                          </Text>
                          <Text style={styles.suggestionSub}>
                            {item.googleData.neighbourhood || 'Islamabad'} • ★{' '}
                            {item.googleData.googleRating?.toFixed(1) ?? '4.5'}
                          </Text>
                        </View>
                        <View style={styles.addIconCircle}>
                          <Ionicons name="add" size={16} color="#047857" />
                        </View>
                      </Pressable>
                    ))}
                </View>
              </>
            ) : null}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Launch Group Poll"
              disabled={isSubmitting || candidatePlaceIds.length < 2}
              onPress={handleLaunchPoll}
              style={[
                styles.launchBtn,
                (candidatePlaceIds.length < 2 || isSubmitting) && styles.launchBtnDisabled,
              ]}>
              <Ionicons name="rocket-outline" size={18} color="#FFFFFF" />
              <Text style={styles.launchBtnText}>
                {isSubmitting ? 'Creating Poll...' : `Launch Live Poll (${candidatePlaceIds.length} spots)`}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '94%',
    paddingBottom: 20,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  pollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF4F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    marginBottom: 4,
  },
  pollBadgeText: {
    color: '#0E382C',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  candidatesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 13,
    color: '#0F172A',
  },
  emptyNoticeBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  emptyNoticeText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  candidatePillsWrap: {
    gap: 6,
    marginBottom: 10,
  },
  selectedCandidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  candidateNumberBox: {
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  candidateNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  candidateDetails: {
    flex: 1,
    marginRight: 8,
  },
  candidateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0E382C',
  },
  candidateSub: {
    fontSize: 11,
    color: '#047857',
  },
  removeCandidateBtn: {
    padding: 4,
  },
  suggestionsList: {
    gap: 6,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionSub: {
    fontSize: 11,
    color: '#64748B',
  },
  addIconCircle: {
    width: 26,
    height: 26,
    borderRadius: Radii.pill,
    backgroundColor: '#EAF4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0E382C',
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(14, 56, 44, 0.25)',
      },
      default: {
        elevation: 3,
        shadowColor: '#0E382C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
    }),
  },
  launchBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  launchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
