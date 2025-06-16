
import React from 'react';
import { Feather } from '@expo/vector-icons';

const TabIcon = ({ name, color, size }) => {
  return <Feather name={name} size={size} color={color} />;
};

export default TabIcon;
