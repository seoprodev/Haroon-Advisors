import React from 'react';
import { SafeAreaView, ScrollView, Text, View, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const TermsUse = (props) => {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    const renderBulletPoint = (textKey) => {
        const isArabic = i18next.language === 'ar';

        return (
            <View
                style={{
                    flexDirection: isArabic ? 'row-reverse' : 'row',
                    // alignItems: 'flex-start',
                    marginBottom: 10,
                }}
            >
                <View
                    style={{
                        height: 6,
                        width: 6,
                        borderRadius: 3,
                        backgroundColor: colorScheme === 'dark' ? COLORS.white : colors.title,
                        marginTop: 6,
                        marginRight: isArabic ? 0 : 10,
                        marginLeft: isArabic ? 10 : 0,
                    }}
                />
                <Text
                    style={[
                        FONTS.font,
                        {
                            flex: 1,
                            color: colorScheme === 'dark' ? COLORS.white : colors.text,
                            textAlign: isArabic ? 'right' : 'left',
                            writingDirection: isArabic ? 'rtl' : 'ltr',
                        },
                    ]}
                >
                    {t(textKey)}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? COLORS.black : COLORS.white }}>
            {/* <Header title={t('terms_of_use_title')} leftIcon={'back'} /> */}
            <ScrollView style={{ paddingHorizontal: 10 }}>
                <View style={[GlobalStyleSheet.container, { paddingRight: 30 }]}>

                    <Text style={{ ...FONTS.font, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('terms_conditions_intro')}
                    </Text>

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('website_ownership_title')}
                    </Text>
                    {renderBulletPoint('website_ownership')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('services_provided_title')}
                    </Text>
                    {renderBulletPoint('services_provided')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('eligibility_title')}
                    </Text>
                    {renderBulletPoint('eligibility')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('client_lawyer_relationship_title')}
                    </Text>
                    {renderBulletPoint('client_lawyer_relationship')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('confidentiality_title')}
                    </Text>
                    {renderBulletPoint('confidentiality')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('fees_and_payments_title')}
                    </Text>
                    {renderBulletPoint('fees_and_payments')}
                    {renderBulletPoint('initial_appointment_fee')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('use_of_information_title')}
                    </Text>
                    {renderBulletPoint('use_of_information')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('code_of_conduct_title')}
                    </Text>
                    {renderBulletPoint('code_of_conduct')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('liability_title')}
                    </Text>
                    {renderBulletPoint('liability')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('indemnification_title')}
                    </Text>
                    {renderBulletPoint('indemnification')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('modification_of_terms_title')}
                    </Text>
                    {renderBulletPoint('modification_of_terms')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('governing_law_title')}
                    </Text>
                    {renderBulletPoint('governing_law')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('trade_restrictions_title')}
                    </Text>
                    {renderBulletPoint('trade_restrictions')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('transaction_records_title')}
                    </Text>
                    {renderBulletPoint('transaction_records')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('account_confidentiality_title')}
                    </Text>
                    {renderBulletPoint('account_confidentiality')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('contact_us_title')}
                    </Text>
                    {renderBulletPoint('contact_us_2')}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsUse;