import React, { useMemo, useState } from 'react';
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

import { Radii } from '@/theme';
import { PAYMENT_PROVIDERS } from '@/types/paymentAccounts';
import { usePaymentAccountsStore } from '@/stores/usePaymentAccountsStore';
import { BankCardDeal, KhanaSceneMenuItem } from '@/types/restaurant';
import {
  BillItem,
  calculateBillEstimate,
  formatBillSplitWhatsAppMessage,
  shareBillSplitOnWhatsApp,
} from '@/utils/billEstimator';

export interface BillEstimatorModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantName: string;
  availableMenuItems?: KhanaSceneMenuItem[];
  availableCardDeals?: BankCardDeal[];
  initialItems?: BillItem[];
  initialSplitCount?: number;
}

const GST_OPTIONS = [
  { label: '16% ICT / PRA GST (Standard)', value: 16 },
  { label: '5% POS Card Rate', value: 5 },
  { label: '0% No Tax / Included', value: 0 },
];

const SERVICE_CHARGE_OPTIONS = [
  { label: '0%', value: 0 },
  { label: '5%', value: 5 },
  { label: '7.5%', value: 7.5 },
  { label: '10%', value: 10 },
];

const SPLIT_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

export function BillEstimatorModal({
  visible,
  onClose,
  restaurantName,
  availableMenuItems = [],
  availableCardDeals = [],
  initialItems = [],
  initialSplitCount = 4,
}: BillEstimatorModalProps) {
  const [items, setItems] = useState<BillItem[]>(initialItems);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(
    availableCardDeals.length > 0 ? availableCardDeals[0].id : null
  );
  const [customDiscountText, setCustomDiscountText] = useState<string>('');
  const [taxPercentage, setTaxPercentage] = useState<number>(16);
  const [serviceChargePercentage, setServiceChargePercentage] = useState<number>(0);
  const [splitCount, setSplitCount] = useState<number>(initialSplitCount);
  const [paymentAccountText, setPaymentAccountText] = useState<string>('');
  const [showItemPicker, setShowItemPicker] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const { accounts, formatAccountForTransfer } = usePaymentAccountsStore();

  const defaultAccountFormatted = useMemo(() => {
    if (accounts.length === 0) return '';
    const def = accounts.find((a) => a.isDefault) ?? accounts[0];
    return formatAccountForTransfer(def);
  }, [accounts, formatAccountForTransfer]);

  const activePaymentAccount = paymentAccountText || defaultAccountFormatted;

  const activeDeal = useMemo(() => {
    if (!selectedDealId || selectedDealId === 'none' || selectedDealId === 'custom') {
      return null;
    }
    return availableCardDeals.find((d) => d.id === selectedDealId) ?? null;
  }, [selectedDealId, availableCardDeals]);

  const resolvedDiscountPct = useMemo(() => {
    if (selectedDealId === 'custom') {
      const parsed = parseFloat(customDiscountText);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (activeDeal) {
      return activeDeal.discountPercentage;
    }
    return 0;
  }, [selectedDealId, customDiscountText, activeDeal]);

  const customAmountNumber = useMemo(() => {
    const parsed = parseFloat(customAmountText.replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }, [customAmountText]);

  const estimateResult = useMemo(() => {
    return calculateBillEstimate({
      restaurantName,
      items,
      customAmount: customAmountNumber,
      bankDiscountPercentage: resolvedDiscountPct,
      bankName: activeDeal ? activeDeal.bankName : selectedDealId === 'custom' ? 'Custom' : undefined,
      maxDiscountPkr: activeDeal?.maxDiscountPkr,
      taxPercentage,
      serviceChargePercentage,
      splitCount,
    });
  }, [
    restaurantName,
    items,
    customAmountNumber,
    resolvedDiscountPct,
    activeDeal,
    selectedDealId,
    taxPercentage,
    serviceChargePercentage,
    splitCount,
  ]);

  const addItemToBill = (menuItem: KhanaSceneMenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          pricePkr: menuItem.pricePkr,
          quantity: 1,
        },
      ];
    });
    setShowItemPicker(false);
  };

  const updateItemQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter((i): i is BillItem => i !== null)
    );
  };

  const handleShareWhatsApp = () => {
    shareBillSplitOnWhatsApp(
      restaurantName,
      estimateResult,
      activeDeal ? activeDeal.bankName : undefined,
      activePaymentAccount
    );
  };

  const handleCopyReceipt = () => {
    const text = formatBillSplitWhatsAppMessage(
      restaurantName,
      estimateResult,
      activeDeal ? activeDeal.bankName : undefined,
      activePaymentAccount
    );
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.estimatorBadge}>
                <Ionicons name="calculator" size={13} color="#0E382C" />
                <Text style={styles.estimatorBadgeText}>Contri Splitter & Tax Estimator</Text>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {restaurantName}
              </Text>
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
              No more awkward bill math! Calculate exact per-head contri with 16% GST, service charges, and card deals.
            </Text>

            {/* Live Per-Person Contri Hero Card */}
            <View style={styles.contriHeroCard}>
              <View style={styles.contriHeroHeader}>
                <Ionicons name="cash-outline" size={18} color="#047857" />
                <Text style={styles.contriHeroTag}>
                  {estimateResult.splitCount > 1 ? 'CONTRI PER HEAD' : 'ESTIMATED TOTAL'}
                </Text>
              </View>
              <View style={styles.contriPriceRow}>
                <Text style={styles.contriPriceNumber}>
                  Rs {estimateResult.perPersonPkr.toLocaleString('en-PK')}
                </Text>
                {estimateResult.splitCount > 1 ? (
                  <Text style={styles.contriPricePer}>/ person</Text>
                ) : null}
              </View>
              <Text style={styles.contriSubtitle}>
                {estimateResult.splitCount > 1
                  ? `Split equally between ${estimateResult.splitCount} friends (Total: Rs ${estimateResult.totalPkr.toLocaleString('en-PK')})`
                  : `Includes GST & discounts (Total: Rs ${estimateResult.totalPkr.toLocaleString('en-PK')})`}
              </Text>
              {estimateResult.discountAmountPkr > 0 ? (
                <View style={styles.contriSavingsTag}>
                  <Ionicons name="sparkles" size={12} color="#065F46" />
                  <Text style={styles.contriSavingsText}>
                    Saved Rs {estimateResult.discountAmountPkr.toLocaleString('en-PK')} with card discount!
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Section 1: Bill Items */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>1. Selected Menu Items</Text>
              {availableMenuItems.length > 0 ? (
                <Pressable
                  onPress={() => setShowItemPicker((v) => !v)}
                  style={styles.addItemsBtn}>
                  <Ionicons name="add-circle" size={15} color="#126149" />
                  <Text style={styles.addItemsBtnText}>
                    {showItemPicker ? 'Close Menu' : '+ Add Item'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Menu Item Picker Dropdown */}
            {showItemPicker ? (
              <ScrollView nestedScrollEnabled style={styles.menuPickerBox}>
                <Text style={styles.menuPickerTitle}>Tap to add dishes from verified menu:</Text>
                {availableMenuItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => addItemToBill(item)}
                    style={styles.menuPickerItem}>
                    <View style={styles.menuPickerItemText}>
                      <Text style={styles.menuPickerItemName}>{item.name}</Text>
                      <Text style={styles.menuPickerItemCategory}>{item.category}</Text>
                    </View>
                    <Text style={styles.menuPickerItemPrice}>
                      Rs {item.pricePkr.toLocaleString('en-PK')}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {items.length === 0 ? (
              <View style={styles.emptyItemsBox}>
                <Text style={styles.emptyItemsText}>
                  No dishes added yet. Tap &quot;+ Add Item&quot; or type a custom bill amount below.
                </Text>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemPrice}>
                        Rs {(item.pricePkr * item.quantity).toLocaleString('en-PK')}{' '}
                        {item.quantity > 1 ? `(${item.quantity} × Rs ${item.pricePkr.toLocaleString('en-PK')})` : ''}
                      </Text>
                    </View>
                    <View style={styles.qtyControls}>
                      <Pressable
                        onPress={() => updateItemQuantity(item.id, -1)}
                        style={styles.qtyBtn}>
                        <Ionicons name="remove" size={14} color="#0F172A" />
                      </Pressable>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <Pressable
                        onPress={() => updateItemQuantity(item.id, 1)}
                        style={styles.qtyBtn}>
                        <Ionicons name="add" size={14} color="#0F172A" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Custom Amount / Add Extra */}
            <Text style={styles.fieldLabel}>Custom Amount / Extra Items (PKR)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 2500 (extra drinks, sides, etc.)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={customAmountText}
              onChangeText={setCustomAmountText}
            />

            {/* Section 2: Bank Card Discount */}
            <Text style={styles.sectionHeading}>2. Bank Card Discount</Text>
            <View style={styles.chipsRow}>
              {availableCardDeals.map((deal) => {
                const isSelected = selectedDealId === deal.id;
                return (
                  <Pressable
                    key={deal.id}
                    onPress={() => setSelectedDealId(deal.id)}
                    style={[styles.chip, isSelected && styles.chipDealSelected]}>
                    <Ionicons
                      name="card"
                      size={13}
                      color={isSelected ? '#FFFFFF' : '#B45309'}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {deal.bankName} ({deal.discountPercentage}% OFF)
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => setSelectedDealId('custom')}
                style={[styles.chip, selectedDealId === 'custom' && styles.chipDealSelected]}>
                <Text
                  style={[
                    styles.chipText,
                    selectedDealId === 'custom' && styles.chipTextSelected,
                  ]}>
                  Custom %
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedDealId('none')}
                style={[styles.chip, selectedDealId === 'none' && styles.chipSelected]}>
                <Text
                  style={[
                    styles.chipText,
                    selectedDealId === 'none' && styles.chipTextSelected,
                  ]}>
                  No Discount
                </Text>
              </Pressable>
            </View>

            {selectedDealId === 'custom' ? (
              <TextInput
                style={styles.textInput}
                placeholder="Enter discount percentage (e.g. 20)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={customDiscountText}
                onChangeText={setCustomDiscountText}
              />
            ) : null}

            {activeDeal?.maxDiscountPkr ? (
              <Text style={styles.dealNotice}>
                *Max discount for this card tier is capped at Rs{' '}
                {activeDeal.maxDiscountPkr.toLocaleString('en-PK')}.
              </Text>
            ) : null}

            {/* Section 3: Tax (GST) & Service Charge */}
            <Text style={styles.sectionHeading}>3. Sales Tax & Service Charge</Text>
            <Text style={styles.subFieldLabel}>Sales Tax (GST)</Text>
            <View style={styles.chipsRow}>
              {GST_OPTIONS.map((opt) => {
                const isSelected = taxPercentage === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTaxPercentage(opt.value)}
                    style={[styles.chip, isSelected && styles.chipSelected]}>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.subFieldLabel}>Service Charge</Text>
            <View style={styles.chipsRow}>
              {SERVICE_CHARGE_OPTIONS.map((opt) => {
                const isSelected = serviceChargePercentage === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setServiceChargePercentage(opt.value)}
                    style={[styles.chip, isSelected && styles.chipSelected]}>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Section 4: Group Split */}
            <View style={styles.splitHeaderRow}>
              <Text style={styles.sectionHeading}>4. Split Bill Between Friends</Text>
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
              {SPLIT_OPTIONS.map((count) => {
                const isSelected = splitCount === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => setSplitCount(count)}
                    style={[styles.chip, isSelected && styles.chipSelected]}>
                    <Ionicons
                      name="people-outline"
                      size={13}
                      color={isSelected ? '#FFFFFF' : '#0F172A'}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {count} {count === 1 ? 'person' : 'friends'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Payment Account Note (EasyPaisa / Nayapay / Sadapay) */}
            <Text style={styles.fieldLabel}>Receive Money via (Easypaisa / Nayapay / Sadapay / Bank)</Text>

            {accounts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedAccountsRow}>
                {accounts.map((acc) => {
                  const meta = PAYMENT_PROVIDERS[acc.provider];
                  const formatted = formatAccountForTransfer(acc);
                  const isSelected = activePaymentAccount === formatted;
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => setPaymentAccountText(formatted)}
                      style={[
                        styles.savedAccountChip,
                        isSelected && { borderColor: meta?.color ?? '#047857', backgroundColor: meta?.badgeBg ?? '#ECFDF5' },
                      ]}>
                      <Ionicons name={(meta?.icon as any) ?? 'cash-outline'} size={12} color={meta?.color ?? '#0F172A'} />
                      <Text style={[styles.savedAccountChipText, isSelected && { color: meta?.badgeColor ?? '#047857', fontWeight: '800' }]}>
                        {meta?.shortName ?? acc.provider}: {acc.accountNumber}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}

            <TextInput
              style={styles.textInput}
              placeholder="e.g. Send to 0300-1234567 or @handle"
              placeholderTextColor="#94A3B8"
              value={activePaymentAccount}
              onChangeText={setPaymentAccountText}
            />

            {/* Bill Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Estimated Bill Breakdown</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Food Subtotal</Text>
                <Text style={styles.summaryValue}>
                  Rs {estimateResult.subtotalPkr.toLocaleString('en-PK')}
                </Text>
              </View>

              {estimateResult.discountAmountPkr > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabelGreen}>
                    Card Discount ({estimateResult.discountPercentage}%)
                  </Text>
                  <Text style={styles.summaryValueGreen}>
                    -Rs {estimateResult.discountAmountPkr.toLocaleString('en-PK')}
                  </Text>
                </View>
              ) : null}

              {estimateResult.taxAmountPkr > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Sales Tax ({estimateResult.taxPercentage}% GST)
                  </Text>
                  <Text style={styles.summaryValue}>
                    +Rs {estimateResult.taxAmountPkr.toLocaleString('en-PK')}
                  </Text>
                </View>
              ) : null}

              {estimateResult.serviceChargeAmountPkr > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Service Charge ({estimateResult.serviceChargePercentage}%)
                  </Text>
                  <Text style={styles.summaryValue}>
                    +Rs {estimateResult.serviceChargeAmountPkr.toLocaleString('en-PK')}
                  </Text>
                </View>
              ) : null}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Estimated Total</Text>
                <Text style={styles.totalValue}>
                  Rs {estimateResult.totalPkr.toLocaleString('en-PK')}
                </Text>
              </View>

              {estimateResult.splitCount > 1 ? (
                <View style={styles.splitRow}>
                  <View style={styles.splitIconBox}>
                    <Ionicons name="people" size={16} color="#0E382C" />
                  </View>
                  <View style={styles.splitTextBox}>
                    <Text style={styles.splitLabel}>
                      Per Person ({estimateResult.splitCount} friends):
                    </Text>
                    <Text style={styles.splitValue}>
                      Rs {estimateResult.perPersonPkr.toLocaleString('en-PK')} each
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <View style={styles.footerButtonsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Copy Contri Breakdown"
                onPress={handleCopyReceipt}
                style={styles.copyBtn}>
                <Ionicons
                  name={copiedNotice ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={copiedNotice ? '#047857' : '#0F172A'}
                />
                <Text style={[styles.copyBtnText, copiedNotice && styles.copyBtnTextActive]}>
                  {copiedNotice ? 'Copied! ✅' : 'Copy'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share Bill Split on WhatsApp"
                onPress={handleShareWhatsApp}
                style={styles.shareBtn}>
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>Share Contri on WhatsApp</Text>
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
    maxHeight: '92%',
    paddingBottom: 24,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  estimatorBadge: {
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
  estimatorBadgeText: {
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
    paddingTop: 14,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  contriHeroCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  contriHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contriHeroTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  contriPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  contriPriceNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#065F46',
  },
  contriPricePer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  contriSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#065F46',
  },
  contriSavingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  contriSavingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 6,
  },
  splitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
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
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: '#EAF4F0',
  },
  addItemsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#126149',
  },
  menuPickerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    maxHeight: 180,
  },
  menuPickerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  menuPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuPickerItemText: {
    flex: 1,
    marginRight: 8,
  },
  menuPickerItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuPickerItemCategory: {
    fontSize: 10,
    color: '#64748B',
  },
  menuPickerItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#126149',
  },
  emptyItemsBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyItemsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  itemsList: {
    gap: 6,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemPrice: {
    fontSize: 11,
    color: '#64748B',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 16,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  savedAccountsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
    marginBottom: 6,
  },
  savedAccountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedAccountChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.pill,
  },
  chipSelected: {
    backgroundColor: '#0E382C',
    borderColor: '#0E382C',
  },
  chipDealSelected: {
    backgroundColor: '#B45309',
    borderColor: '#B45309',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  dealNotice: {
    fontSize: 11,
    color: '#B45309',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 12,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryLabelGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  summaryValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E382C',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0E382C',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  splitIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radii.pill,
    backgroundColor: '#EAF4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitTextBox: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  splitValue: {
    fontSize: 13,
    fontWeight: '800',
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
