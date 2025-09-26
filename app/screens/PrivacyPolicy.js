import React from 'react';
import { SafeAreaView, ScrollView, Text, View, useColorScheme, I18nManager } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FONTS, COLORS } from '../../constants/theme';
// import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const PrivacyPolicy = (props) => {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    const renderBulletPoint = (textKey) => {
        const isRTL = I18nManager.isRTL;

        return (
            <View
                style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
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
                        marginRight: isRTL ? 0 : 10,
                        marginLeft: isRTL ? 10 : 0,
                    }}
                />
                <Text
                    style={[
                        FONTS.font,
                        {
                            flex: 1,
                            color: colorScheme === 'dark' ? COLORS.white : colors.text,
                            textAlign: isRTL ? 'right' : 'left',
                            writingDirection: isRTL ? 'rtl' : 'ltr',
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
            {/* <Header title={t('privacy_policy_title')} leftIcon={'back'} /> */}
            <ScrollView>
                <View style={[GlobalStyleSheet.container, { paddingRight: 30 }]}>

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('information_collect_title')}
                    </Text>
                    {renderBulletPoint('contact_information')}
                    {renderBulletPoint('payment_details')}
                    {renderBulletPoint('call_or_email_records')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('how_information_collected_title')}
                    </Text>
                    {renderBulletPoint('visit_website')}
                    {renderBulletPoint('contact_us')}
                    {renderBulletPoint('upload_social_media')}
                    {renderBulletPoint('enter_contests')}
                    {renderBulletPoint('respond_surveys')}
                    {renderBulletPoint('fill_forms')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('additional_privacy_statements_title')}
                    </Text>
                    {renderBulletPoint('credit_debit_card_details')}
                    {renderBulletPoint('data_privacy_security')}
                    {renderBulletPoint('third_party_links')}
                    {renderBulletPoint('policy_updates')}
                    {renderBulletPoint('payment_confirmation')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('refund_policy_title')}
                    </Text>
                    {renderBulletPoint('lawyer_unavailability')}
                    {renderBulletPoint('refund_process')}

                    <Text style={{ ...FONTS.h3, marginBottom: 10, color: colorScheme === 'dark' ? COLORS.white : colors.title, textAlign: i18next.language === 'ar' ? 'right' : 'left' }}>
                        {t('cancellation_policy_title')}
                    </Text>
                    {renderBulletPoint('no_cancellation')}
                    {renderBulletPoint('appointment_rescheduling')}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPolicy;