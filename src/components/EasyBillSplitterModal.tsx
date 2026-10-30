import React, { useEffect, useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { PAYMENT_PROVIDERS, PaymentProviderType } from '@/types/paymentAccounts';
import { usePaymentAccountsStore } from '@/stores/usePaymentAccountsStore';
import { useContriSplitsStore } from '@/stores/useContriSplitsStore';
import {
  calculateQuickSplit,
  formatContriStatusWhatsAppMessage,
  shareFriendNudgeOnWhatsApp,
} from '@/utils/billEstimator';
import { Radii } from '@/theme';

export interface EasyBillSplitterModalProps {
  visible: boolean;
  onClose: () => void;
  initialAmountPkr?: number;
  initialTitle?: string;
}

const QUICK_SPLIT_COUNTS = [2, 3, 4, 5, 6, 8, 10];
const REMINDER_OPTIONS = [
  { label: 'In 1 hour', minutes: 60 },
  { label: 'In 3 hours', minutes: 180 },
  { label: 'Tonight (10 PM)', minutes: 360 },
  { label: 'Tomorrow', minutes: 1440 },
];

export function EasyBillSplitterModal({
  visible,
  onClose,
  initialAmountPkr,
  initialTitle = '',
}: EasyBillSplitterModalProps) {
  const {
    accounts,
    hydrateAccounts,
    addAccount,
    formatAccountForTransfer,
  } = usePaymentAccountsStore();

  const {
    createSplit,
    toggleFriendPaid,
    updateFriendName,
    scheduleReminderForSplit,
    getSplit,
  } = useContriSplitsStore();

  const [totalAmountText, setTotalAmountText] = useState<string>(
    initialAmountPkr ? String(initialAmountPkr) : '4800'
  );
  const [splitCount, setSplitCount] = useState<number>(4);
  const [dawatTitle, setDawatTitle] = useState<string>(initialTitle || 'Friends Dawat');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // New account form state
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [newAccountProvider, setNewAccountProvider] = useState<PaymentProviderType>('easypaisa');
  const [newAccountTitle, setNewAccountTitle] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newBankName, setNewBankName] = useState('');

  // Active split tracking state
  const [activeSplitId, setActiveSplitId] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  useEffect(() => {
    hydrateAccounts();
  }, [hydrateAccounts]);

  const activeAccountId =
    selectedAccountId ?? (accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id ?? null);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeAccountId) ?? accounts[0] ?? null;
  }, [accounts, activeAccountId]);

  const parsedAmount = useMemo(() => {
    const num = parseInt(totalAmountText.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) || num <= 0 ? 0 : num;
  }, [totalAmountText]);

  const quickResult = useMemo(() => {
    return calculateQuickSplit(parsedAmount, splitCount);
  }, [parsedAmount, splitCount]);

  // Initialize or fetch the active split record
  useEffect(() => {
    let isMounted = true;
    if (visible && parsedAmount > 0) {
      createSplit({
        title: dawatTitle,
        totalAmountPkr: parsedAmount,
        splitCount,
        paymentAccount: selectedAccount,
      }).then((s) => {
        if (isMounted) {
          setActiveSplitId(s.id);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [visible, parsedAmount, splitCount, dawatTitle, selectedAccount, createSplit]);

  const currentSplit = useMemo(() => {
    if (!activeSplitId) return null;
    return getSplit(activeSplitId) ?? null;
  }, [activeSplitId, getSplit]);

  const handleSaveNewAccount = async () => {
    if (!newAccountNumber.trim()) return;
    const created = await addAccount({
      provider: newAccountProvider,
      title: newAccountTitle.trim() || 'My Account',
      accountNumber: newAccountNumber.trim(),
      bankName: newAccountProvider === 'bank' ? newBankName.trim() || 'Pakistani Bank' : undefined,
      isDefault: accounts.length === 0,
    });
    setSelectedAccountId(created.id);
    setNewAccountNumber('');
    setNewAccountTitle('');
    setNewBankName('');
    setShowAddAccountForm(false);
  };

  const handleShareWhatsApp = async () => {
    if (!currentSplit) return;
    const accountSummary = formatAccountForTransfer(selectedAccount);
    const msg = formatContriStatusWhatsAppMessage({
      dawatTitle: currentSplit.title,
      totalPkr: currentSplit.totalAmountPkr,
      perPersonPkr: currentSplit.perPersonPkr,
      friends: currentSplit.friends,
      paymentAccountSummary: accountSummary,
    });

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const handleCopySummary = () => {
    if (!currentSplit) return;
    const accountSummary = formatAccountForTransfer(selectedAccount);
    const msg = formatContriStatusWhatsAppMessage({
      dawatTitle: currentSplit.title,
      totalPkr: currentSplit.totalAmountPkr,
      perPersonPkr: currentSplit.perPersonPkr,
      friends: currentSplit.friends,
      paymentAccountSummary: accountSummary,
    });

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(msg);
    }
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleNudgeFriend = (friendName: string, sharePkr: number) => {
    const accountSummary = formatAccountForTransfer(selectedAccount);
    shareFriendNudgeOnWhatsApp({
      friendName,
      dawatTitle: currentSplit?.title || dawatTitle,
      sharePkr,
      paymentAccountSummary: accountSummary,
    });
  };

  const handleScheduleReminder = async (minutes: number, label: string) => {
    if (!currentSplit) return;
    const ok = await scheduleReminderForSplit(currentSplit.id, minutes);
    if (ok) {
      setReminderNotice(`Reminder scheduled for ${label}! 🔔`);
      setTimeout(() => setReminderNotice(null), 3500);
    } else {
      setReminderNotice(`Reminder set in app! 🔔`);
      setTimeout(() => setReminderNotice(null), 3000);
    }
  };

  const paidFriendsCount = currentSplit?.friends.filter((f) => f.isPaid).length ?? 1;
  const totalFriendsCount = currentSplit?.friends.length ?? splitCount;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.easyBadge}>
                <Ionicons name="flash" size={12} color="#047857" />
                <Text style={styles.easyBadgeText}>Instant Contri Splitter</Text>
              </View>
              <Text style={styles.title}>Easy Bill Split & Reminders</Text>
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
              Just enter bill amount and number of people. Connect Easypaisa or bank, track who paid, and send reminder nudges!
            </Text>

            {/* Quick Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTagRow}>
                <Ionicons name="cash-outline" size={18} color="#047857" />
                <Text style={styles.heroTag}>CONTRI PER HEAD</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceNumber}>
                  Rs {quickResult.perPersonPkr.toLocaleString('en-PK')}
                </Text>
                <Text style={styles.pricePer}>/ person</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                Total Bill: Rs {quickResult.totalPkr.toLocaleString('en-PK')} split equally among {quickResult.splitCount} friends
              </Text>

              {/* Progress Bar of Collected Amount */}
              {currentSplit ? (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.round((paidFriendsCount / totalFriendsCount) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {paidFriendsCount}/{totalFriendsCount} Friends Paid (Rs{' '}
                    {(paidFriendsCount * quickResult.perPersonPkr).toLocaleString('en-PK')} recovered)
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Section 1: Amount & Occasion */}
            <Text style={styles.sectionHeading}>1. Total Bill Amount (PKR)</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.pkrCurrencyPrefix}>₨</Text>
              <TextInput
                style={styles.amountTextInput}
                keyboardType="numeric"
                value={totalAmountText}
                onChangeText={setTotalAmountText}
                placeholder="4800"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.fieldLabel}>Dawat Occasion / Restaurant (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={dawatTitle}
              onChangeText={setDawatTitle}
              placeholder="e.g. Cheezious F-7, Hostel Chai, Savour"
              placeholderTextColor="#94A3B8"
            />

            {/* Section 2: Total Users / Friends */}
            <View style={styles.splitHeaderRow}>
              <Text style={styles.sectionHeading}>2. Number of Friends</Text>
              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => setSplitCount((c) => Math.max(1, c - 1))}
                  style={styles.stepperBtn}>
                  <Ionicons name="remove" size={14} color="#0E382C" />
                </Pressable>
                <Text style={styles.stepperCountText}>{splitCount}</Text>
                <Pressable
                  onPress={() => setSplitCount((c) => Math.min(20, c + 1))}
                  style={styles.stepperBtn}>
                  <Ionicons name="add" size={14} color="#0E382C" />
                </Pressable>
              </View>
            </View>

            <View style={styles.chipsRow}>
              {QUICK_SPLIT_COUNTS.map((count) => {
                const isSelected = splitCount === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => setSplitCount(count)}
                    style={[styles.chip, isSelected && styles.chipSelected]}>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {count} friends
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Section 3: Connected Payment Account (Easypaisa / Bank) */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>3. Receive Money via</Text>
              <Pressable
                onPress={() => setShowAddAccountForm((v) => !v)}
                style={styles.addAccountBtn}>
                <Ionicons
                  name={showAddAccountForm ? 'close' : 'add-circle-outline'}
                  size={14}
                  color="#047857"
                />
                <Text style={styles.addAccountBtnText}>
                  {showAddAccountForm ? 'Cancel' : '+ Add Account'}
                </Text>
              </Pressable>
            </View>

            {/* Account Selector Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountChipsRow}>
              {accounts.map((acc) => {
                const meta = PAYMENT_PROVIDERS[acc.provider];
                const isSelected = activeAccountId === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => setSelectedAccountId(acc.id)}
                    style={[
                      styles.accountCard,
                      isSelected && { borderColor: meta?.color ?? '#047857', borderWidth: 2 },
                    ]}>
                    <View style={[styles.accountBadge, { backgroundColor: meta?.badgeBg ?? '#F1F5F9' }]}>
                      <Ionicons name={(meta?.icon as any) ?? 'cash-outline'} size={14} color={meta?.color ?? '#0F172A'} />
                      <Text style={[styles.accountBadgeText, { color: meta?.badgeColor ?? '#0F172A' }]}>
                        {meta?.shortName ?? acc.provider}
                      </Text>
                    </View>
                    <Text style={styles.accountCardNumber} numberOfLines={1}>
                      {acc.accountNumber}
                    </Text>
                    <Text style={styles.accountCardTitle} numberOfLines={1}>
                      {acc.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Add Account Inline Form */}
            {showAddAccountForm ? (
              <View style={styles.addAccountForm}>
                <Text style={styles.addAccountFormTitle}>Connect New Payment Method</Text>

                <View style={styles.providerPillsRow}>
                  {(['easypaisa', 'jazzcash', 'sadapay', 'nayapay', 'bank'] as PaymentProviderType[]).map((prov) => {
                    const isProvSelected = newAccountProvider === prov;
                    const meta = PAYMENT_PROVIDERS[prov];
                    return (
                      <Pressable
                        key={prov}
                        onPress={() => setNewAccountProvider(prov)}
                        style={[
                          styles.providerPill,
                          isProvSelected && { backgroundColor: meta.color, borderColor: meta.color },
                        ]}>
                        <Text
                          style={[
                            styles.providerPillText,
                            isProvSelected && { color: '#FFFFFF' },
                          ]}>
                          {meta.shortName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {newAccountProvider === 'bank' ? (
                  <TextInput
                    style={styles.formInput}
                    value={newBankName}
                    onChangeText={setNewBankName}
                    placeholder="Bank Name (e.g. Meezan Bank, HBL)"
                    placeholderTextColor="#94A3B8"
                  />
                ) : null}

                <TextInput
                  style={styles.formInput}
                  value={newAccountNumber}
                  onChangeText={setNewAccountNumber}
                  placeholder={PAYMENT_PROVIDERS[newAccountProvider].placeholder}
                  placeholderTextColor="#94A3B8"
                />

                <TextInput
                  style={styles.formInput}
                  value={newAccountTitle}
                  onChangeText={setNewAccountTitle}
                  placeholder="Account Title (e.g. Ali Khan)"
                  placeholderTextColor="#94A3B8"
                />

                <Pressable onPress={handleSaveNewAccount} style={styles.saveAccountBtn}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.saveAccountBtnText}>Save Account</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Section 4: Friends Tracker & WhatsApp Nudges */}
            <Text style={styles.sectionHeading}>4. Friend Tracker & Reminders</Text>
            <View style={styles.friendsCard}>
              {currentSplit?.friends.map((friend, idx) => {
                return (
                  <View key={friend.id} style={styles.friendRow}>
                    <View style={styles.friendInfo}>
                      <TextInput
                        style={styles.friendNameInput}
                        value={friend.name}
                        onChangeText={(txt) => updateFriendName(currentSplit.id, friend.id, txt)}
                      />
                      <Text style={styles.friendShareText}>
                        Rs {friend.sharePkr.toLocaleString('en-PK')}
                      </Text>
                    </View>

                    <View style={styles.friendActionRow}>
                      {/* Paid Toggle Button */}
                      <Pressable
                        onPress={() => toggleFriendPaid(currentSplit.id, friend.id)}
                        style={[
                          styles.paidToggleBtn,
                          friend.isPaid ? styles.paidToggleActive : styles.paidTogglePending,
                        ]}>
                        <Ionicons
                          name={friend.isPaid ? 'checkmark-circle' : 'time-outline'}
                          size={14}
                          color={friend.isPaid ? '#047857' : '#B45309'}
                        />
                        <Text
                          style={[
                            styles.paidToggleText,
                            friend.isPaid ? styles.paidTextActive : styles.paidTextPending,
                          ]}>
                          {friend.isPaid ? 'Paid' : 'Pending'}
                        </Text>
                      </Pressable>

                      {/* 1-Tap WhatsApp Nudge Button for Pending Friends */}
                      {!friend.isPaid ? (
                        <Pressable
                          onPress={() => handleNudgeFriend(friend.name, friend.sharePkr)}
                          style={styles.nudgeBtn}>
                          <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
                          <Text style={styles.nudgeBtnText}>Nudge</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Section 5: Set Notification Reminder */}
            <Text style={styles.sectionHeading}>5. App Notification Reminder</Text>
            <Text style={styles.subFieldNotice}>
              Schedule an automatic in-app notification to remind friends who haven&apos;t paid yet:
            </Text>

            {reminderNotice ? (
              <View style={styles.reminderNoticeBox}>
                <Ionicons name="checkmark-circle" size={16} color="#047857" />
                <Text style={styles.reminderNoticeText}>{reminderNotice}</Text>
              </View>
            ) : null}

            <View style={styles.chipsRow}>
              {REMINDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.label}
                  onPress={() => handleScheduleReminder(opt.minutes, opt.label)}
                  style={styles.reminderChip}>
                  <Ionicons name="notifications-outline" size={12} color="#0E382C" />
                  <Text style={styles.reminderChipText}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <View style={styles.footerButtonsRow}>
              <Pressable onPress={handleCopySummary} style={styles.copyBtn}>
                <Ionicons
                  name={copiedNotice ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color={copiedNotice ? '#047857' : '#0F172A'}
                />
                <Text
                  style={[
                    styles.copyBtnText,
                    copiedNotice && styles.copyBtnTextActive,
                  ]}>
                  {copiedNotice ? 'Copied!' : 'Copy'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share Split on WhatsApp"
                onPress={handleShareWhatsApp}
                style={styles.shareBtn}>
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>Share Split on WhatsApp</Text>
              </Pressable>
            </View>
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
  easyBadge: {
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
  easyBadgeText: {
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
  heroCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginBottom: 12,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  heroTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0E382C',
  },
  pricePer: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 10,
    gap: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: Radii.pill,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  splitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pkrCurrencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    color: '#047857',
    marginRight: 6,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 8,
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0E382C',
    minWidth: 16,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#0E382C',
    borderColor: '#0E382C',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  addAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EAF4F0',
    borderRadius: Radii.pill,
  },
  addAccountBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  accountChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  accountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 130,
    maxWidth: 160,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  accountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  accountCardNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  accountCardTitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  addAccountForm: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    gap: 8,
  },
  addAccountFormTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  providerPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  providerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  providerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 12,
    color: '#0F172A',
  },
  saveAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#047857',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 2,
  },
  saveAccountBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  friendsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  friendInfo: {
    flex: 1,
    marginRight: 8,
  },
  friendNameInput: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 2,
  },
  friendShareText: {
    fontSize: 11,
    color: '#64748B',
  },
  friendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paidToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  paidToggleActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  paidTogglePending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  paidToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paidTextActive: {
    color: '#047857',
  },
  paidTextPending: {
    color: '#B45309',
  },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subFieldNotice: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  reminderNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  reminderNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reminderChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E382C',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  footerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  copyBtnTextActive: {
    color: '#047857',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
      },
      default: {
        elevation: 3,
        shadowColor: '#25D366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
    }),
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
