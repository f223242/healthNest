import { colors, Fonts } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Collapsible from 'react-native-collapsible';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  accentColor?: string;
}

interface FAQItemComponentProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  accentColor: string;
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({ item, isExpanded, onToggle, accentColor }) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.questionIconContainer, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name="help-circle" size={20} color={accentColor} />
        </View>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <View style={[styles.chevronContainer, isExpanded && { backgroundColor: accentColor + '15' }]}>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={isExpanded ? accentColor : colors.gray}
          />
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={!isExpanded} duration={300}>
        <View style={[styles.answerContainer, { borderLeftColor: accentColor }]}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      </Collapsible>
    </View>
  );
};

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, accentColor = colors.primary }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {faqs.map((faq, index) => (
        <FAQItemComponent
          key={index}
          item={faq}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
          accentColor={accentColor}
        />
      ))}
    </View>
  );
};

export default FAQAccordion;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  questionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.text,
    lineHeight: 20,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    marginLeft: 14,
    borderLeftWidth: 2,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.gray,
    lineHeight: 20,
    paddingLeft: 36,
  },
});
