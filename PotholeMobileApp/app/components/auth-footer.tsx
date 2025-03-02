import { StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { MotiView } from "moti";
import { lightTheme } from "../../app/theme";

interface AuthFooterProps {
  text: string;
  linkText: string;
  onPress: () => void;
}

export const AuthFooter = ({ text, linkText, onPress }: AuthFooterProps) => {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 1000,
        delay: 700,
      }}
      style={styles.footerContainer}
    >
      <Button
        onPress={onPress}
        uppercase={false}
        style={styles.footerButton}
        labelStyle={styles.footerButtonText}
      >
        {text} <Text style={styles.footerButtonTextHighlight}>{linkText}</Text>
      </Button>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 32,
  },
  footerButton: {
    opacity: 0.9,
  },
  footerButtonText: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    letterSpacing: 0.25,
  },
  footerButtonTextHighlight: {
    color: lightTheme.colors.primary,
    fontWeight: "600",
  },
});
