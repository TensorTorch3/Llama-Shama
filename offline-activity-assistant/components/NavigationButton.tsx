import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

interface NavigationButtonProps {
  to: string;
  title: string;
  style?: object;
  textStyle?: object;
}

export default function NavigationButton({ to, title, style, textStyle }: NavigationButtonProps) {
  return (
    <Link href={to} asChild>
      <TouchableOpacity 
        style={[styles.button, style]}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 4, // For Android
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
