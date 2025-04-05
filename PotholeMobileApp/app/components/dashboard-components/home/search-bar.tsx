import type React from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search reports, locations...",
  onSubmit,
}) => {
  const clearSearch = () => {
    onChangeText("");
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay: 200 }}
      style={styles.container}
    >
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  searchBarWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 52,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#0F172A",
    padding: 0,
    backgroundColor: "transparent",
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
