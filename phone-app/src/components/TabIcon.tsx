
import React from 'react';
import { Feather } from '@expo/vector-icons';

interface TabIconProps {
  name: keyof typeof Feather.glyphMap;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, color, size }) => {
  return <Feather name={name} size={size} color={color} />;
};

export default TabIcon;
