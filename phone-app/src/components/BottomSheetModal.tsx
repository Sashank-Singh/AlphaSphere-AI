import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_POINTS = [0.2, 0.5, 0.9]; // 20%, 50%, 90% of screen height
const BACKDROP_OPACITY = 0.5;

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnapPoint?: number;
  enableBackdropDismiss?: boolean;
  enablePanGesture?: boolean;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isVisible,
  onClose,
  children,
  title,
  snapPoints = SNAP_POINTS,
  initialSnapPoint = 1,
  enableBackdropDismiss = true,
  enablePanGesture = true,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapPoint);
  const lastGestureY = useRef(0);

  const snapToPoint = useCallback((index: number) => {
    const snapPoint = snapPoints[index];
    const targetY = SCREEN_HEIGHT * (1 - snapPoint);
    
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: targetY,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: snapPoint > 0 ? BACKDROP_OPACITY : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentSnapIndex(index);
  }, [snapPoints, translateY, backdropOpacity]);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (isVisible) {
      snapToPoint(initialSnapPoint);
    } else {
      dismiss();
    }
  }, [isVisible, snapToPoint, dismiss, initialSnapPoint]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      const currentY = lastGestureY.current + translationY;
      
      // Determine which snap point to go to based on velocity and position
      let targetIndex = currentSnapIndex;
      
      if (velocityY > 500) {
        // Fast downward swipe - go to next lower snap point or dismiss
        targetIndex = Math.max(0, currentSnapIndex - 1);
        if (targetIndex === 0) {
          dismiss();
          return;
        }
      } else if (velocityY < -500) {
        // Fast upward swipe - go to next higher snap point
        targetIndex = Math.min(snapPoints.length - 1, currentSnapIndex + 1);
      } else {
        // Find closest snap point based on current position
        const currentPercentage = 1 - (currentY / SCREEN_HEIGHT);
        let closestIndex = 0;
        let closestDistance = Math.abs(snapPoints[0] - currentPercentage);
        
        for (let i = 1; i < snapPoints.length; i++) {
          const distance = Math.abs(snapPoints[i] - currentPercentage);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }
        
        targetIndex = closestIndex;
      }
      
      if (targetIndex === 0) {
        dismiss();
      } else {
        snapToPoint(targetIndex);
      }
    }
  };

  const onGestureBegin = () => {
    lastGestureY.current = translateY._value;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={enableBackdropDismiss ? dismiss : undefined}
      >
        <Animated.View
          style={[
            styles.backdropView,
            {
              opacity: backdropOpacity,
            },
          ]}
        />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <PanGestureHandler
        enabled={enablePanGesture}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        onBegan={onGestureBegin}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
  },
  backdropView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT * 0.2,
    maxHeight: SCREEN_HEIGHT * 0.95,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#666666',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default BottomSheetModal;