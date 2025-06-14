import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import {
    PanGestureHandler,
    PinchGestureHandler,
    State,
    TapGestureHandler,
} from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ZoomableImage = ({
  imageUri,
  onClose,
  insets,
}: {
  imageUri: string;
  onClose: () => void;
  insets: { top: number };
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  // Entrance animation
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    controlsTimeout.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 3000);
  }, [controlsOpacity]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [resetControlsTimer]);

  const handleClose = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  }, [opacity, onClose]);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], { useNativeDriver: true });

  const onPinchStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= nativeEvent.scale;
      if (lastScale.current < 1) {
        lastScale.current = 1;
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 10 }).start();
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      } else if (lastScale.current > 3) {
        lastScale.current = 3;
        Animated.spring(scale, { toValue: 3, useNativeDriver: true }).start();
      }
      resetControlsTimer();
    }
  };

  const onPanEvent = (event: any) => {
    if (lastScale.current > 1) {
      // Regular pan when zoomed
      let newX = lastTranslateX.current + event.nativeEvent.translationX;
      let newY = lastTranslateY.current + event.nativeEvent.translationY;

      const maxTranslateX = (lastScale.current * screenWidth - screenWidth) / 2 / lastScale.current;
      const maxTranslateY =
        (lastScale.current * screenHeight - screenHeight) / 2 / lastScale.current;

      // Apply rubber band resistance when panning beyond boundaries
      if (Math.abs(newX) > maxTranslateX) {
        const overdrag = Math.abs(newX) - maxTranslateX;
        newX = maxTranslateX * Math.sign(newX) + overdrag * 0.3;
      }
      if (Math.abs(newY) > maxTranslateY) {
        const overdrag = Math.abs(newY) - maxTranslateY;
        newY = maxTranslateY * Math.sign(newY) + overdrag * 0.3;
      }

      translateX.setValue(newX);
      translateY.setValue(newY);
    } else {
      // Pull-to-dismiss
      translateY.setValue(event.nativeEvent.translationY);
      const newOpacity = 1 - Math.abs(event.nativeEvent.translationY) / (screenHeight / 2);
      backgroundOpacity.setValue(newOpacity);
    }
  };

  const onPanStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      if (lastScale.current > 1) {
        lastTranslateX.current += nativeEvent.translationX;
        lastTranslateY.current += nativeEvent.translationY;

        const maxTranslateX =
          (lastScale.current * screenWidth - screenWidth) / 2 / lastScale.current;
        const maxTranslateY =
          (lastScale.current * screenHeight - screenHeight) / 2 / lastScale.current;

        // Spring back if beyond boundaries
        if (Math.abs(lastTranslateX.current) > maxTranslateX) {
          lastTranslateX.current = maxTranslateX * Math.sign(lastTranslateX.current);
          Animated.spring(translateX, {
            toValue: lastTranslateX.current,
            useNativeDriver: true,
            bounciness: 12,
          }).start();
        }
        if (Math.abs(lastTranslateY.current) > maxTranslateY) {
          lastTranslateY.current = maxTranslateY * Math.sign(lastTranslateY.current);
          Animated.spring(translateY, {
            toValue: lastTranslateY.current,
            useNativeDriver: true,
            bounciness: 12,
          }).start();
        }
      } else {
        if (Math.abs(nativeEvent.translationY) > 100) {
          handleClose();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
          Animated.spring(backgroundOpacity, { toValue: 1, useNativeDriver: true }).start();
        }
      }
      resetControlsTimer();
    }
  };

  const onDoubleTap = useCallback(() => {
    if (lastScale.current > 1) {
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
    } else {
      lastScale.current = 2;
      Animated.spring(scale, { toValue: 2, useNativeDriver: true }).start();
    }
    resetControlsTimer();
  }, [scale, translateX, translateY, resetControlsTimer]);

  return (
    <TapGestureHandler
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.ACTIVE) resetControlsTimer();
      }}
      waitFor={doubleTapRef}>
      <Animated.View style={[styles.container, { opacity: backgroundOpacity }]}>
        <PanGestureHandler
          ref={panRef}
          onGestureEvent={onPanEvent}
          onHandlerStateChange={onPanStateChange}
          simultaneousHandlers={[pinchRef]}
          minPointers={1}
          maxPointers={2}>
          <Animated.View style={{ flex: 1 }}>
            <PinchGestureHandler
              ref={pinchRef}
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={onPinchStateChange}
              simultaneousHandlers={[panRef]}>
              <Animated.View style={{ flex: 1 }}>
                <TapGestureHandler
                  ref={doubleTapRef}
                  onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === State.ACTIVE) onDoubleTap();
                  }}
                  numberOfTaps={2}>
                  <Animated.View style={styles.backdrop}>
                    <Animated.Image
                      source={{ uri: imageUri }}
                      style={[
                        styles.image,
                        {
                          transform: [{ scale }, { translateX }, { translateY }],
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </TapGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </PanGestureHandler>
        <Animated.View style={[styles.topControls, { top: insets.top + 10, opacity: controlsOpacity }]}>
          <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
  topControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 8,
  },
});

export default ZoomableImage; 