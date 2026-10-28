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
import {
  buildTableInquiryMessage,
  formatPakistanWhatsAppNumber,
  openWhatsAppTableInquiry,
} from '@/utils/whatsapp';

export interface WhatsAppInquiryModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantName: string;
  phoneNumber?: string | null;
}

const PARTY_SIZES = [2, 4, 6, 8, '10+'];

const TIME_OPTIONS = [
  'Tonight (8:30 PM)',
  'Tonight (9:30 PM)',
  'Tomorrow Lunch (1:30 PM)',
  'Tomorrow Dinner (8:30 PM)',
  'Custom time',
];

const SEATING_OPTIONS = [
  'Main Hall / Dining',
  'Family / Parda Section',
  'Outdoor / Rooftop Terrace',
];

export function WhatsAppInquiryModal({
  visible,
  onClose,
  restaurantName,
  phoneNumber,
}: WhatsAppInquiryModalProps) {
  const [selectedPartySize, setSelectedPartySize] = useState<number | string>(4);
  const [selectedTimeOption, setSelectedTimeOption] = useState<string>('Tonight (8:30 PM)');
  const [customTime, setCustomTime] = useState<string>('');
  const [selectedSeating, setSelectedSeating] = useState<string>('Main Hall / Dining');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedTime =
    selectedTimeOption === 'Custom time'
      ? customTime.trim() || 'Tonight'
      : selectedTimeOption;

  const previewMessage = useMemo(() => {
    return buildTableInquiryMessage({
      restaurantName,
      partySize: selectedPartySize,
      dateTime: resolvedTime,
      seatingPreference: selectedSeating,
      notes: notes.trim() || undefined,
    });
  }, [restaurantName, selectedPartySize, resolvedTime, selectedSeating, notes]);

  const normalizedPhone = formatPakistanWhatsAppNumber(phoneNumber);

  const handleSendWhatsApp = async () => {
    if (!normalizedPhone) {
      setErrorMessage(
        'A valid phone number is not available for this restaurant listing yet. You can view them directly on Google Maps.'
      );
      return;
    }

    setErrorMessage(null);
    const success = await openWhatsAppTableInquiry(normalizedPhone, {
      restaurantName,
      partySize: selectedPartySize,
      dateTime: resolvedTime,
      seatingPreference: selectedSeating,
      notes: notes.trim() || undefined,
    });

    if (success) {
      onClose();
    } else {
      setErrorMessage(
        'Could not open WhatsApp on your device. Please ensure WhatsApp is installed.'
      );
    }
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
              <View style={styles.whatsappPill}>
                <Ionicons name="logo-whatsapp" size={14} color={BrandColors.white} />
                <Text style={styles.whatsappPillText}>WhatsApp Table Inquiry</Text>
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
              Connect directly with the restaurant front desk on WhatsApp. 100% free with zero booking fee.
            </Text>

            {/* Party Size Selector */}
            <Text style={styles.fieldLabel}>Party Size</Text>
            <View style={styles.chipsRow}>
              {PARTY_SIZES.map((size) => {
                const isSelected = selectedPartySize === size;
                return (
                  <Pressable
                    key={String(size)}
                    onPress={() => setSelectedPartySize(size)}
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
                      {size} {typeof size === 'number' && size === 1 ? 'person' : 'guests'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Time Slot Selector */}
            <Text style={styles.fieldLabel}>Date & Time</Text>
            <View style={styles.chipsRow}>
              {TIME_OPTIONS.map((timeOpt) => {
                const isSelected = selectedTimeOption === timeOpt;
                return (
                  <Pressable
                    key={timeOpt}
                    onPress={() => setSelectedTimeOption(timeOpt)}
                    style={[styles.chip, isSelected && styles.chipSelected]}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color={isSelected ? BrandColors.white : BrandColors.charcoal}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {timeOpt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedTimeOption === 'Custom time' ? (
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Friday 9:00 PM, Sunday 2:00 PM"
                placeholderTextColor={BrandColors.mutedGrey}
                value={customTime}
                onChangeText={setCustomTime}
              />
            ) : null}

            {/* Seating Preference */}
            <Text style={styles.fieldLabel}>Seating Preference</Text>
            <View style={styles.chipsRow}>
              {SEATING_OPTIONS.map((seating) => {
                const isSelected = selectedSeating === seating;
                return (
                  <Pressable
                    key={seating}
                    onPress={() => setSelectedSeating(seating)}
                    style={[styles.chip, isSelected && styles.chipSelected]}>
                    <Ionicons
                      name="restaurant-outline"
                      size={13}
                      color={isSelected ? BrandColors.white : BrandColors.charcoal}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {seating}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Special Notes */}
            <Text style={styles.fieldLabel}>Special Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="e.g. Birthday celebration, need baby high chair, quiet table"
              placeholderTextColor={BrandColors.mutedGrey}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={250}
            />

            {/* Message Preview */}
            <Text style={styles.fieldLabel}>Live WhatsApp Preview</Text>
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Ionicons name="chatbubble-ellipses-outline" size={13} color="#128C7E" />
                <Text style={styles.previewTitle}>Message that will be sent:</Text>
              </View>
              <Text style={styles.previewText}>{previewMessage}</Text>
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={15} color={BrandColors.errorRed} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open in WhatsApp"
              onPress={handleSendWhatsApp}
              style={styles.submitBtn}>
              <Ionicons name="logo-whatsapp" size={18} color={BrandColors.white} />
              <Text style={styles.submitBtnText}>Open in WhatsApp</Text>
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
    maxHeight: '90%',
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
  whatsappPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    marginBottom: 4,
  },
  whatsappPillText: {
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
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
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
  chipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.charcoal,
  },
  chipTextSelected: {
    color: BrandColors.white,
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
  notesInput: {
    height: 64,
    textAlignVertical: 'top',
  },
  previewBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: Spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: '#128C7E',
  },
  previewText: {
    fontSize: Typography.sizes.xs,
    color: '#1B5E20',
    lineHeight: 17,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.errorBackground,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: BrandColors.errorRed,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  submitBtn: {
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
  submitBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.white,
  },
});
