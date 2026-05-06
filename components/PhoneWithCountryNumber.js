import React from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

// import your styles, colors, fonts
import { COLORS, FONTS } from '../constants/theme';

const PhoneInputWithCountry = ({
    phone,
    setPhone,
    countryCode,
    setCountryCode,
    countriesWithFlags,
    editable = true,
    colors,
    styles,
}) => {
    return (
        <View style={styles.inputStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 5 }}>

                <SelectDropdown
                    data={countriesWithFlags}
                    defaultValue={countriesWithFlags[0]}
                    onSelect={(selectedItem) => setCountryCode(selectedItem.title)}

                    renderButton={(selectedItem) => (
                        <View style={styles.dropdownButtonStyle2}>
                            {selectedItem && (
                                <View style={{
                                    borderWidth: 1,
                                    borderColor: colors.borderColor,
                                    overflow: 'hidden',
                                    marginRight: 5,
                                    borderRadius: 5
                                }}>
                                    <Image style={{ width: 30, height: 20 }} source={selectedItem.image} />
                                </View>
                            )}
                            <Text style={{ ...FONTS.fontLg, color: COLORS.dark }}>
                                {selectedItem ? selectedItem.title : '000'}
                            </Text>
                        </View>
                    )}

                    renderItem={(item) => (
                        <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: 10, ...styles.dropdownItemStyle }}>
                            <Image style={{ width: 30, height: 20 }} source={item.image} />
                            <Text style={{ ...FONTS.fontLg, color: COLORS.dark }}>
                                {item.title}
                            </Text>
                        </View>
                    )}

                    dropdownStyle={{ borderRadius: 5 }}
                />

                <TextInput
                    style={{ ...FONTS.fontLg, color: COLORS.black, width: '75%' }}
                    value={phone}
                    editable={editable}
                    onChangeText={setPhone}
                    keyboardType="numeric"
                    maxLength={
                        countryCode === '+971' ? 9 :
                            countryCode === '+1' ? 10 :
                                10
                    }
                />

            </View>
        </View>
    );
};

export default PhoneInputWithCountry;