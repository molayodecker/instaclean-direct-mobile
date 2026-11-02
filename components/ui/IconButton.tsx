import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

type IconButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function IconButton({ name, onPress }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}>
      <Ionicons name={name} size={22} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
});
