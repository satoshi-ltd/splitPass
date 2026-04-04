import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSlides } from './Onboarding.constants';
import { style } from './Onboarding.style';
import { Button, Pagination, ScrollView, Text, View } from '../../design-system';
import { L10N } from '../../modules';

const Onboarding = ({ navigation }) => {
  const scrollviewRef = useRef(null);
  const { width } = useWindowDimensions();
  const slides = getSlides();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (scrollviewRef.current) scrollviewRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
  };

  const handleSubmit = async () => {
    navigation.navigate('passphrase', { mode: 'setup' });
  };

  const spaceXL = StyleSheet.value('$spaceXL');
  const lastSlide = currentIndex === slides.length - 1;
  const slideSize = width - spaceXL * 2;

  return (
    <SafeAreaView style={style.screen}>
      <ScrollView
        decelerationRate="fast"
        horizontal
        pagingEnabled
        ref={scrollviewRef}
        scrollEventThrottle={10}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        onScroll={handleScroll}
      >
        {slides.map(({ image, subtitle, title }, index) => (
          <View key={index} style={[style.slide, { width }]}>
            <Image
              resizeMode="contain"
              source={image}
              style={[style.image, { height: slideSize * 1.2, width: slideSize }]}
            />
            <Text bold size="xl" tone="accent" style={style.title}>
              {title}
            </Text>
            <Text bold size="l" tone="secondary" style={style.subtitle}>
              {subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View row style={style.footer}>
        <Pagination currentIndex={currentIndex} length={slides.length} />

        <Button
          variant="primary"
          onPress={lastSlide ? handleSubmit : handleNext}
          style={style.button}
        >
          {lastSlide ? L10N.START : L10N.NEXT}
        </Button>
      </View>
    </SafeAreaView>
  );
};

Onboarding.propTypes = {
  navigation: PropTypes.any,
};

export { Onboarding };
