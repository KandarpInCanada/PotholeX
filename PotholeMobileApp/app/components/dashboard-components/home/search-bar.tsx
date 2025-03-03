import type React from "react";
import { StyleSheet } from "react-native";
import { Searchbar } from "react-native-paper";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  return (
    <Searchbar
      placeholder="Search by location or description..."
      onChangeText={onChangeText}
      value={value}
      style={styles.searchBar}
      inputStyle={styles.searchInput}
      iconColor="#64748B"
      placeholderTextColor="#94A3B8"
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    elevation: 0,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    height: 58,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 8,
  },
  searchInput: {
    fontSize: 15,
    color: "#334155",
  },
});

export default SearchBar;
