import React, { useEffect, useState } from 'react';
import { useTheme, useNavigation } from '@react-navigation/native';
import { View, BackHandler, Animated } from 'react-native';
import List from './List';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
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
      <Animated.View style={{ backgroundColor, borderRadius: 5, padding: 10, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 100, height: 100, borderRadius: 5, backgroundColor: '#FFF', marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <View style={{ width: '70%', height: 20, backgroundColor: '#FFF', marginBottom: 8 }} />
            <View style={{ width: '50%', height: 20, backgroundColor: '#FFF', marginBottom: 8 }} />
            <View style={{ width: '80%', height: 20, backgroundColor: '#FFF' }} />
          </View>
        </View>
      </Animated.View>
      <Animated.View style={{ backgroundColor, borderRadius: 5, padding: 10, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 100, height: 100, borderRadius: 5, backgroundColor: '#FFF', marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <View style={{ width: '70%', height: 20, backgroundColor: '#FFF', marginBottom: 8 }} />
            <View style={{ width: '50%', height: 20, backgroundColor: '#FFF', marginBottom: 8 }} />
            <View style={{ width: '80%', height: 20, backgroundColor: '#FFF' }} />
          </View>
        </View>
      </Animated.View>
      <Animated.View style={{ backgroundColor, borderRadius: 5, padding: 10, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 100, height: 100, borderRadius: 5, backgroundColor: '#FFF', marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <View style={{ width: '70%', height: 20, backgroundColor: '#FFF', marginBottom: 8 }} />
            <View style={{ width: '50%', height: 20, backgroundColor: '#FFF', marginBottom: 8 }} />
            <View style={{ width: '80%', height: 20, backgroundColor: '#FFF' }} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const FeaturedLawyers = ({ title, lawyerData, btnTitle, navRoute }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
    };
    fetchData();
  }, []);

  const sortedLawyerData = [...lawyerData].sort((a, b) => {
    if (a.is_online === 0 && b.is_online !== 0) return 1;
    if (a.is_online !== 0 && b.is_online === 0) return -1;
    if (!a.package_id) return 1;
    if (!b.package_id) return -1;
    return 0;
  });

  const renderedLawyers = sortedLawyerData.map(lawyer => (
    <List
      key={lawyer.id}
      image={lawyer.image}
      license={lawyer.license}
      title={lawyer.name}
      ar_title={lawyer.ar_name}
      location={lawyer.location.location}
      rating={lawyer.fee}
      designation={lawyer.designations}
      ar_designation={lawyer.ar_designations}
      department={lawyer.department.name}
      packageId={lawyer.package_id}
      packageEndDate={lawyer.package_end_time}
      isOnline={lawyer.is_online}
      onPress={() => {
        router.push({ pathname: '/screens/LawyerProfile', params: lawyer, });
      }}
    />
  ));

  return (
    <>
      <View style={{
        borderBottomWidth: 1,
        borderColor: colors.borderColor,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: i18next.language === 'ar' ? 'row-reverse' : 'row', // Adjust layout for RTL
      }}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {btnTitle && <ThemedButton title={btnTitle} type='default' onPress={() => router.push(navRoute)} />}
      </View>
      {loading ? <SkeletonLoader /> : <View>{renderedLawyers}</View>}
    </>
  );
};

export default FeaturedLawyers;