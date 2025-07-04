import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 500;

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onRefresh?: () => Promise<void>;
  enableSwipeGestures?: boolean;
  enablePullToRefresh?: boolean;
  refreshing?: boolean;
  style?: any;
}

const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onRefresh,
  enableSwipeGestures = true,
  enablePullToRefresh = true,
  refreshing = false,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      
      let shouldTriggerSwipe = false;
      let swipeDirection: 'left' | 'right' | null = null;
      
      // Check if swipe meets threshold criteria
      if (Math.abs(velocityX) > VELOCITY_THRESHOLD) {
        // Fast swipe - use velocity to determine direction
        shouldTriggerSwipe = true;
        swipeDirection = velocityX > 0 ? 'right' : 'left';
      } else if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        // Slow but long swipe - use distance to determine direction
        shouldTriggerSwipe = true;
        swipeDirection = translationX > 0 ? 'right' : 'left';
      }
      
      if (shouldTriggerSwipe && enableSwipeGestures) {
        if (swipeDirection === 'left' && onSwipeLeft) {
          onSwipeLeft();
        } else if (swipeDirection === 'right' && onSwipeRight) {
          onSwipeRight();
        }
      }
      
      // Reset animation
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [translateX, onSwipeLeft, onSwipeRight, enableSwipeGestures]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  if (enablePullToRefresh && onRefresh) {
    return (
      <ScrollView
        style={style}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            titleColor="#007AFF"
            title="Pull to refresh"
          />
        }
      >
        <PanGestureHandler
          enabled={enableSwipeGestures}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-5, 5]}
        >
          <Animated.View
            style={{
              transform: [{ translateX }],
            }}
          >
            {children}
          </Animated.View>
        </PanGestureHandler>
      </ScrollView>
    );
  }

  return (
    <PanGestureHandler
      enabled={enableSwipeGestures}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-10, 10]}
      failOffsetY={[-5, 5]}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default TouchGestureHandler;

// Hook for managing swipe navigation state
export const useSwipeNavigation = (tabs: string[], initialTab = 0) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(initialTab);
  
  const goToNextTab = useCallback(() => {
    setCurrentTabIndex((prev) => 
      prev < tabs.length - 1 ? prev + 1 : prev
    );
  }, [tabs.length]);
  
  const goToPreviousTab = useCallback(() => {
    setCurrentTabIndex((prev) => 
      prev > 0 ? prev - 1 : prev
    );
  }, []);
  
  const goToTab = useCallback((index: number) => {
    if (index >= 0 && index < tabs.length) {
      setCurrentTabIndex(index);
    }
  }, [tabs.length]);
  
  return {
    currentTabIndex,
    currentTab: tabs[currentTabIndex],
    goToNextTab,
    goToPreviousTab,
    goToTab,
    canGoNext: currentTabIndex < tabs.length - 1,
    canGoPrevious: currentTabIndex > 0,
  };
};

// Swipeable tab container component
interface SwipeableTabsProps {
  tabs: Array<{
    key: string;
    title: string;
    component: React.ReactNode;
  }>;
  onTabChange?: (index: number) => void;
  initialTab?: number;
  enableSwipe?: boolean;
  style?: any;
}

export const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  tabs,
  onTabChange,
  initialTab = 0,
  enableSwipe = true,
  style,
}) => {
  const {
    currentTabIndex,
    goToNextTab,
    goToPreviousTab,
  } = useSwipeNavigation(tabs.map(tab => tab.key), initialTab);
  
  const handleSwipeLeft = useCallback(() => {
    goToNextTab();
    onTabChange?.(currentTabIndex + 1);
  }, [goToNextTab, onTabChange, currentTabIndex]);
  
  const handleSwipeRight = useCallback(() => {
    goToPreviousTab();
    onTabChange?.(currentTabIndex - 1);
  }, [goToPreviousTab, onTabChange, currentTabIndex]);
  
  return (
    <TouchGestureHandler
      style={style}
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      enableSwipeGestures={enableSwipe}
      enablePullToRefresh={false}
    >
      {tabs[currentTabIndex]?.component}
    </TouchGestureHandler>
  );
};

// Pull-to-refresh wrapper component
interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  style?: any;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  children,
  onRefresh,
  refreshing = false,
  style,
}) => {
  return (
    <TouchGestureHandler
      style={style}
      onRefresh={onRefresh}
      refreshing={refreshing}
      enableSwipeGestures={false}
      enablePullToRefresh={true}
    >
      {children}
    </TouchGestureHandler>
  );
};