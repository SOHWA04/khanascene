import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandColors, Radii, Spacing, Typography } from '@/theme';
import { BankCardDeal, KhanaSceneMenuItem } from '@/types/restaurant';
import {
  BillItem,
  calculateBillEstimate,
  shareBillSplitOnWhatsApp,
} from '@/utils/billEstimator';

export interface BillEstimatorModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantName: string;
  availableMenuItems?: KhanaSceneMenuItem[];
  availableCardDeals?: BankCardDeal[];
  initialItems?: BillItem[];
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
}: BillEstimatorModalProps) {
  const [items, setItems] = useState<BillItem[]>(initialItems);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(
    availableCardDeals.length > 0 ? availableCardDeals[0].id : null
  );
  const [customDiscountText, setCustomDiscountText] = useState<string>('');
  const [taxPercentage, setTaxPercentage] = useState<number>(16);
  const [serviceChargePercentage, setServiceChargePercentage] = useState<number>(0);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [showItemPicker, setShowItemPicker] = useState<boolean>(false);

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
      activeDeal ? activeDeal.bankName : undefined
    );
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
                <Ionicons name="calculator" size={13} color={BrandColors.white} />
                <Text style={styles.estimatorBadgeText}>Bill & Tax Estimator</Text>
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
              <Ionicons name="close" size={20} color={BrandColors.charcoal} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <Text style={styles.subtitle}>
              Estimate your dine-in bill with verified PKR prices, bank card discounts, and standard 16% GST.
            </Text>

            {/* Section 1: Bill Items */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>1. Selected Menu Items</Text>
              {availableMenuItems.length > 0 ? (
                <Pressable
                  onPress={() => setShowItemPicker((v) => !v)}
                  style={styles.addItemsBtn}>
                  <Ionicons name="add-circle-outline" size={15} color={BrandColors.primaryGreen} />
                  <Text style={styles.addItemsBtnText}>
                    {showItemPicker ? 'Close Menu' : '+ Add Item'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* In-Modal Menu Picker */}
            {showItemPicker && availableMenuItems.length > 0 ? (
              <View style={styles.menuPickerBox}>
                <Text style={styles.menuPickerTitle}>Tap to add to bill estimate:</Text>
                {availableMenuItems.map((menuItem) => (
                  <Pressable
                    key={menuItem.id}
                    onPress={() => addItemToBill(menuItem)}
                    style={styles.menuPickerItem}>
                    <View style={styles.menuPickerItemText}>
                      <Text style={styles.menuPickerItemName}>{menuItem.name}</Text>
                      <Text style={styles.menuPickerItemCategory}>{menuItem.category}</Text>
                    </View>
                    <Text style={styles.menuPickerItemPrice}>
                      +Rs {menuItem.pricePkr.toLocaleString('en-PK')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {items.length === 0 ? (
              <View style={styles.emptyItemsBox}>
                <Text style={styles.emptyItemsText}>
                  {availableMenuItems.length > 0
                    ? 'No items selected yet. Tap "+ Add Item" above to choose dishes.'
                    : 'Enter an estimated food subtotal below.'}
                </Text>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>
                        Rs {item.pricePkr.toLocaleString('en-PK')} each
                      </Text>
                    </View>
                    <View style={styles.qtyControls}>
                      <Pressable
                        onPress={() => updateItemQuantity(item.id, -1)}
                        style={styles.qtyBtn}>
                        <Ionicons name="remove" size={14} color={BrandColors.charcoal} />
                      </Pressable>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <Pressable
                        onPress={() => updateItemQuantity(item.id, 1)}
                        style={styles.qtyBtn}>
                        <Ionicons name="add" size={14} color={BrandColors.charcoal} />
                      </Pressable>
                    </View>
                    <Text style={styles.itemTotal}>
                      Rs {(item.pricePkr * item.quantity).toLocaleString('en-PK')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Custom Amount / Add Extra */}
            <Text style={styles.fieldLabel}>Custom Amount / Extra Items (PKR)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 2500 (extra drinks, sides, etc.)"
              placeholderTextColor={BrandColors.mutedGrey}
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
                      color={isSelected ? BrandColors.white : '#B45309'}
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
                placeholderTextColor={BrandColors.mutedGrey}
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
            <Text style={styles.sectionHeading}>4. Split Bill Between Friends</Text>
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
                      color={isSelected ? BrandColors.white : BrandColors.charcoal}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {count} {count === 1 ? 'person' : 'people'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

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
                    <Ionicons name="people" size={16} color={BrandColors.deepForestGreen} />
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

          {/* Footer Action */}
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share Bill Split on WhatsApp"
              onPress={handleShareWhatsApp}
              style={styles.shareBtn}>
              <Ionicons name="logo-whatsapp" size={18} color={BrandColors.white} />
              <Text style={styles.shareBtnText}>Share Split on WhatsApp</Text>
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
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: '92%',
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderSubtle,
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: Spacing.md,
  },
  estimatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.primaryGreen,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    marginBottom: 4,
  },
  estimatorBadgeText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: BrandColors.charcoal,
  },
  closeBtn: {
    padding: Spacing.xs,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.warmCream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.lightGreen,
  },
  addItemsBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  menuPickerBox: {
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    marginBottom: Spacing.sm,
    maxHeight: 180,
  },
  menuPickerTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.mutedGrey,
    marginBottom: 6,
  },
  menuPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderSubtle,
  },
  menuPickerItemText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  menuPickerItemName: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  menuPickerItemCategory: {
    fontSize: 10,
    color: BrandColors.mutedGrey,
  },
  menuPickerItemPrice: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.primaryGreen,
  },
  emptyItemsBox: {
    backgroundColor: BrandColors.warmCream,
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  emptyItemsText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    textAlign: 'center',
  },
  itemsList: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.warmCream,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  itemName: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  itemPrice: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: Spacing.sm,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  qtyText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: BrandColors.charcoal,
    minWidth: 16,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
    minWidth: 65,
    textAlign: 'right',
  },
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.mutedGrey,
    marginTop: 4,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
    backgroundColor: BrandColors.warmCream,
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    backgroundColor: BrandColors.warmCream,
  },
  chipSelected: {
    backgroundColor: BrandColors.primaryGreen,
    borderColor: BrandColors.primaryGreen,
  },
  chipDealSelected: {
    backgroundColor: '#B45309',
    borderColor: '#B45309',
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.charcoal,
  },
  chipTextSelected: {
    color: BrandColors.white,
  },
  dealNotice: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#B45309',
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1.5,
    borderColor: BrandColors.primaryGreen,
    gap: 6,
  },
  summaryTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
  },
  summaryValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.charcoal,
  },
  summaryLabelGreen: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: '#15803D',
  },
  summaryValueGreen: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: '#15803D',
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.borderSubtle,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  totalValue: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: BrandColors.deepForestGreen,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BrandColors.white,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    marginTop: 6,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  splitIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitTextBox: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
    fontWeight: '600',
  },
  splitValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: BrandColors.primaryGreen,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#25D366',
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.white,
  },
});
