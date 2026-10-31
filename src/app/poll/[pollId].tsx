import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { pollRepository } from '@/repositories/pollRepository';
import { LoadingStateBlock } from '@/components/StateFeedbackBlocks';
import { BillEstimatorModal } from '@/components/BillEstimatorModal';
import { Radii } from '@/theme';

const VOTER_NAME_STORAGE_KEY = 'khanascene.voterName.v1';

export const getPollShareUrl = (pollId: string): string => {
  const configuredBase = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (configuredBase) {
    return `${configuredBase.replace(/\/$/, '')}/poll/${pollId}`;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/poll/${pollId}`;
  }
  return `http://localhost:8081/poll/${pollId}`;
};

export default function PollRoomScreen() {
  const { pollId } = useLocalSearchParams<{ pollId: string }>();
  const resolvedPollId = pollId ?? 'unknown';

  const [voterName, setVoterName] = useState('Friend');
  const [optimisticVotePlaceId, setOptimisticVotePlaceId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [showBillEstimator, setShowBillEstimator] = useState(false);

  // Restore saved voter name on mount
  useEffect(() => {
    AsyncStorage.getItem(VOTER_NAME_STORAGE_KEY).then((saved) => {
      if (saved && saved.trim()) {
        setVoterName(saved.trim());
      }
    });
  }, []);

  const {
    data: pollDetails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['poll-details', resolvedPollId],
    queryFn: () => pollRepository.getPollWithDetails(resolvedPollId),
    refetchInterval: 3500, // Poll every 3.5 seconds for real-time votes
  });

  // Derived current voter's selection (from optimistic state or poll details)
  const currentVotedPlaceId = useMemo(() => {
    if (optimisticVotePlaceId) return optimisticVotePlaceId;
    if (!pollDetails || !voterName.trim()) return null;
    const match = pollDetails.votes.find(
      (v) => v.voterName.trim().toLowerCase() === voterName.trim().toLowerCase()
    );
    return match ? match.selectedPlaceId : null;
  }, [optimisticVotePlaceId, pollDetails, voterName]);

  const handleCastVote = async (placeId: string) => {
    if (!voterName.trim() || isVoting) return;
    setIsVoting(true);
    setOptimisticVotePlaceId(placeId);

    try {
      await AsyncStorage.setItem(VOTER_NAME_STORAGE_KEY, voterName.trim());
      await pollRepository.castVote({
        pollId: resolvedPollId,
        voterName: voterName.trim(),
        selectedPlaceId: placeId,
      });
      refetch();
    } catch (err) {
      console.warn('Error voting:', err);
      setOptimisticVotePlaceId(null);
    } finally {
      setIsVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!pollDetails || pollDetails.tallies.length === 0) return;
    const leader = pollDetails.tallies[0].placeId;
    await pollRepository.closePoll(resolvedPollId, leader);
    refetch();
  };

  const handleShareToWhatsApp = () => {
    if (!pollDetails) return;
    const { poll, tallies, totalVotes } = pollDetails;

    // Use clean, standard characters to avoid emoji variation selector encoding issues in WhatsApp
    let msg = `*KhanaScene Group Poll: ${poll.title.trim()}*\n`;
    msg += `Organized by: ${poll.creatorName} (${totalVotes} votes cast)\n\n`;

    tallies.forEach((t, i) => {
      msg += `${i + 1}. *${t.restaurant.googleData.name}* — ${t.voteCount} votes (${t.percentage}%)\n`;
      if (t.voters.length > 0) {
        msg += `   Voters: ${t.voters.join(', ')}\n`;
      }
    });

    const pollUrl = getPollShareUrl(resolvedPollId);
    msg += `\n*Tap to vote live here:*\n${pollUrl}\n\n`;
    msg += `_Khana kahan? Scene yahan._`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }

    setShareNotice('WhatsApp opened with clean poll message! 📲');
    setTimeout(() => setShareNotice(null), 3500);
  };

  const handleCopyLink = async () => {
    const pollUrl = getPollShareUrl(resolvedPollId);
    try {
      await Clipboard.setStringAsync(pollUrl);
      setShareNotice('Poll link copied to clipboard! 📋');
    } catch {
      setShareNotice('Failed to copy link');
    }
    setTimeout(() => setShareNotice(null), 3500);
  };

  const handleCopyNativePollFormat = async () => {
    if (!pollDetails) return;
    const { poll, tallies } = pollDetails;
    let pollText = `Question: Where should we eat? (${poll.title})\n\nOptions:\n`;
    tallies.forEach((t, i) => {
      pollText += `${i + 1}. ${t.restaurant.googleData.name}\n`;
    });
    try {
      await Clipboard.setStringAsync(pollText);
      setShareNotice('WhatsApp poll text copied! Paste in chat poll 🗳️');
    } catch {
      setShareNotice('Failed to copy poll text');
    }
    setTimeout(() => setShareNotice(null), 3500);
  };

  const isClosed = pollDetails?.poll.status === 'closed';
  const winner = pollDetails?.winningCandidate ?? pollDetails?.tallies[0]?.restaurant ?? null;
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingStateBlock label="Loading live group poll room..." />
      </SafeAreaView>
    );
  }

  if (!pollDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="help-circle-outline" size={54} color="#94A3B8" />
          <Text style={styles.notFoundTitle}>Poll Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This group poll may have expired or the link is invalid. Pick spots from Explore to launch a new poll!
          </Text>
          <Pressable onPress={() => router.replace('/')} style={styles.notFoundActionBtn}>
            <Ionicons name="compass" size={16} color="#FFFFFF" />
            <Text style={styles.notFoundActionBtnText}>Back to Explore</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header Bar */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>
        <View style={styles.navTitleWrap}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {pollDetails.poll.title}
          </Text>
          <Text style={styles.navSub}>
            Organized by {pollDetails.poll.creatorName} • {pollDetails.totalVotes} votes cast
          </Text>
        </View>
        <View style={styles.navActionRow}>
          <Pressable onPress={handleCopyLink} style={styles.shareIconBtn} accessibilityLabel="Copy link">
            <Ionicons name="copy-outline" size={18} color="#0E382C" />
          </Pressable>
          <Pressable onPress={handleShareToWhatsApp} style={styles.shareIconBtn} accessibilityLabel="Share to WhatsApp">
            <Ionicons name="logo-whatsapp" size={19} color="#25D366" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Localhost Notice Banner */}
        {isLocalhost ? (
          <View style={styles.localhostNoticeBox}>
            <Ionicons name="information-circle-outline" size={18} color="#0369A1" />
            <View style={{ flex: 1 }}>
              <Text style={styles.localhostNoticeTitle}>Localhost Notice</Text>
              <Text style={styles.localhostNoticeText}>
                WhatsApp only makes real domains clickable (not localhost). For friends on other phones, run with <Text style={{ fontFamily: 'monospace', fontWeight: '700' }}>--tunnel</Text> or deploy to Vercel/Web.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Status Banner */}
        {isClosed ? (
          <View style={styles.winnerHeroCard}>
            <View style={styles.winnerBadge}>
              <Ionicons name="trophy" size={16} color="#B45309" />
              <Text style={styles.winnerBadgeText}>POLL DECIDED • WINNER</Text>
            </View>
            <Text style={styles.winnerName}>{winner?.googleData.name}</Text>
            <Text style={styles.winnerSubtitle}>
              Winner with {pollDetails.tallies[0]?.voteCount ?? 0} votes! Group scene is set! 🎉
            </Text>

            <View style={styles.winnerActionRow}>
              <Pressable
                onPress={() => {
                  const query = encodeURIComponent(
                    `${winner?.googleData.name} ${winner?.googleData.neighbourhood || ''}`
                  );
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
                }}
                style={styles.winnerActionBtn}>
                <Ionicons name="navigate" size={15} color="#0E382C" />
                <Text style={styles.winnerActionText}>Directions</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowBillEstimator(true)}
                style={styles.winnerActionBtnPrimary}>
                <Ionicons name="calculator-outline" size={15} color="#FFFFFF" />
                <Text style={styles.winnerActionTextWhite}>Split Bill</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.liveBanner}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE VOTING ROOM</Text>
            </View>
            <Text style={styles.liveSub}>
              {pollDetails.totalVotes} friends voted. Votes update live for everyone!
            </Text>
          </View>
        )}

        {shareNotice ? (
          <View style={styles.noticeBox}>
            <Ionicons name="checkmark-circle" size={16} color="#047857" />
            <Text style={styles.noticeText}>{shareNotice}</Text>
          </View>
        ) : null}

        {/* Voter Identity Input */}
        {!isClosed ? (
          <View style={styles.voterBox}>
            <Text style={styles.voterBoxLabel}>Your Name (Visible to Friends)</Text>
            <TextInput
              style={styles.voterInput}
              value={voterName}
              onChangeText={setVoterName}
              placeholder="e.g. Saad, Hamza, Fatima"
              placeholderTextColor="#94A3B8"
            />
          </View>
        ) : null}

        {/* Candidate Restaurants */}
        <Text style={styles.sectionHeading}>Shortlisted Spots</Text>

        <View style={styles.candidatesList}>
          {pollDetails.tallies.map((tally, index) => {
            const isVoted = currentVotedPlaceId === tally.placeId;
            const isWinnerSpot = isClosed && winner?.placeId === tally.placeId;

            return (
              <View
                key={tally.placeId}
                style={[
                  styles.candidateCard,
                  isWinnerSpot && styles.candidateCardWinner,
                  isVoted && styles.candidateCardVoted,
                ]}>
                <View style={styles.candidateHeader}>
                  <View style={styles.candidateRankBox}>
                    <Text style={styles.candidateRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.candidateMainInfo}>
                    <Text style={styles.candidateRestaurantName} numberOfLines={1}>
                      {tally.restaurant.googleData.name}
                    </Text>
                    <Text style={styles.candidateMetaText}>
                      {tally.restaurant.googleData.neighbourhood || 'Islamabad'} • ★{' '}
                      {tally.restaurant.googleData.googleRating?.toFixed(1) ?? '4.5'}
                    </Text>
                  </View>
                  <Text style={styles.tallyPercentageText}>{tally.percentage}%</Text>
                </View>

                {/* Hero Dishes */}
                {tally.restaurant.khanaSceneData?.heroDishes &&
                tally.restaurant.khanaSceneData.heroDishes.length > 0 ? (
                  <Text style={styles.heroDishesText} numberOfLines={1}>
                    🔥 Famous: {tally.restaurant.khanaSceneData.heroDishes.slice(0, 3).join(', ')}
                  </Text>
                ) : null}

                {/* Animated Vote Progress Bar */}
                <View style={styles.voteBarBg}>
                  <View
                    style={[
                      styles.voteBarFill,
                      {
                        width: `${Math.max(6, tally.percentage)}%`,
                        backgroundColor: isWinnerSpot ? '#F59E0B' : '#047857',
                      },
                    ]}
                  />
                </View>

                {/* Voters Chips */}
                <View style={styles.votersRow}>
                  <Text style={styles.votersCountLabel}>
                    {tally.voteCount} {tally.voteCount === 1 ? 'vote' : 'votes'}
                  </Text>
                  <View style={styles.voterPillsWrap}>
                    {tally.voters.map((name, i) => (
                      <View key={i} style={styles.voterPill}>
                        <Text style={styles.voterPillText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Vote Action Button */}
                {!isClosed ? (
                  <Pressable
                    disabled={isVoting}
                    onPress={() => handleCastVote(tally.placeId)}
                    style={[styles.voteBtn, isVoted ? styles.voteBtnActive : styles.voteBtnNormal]}>
                    <Ionicons
                      name={isVoted ? 'checkmark-circle' : 'finger-print-outline'}
                      size={16}
                      color={isVoted ? '#FFFFFF' : '#0E382C'}
                    />
                    <Text
                      style={[
                        styles.voteBtnText,
                        isVoted ? styles.voteBtnTextActive : styles.voteBtnTextNormal,
                      ]}>
                      {isVoted ? 'Your Vote Cast ✅' : 'Vote for this Spot'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Organizer Actions */}
        {!isClosed && pollDetails.totalVotes > 0 ? (
          <Pressable onPress={handleClosePoll} style={styles.closePollBtn}>
            <Ionicons name="trophy-outline" size={16} color="#B45309" />
            <Text style={styles.closePollBtnText}>End Voting & Crown Winner 🏆</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* Sticky Action Footer */}
      <View style={styles.footer}>
        <View style={styles.footerBtnRow}>
          <Pressable onPress={handleCopyLink} style={styles.copyLinkFooterBtn}>
            <Ionicons name="copy-outline" size={16} color="#0E382C" />
            <Text style={styles.copyLinkFooterBtnText}>Copy Link</Text>
          </Pressable>
          <Pressable onPress={handleShareToWhatsApp} style={styles.whatsAppShareBtn}>
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.whatsAppShareBtnText}>Share to WhatsApp</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleCopyNativePollFormat} style={styles.nativePollCopyBtn}>
          <Ionicons name="list" size={13} color="#64748B" />
          <Text style={styles.nativePollCopyBtnText}>
            Copy choices for WhatsApp in-chat poll
          </Text>
        </Pressable>
      </View>

      {/* Optional Bill Estimator Modal for Winner */}
      {showBillEstimator && winner ? (
        <BillEstimatorModal
          visible={showBillEstimator}
          onClose={() => setShowBillEstimator(false)}
          restaurantName={winner.googleData.name}
          availableMenuItems={winner.khanaSceneData?.menus?.flatMap((m: { items: any[] }) => m.items) ?? []}
          availableCardDeals={winner.khanaSceneData?.cardDeals ?? []}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9',
  },
  navTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  navSub: {
    fontSize: 11,
    color: '#64748B',
  },
  shareIconBtn: {
    padding: 8,
    borderRadius: Radii.pill,
    backgroundColor: '#EAF4F0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  liveBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 12,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  liveSub: {
    fontSize: 12,
    color: '#065F46',
  },
  winnerHeroCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    marginBottom: 14,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)' },
      default: { elevation: 3 },
    }),
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    marginBottom: 6,
  },
  winnerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  winnerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#78350F',
  },
  winnerSubtitle: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
    marginBottom: 12,
  },
  winnerActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  winnerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  winnerActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E382C',
  },
  winnerActionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0E382C',
    paddingVertical: 10,
    borderRadius: 12,
  },
  winnerActionTextWhite: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
  },
  voterBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  voterBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  voterInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  candidatesList: {
    gap: 10,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  candidateCardWinner: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    backgroundColor: '#FFFDF5',
  },
  candidateCardVoted: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateRankBox: {
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  candidateRankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  candidateMainInfo: {
    flex: 1,
    marginRight: 8,
  },
  candidateRestaurantName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  candidateMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  tallyPercentageText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0E382C',
  },
  heroDishesText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  voteBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  voteBarFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  votersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  votersCountLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  voterPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  voterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  voterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  voteBtnNormal: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voteBtnActive: {
    backgroundColor: '#047857',
  },
  voteBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  voteBtnTextNormal: {
    color: '#0E382C',
  },
  voteBtnTextActive: {
    color: '#FFFFFF',
  },
  closePollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  closePollBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copyLinkFooterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 14,
  },
  copyLinkFooterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E382C',
  },
  nativePollCopyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    flexDirection: 'row',
    gap: 5,
  },
  nativePollCopyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  localhostNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  localhostNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  localhostNoticeText: {
    fontSize: 11,
    color: '#0284C7',
    lineHeight: 16,
  },
  whatsAppShareBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)' },
      default: { elevation: 3 },
    }),
  },
  whatsAppShareBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  notFoundActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0E382C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  notFoundActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
