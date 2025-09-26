import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, api_url, base_url } from '../constants/theme';
import { Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import i18next from 'i18next';

const SkeletonLoader = () => {
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    });
    Animated.loop(animation).start();
    return () => {
      animation.stop();
    };
  }, []);
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E0E0', '#F0F0F0'],
  });
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row' }}>
        <Animated.View style={{ height: 70, width: 70, borderRadius: 5, backgroundColor, marginRight: 15 }} />
        <Animated.View style={{ height: 70, width: 70, borderRadius: 5, backgroundColor, marginRight: 15 }} />
        <Animated.View style={{ height: 70, width: 70, borderRadius: 5, backgroundColor, marginRight: 15 }} />
        <Animated.View style={{ height: 70, width: 70, borderRadius: 5, backgroundColor, marginRight: 15 }} />
        <Animated.View style={{ height: 70, width: 70, borderRadius: 5, backgroundColor, marginRight: 15 }} />
        <Animated.View style={{ height: 70, width: 70, borderRadius: 5, backgroundColor, marginRight: 15 }} />
      </View>
    </View>
  );
};

const DepartmentsSlider = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(api_url + 'departments');
        const data = await response.json();
        setDepartments(data);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching departments:', error);
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);
  const renderedDepartments = departments.map((department, index) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/screens/Lawyers',
          params: { departmentId: department.id },
        })
      }
      activeOpacity={0.8}
      style={styles.departmentItem}
      key={index}
    >
      <View>
        <Image
          style={styles.departmentImage}
          source={{ uri: base_url + department.thumbnail_image }}
        />
      </View>
      <Text
        style={[
          FONTS.fontSm,
          { color: colorScheme === 'dark' ? COLORS.white : COLORS.black }
        ]}
      >
        {i18next.language === 'ar' ? department.ar_name : department.name}
      </Text>
    </TouchableOpacity>

  ));
  return (
    <>
      <ScrollView
        contentContainerStyle={{ paddingVertical: 15 }}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {renderedDepartments}
      </ScrollView>
      {loading ? <SkeletonLoader /> : null}
    </>
  );
};

const styles = StyleSheet.create({
  departmentImage: {
    height: 70,
    width: 70,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    resizeMode: 'contain',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    borderColor: COLORS.primary
  },
  departmentItem: {
    marginRight: 10,
    alignItems: 'center',
  },
});

export default DepartmentsSlider;