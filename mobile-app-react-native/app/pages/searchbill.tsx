import AsyncStorage from "@react-native-async-storage/async-storage"; // Token storage ke liye
import { useNavigation, useRouter } from "expo-router";
import {
  BarChart3,
  Box,
  Calendar as CalendarIcon,
  Eraser,
  Eye,
  ReceiptText,
  Search,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");

// Base URL (Aapki environment file se)
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const BillSearch = () => {
  const router = useRouter();

  const [searchID, setSearchID] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredBills, setFilteredBills] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<any>();
  // --- API LOGIC FROM WEB ---

  const checkStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // navigation.navigate("Login");
        return;
      }
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
    } catch (error) {
      Alert.alert("Error");
      console.error("Auth Error:", error);
    }
  };

  const fetchBillsById = async (query: string) => {
    if (!query.trim()) {
      setFilteredBills([]);
      return;
    }
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/bill/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (response.ok) setFilteredBills(data);
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        Alert.alert(data.error || "Failed to fetch bills");
      }
    } catch (error) {
      console.error("Search ID error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBillsByDate = async (day: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/bill/date?day=${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setFilteredBills(data);
      if (response.status === 401) {
        router.push("/auth/login");
        return [];
      }

      if (!response.ok) {
        Alert.alert(data.error || "Failed to fetch bills");
        return [];
      }
    } catch (error) {
      Alert.alert("Search Date error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- USE EFFECTS (Debouncing logic) ---

  useEffect(() => {
    checkStatus();
  }, []);

  // Watch ID Search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBillsById(searchID);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchID]);

  // Watch Date Search
  useEffect(() => {
    if (selectedDate) {
      fetchBillsByDate(selectedDate);
    }
  }, [selectedDate]);

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const clearFilters = () => {
    setSearchID("");
    setSelectedDate("");
    setFilteredBills([]);
    setShowCalendar(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BILL SEARCH</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Eraser color="#00e5ff" size={22} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.idSearchContainer}>
        <TextInput
          style={styles.idInput}
          placeholder="Search by Bill ID"
          placeholderTextColor="#666"
          value={searchID}
          onChangeText={setSearchID}
        />
        <View style={styles.searchBtn}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Search color="#000" size={20} />
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={styles.sectionLabel}>Date</Text>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon color="#00e5ff" size={20} />
          <Text style={styles.dateText}>{selectedDate || "Select a date"}</Text>
        </TouchableOpacity>

        {showCalendar && (
          <View style={styles.calendarCard}>
            <Calendar
              theme={{
                backgroundColor: "#1a1d24",
                calendarBackground: "#1a1d24",
                textSectionTitleColor: "#00e5ff",
                selectedDayBackgroundColor: "#00e5ff",
                selectedDayTextColor: "#000",
                todayTextColor: "#00e5ff",
                dayTextColor: "#fff",
                textDisabledColor: "#444",
                monthTextColor: "#fff",
                arrowColor: "#00e5ff",
              }}
              onDayPress={onDayPress}
              markedDates={{ [selectedDate]: { selected: true } }}
            />
          </View>
        )}
      </View>

      {/* Bills List */}
      <FlatList
        data={filteredBills}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No bills found</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.billCard}>
            <View style={styles.billInfo}>
              <Text style={styles.labelSmall}>Date</Text>
              <Text style={styles.valueSmall}>
                {item.createdAt || item.date}
              </Text>
            </View>

            <View style={styles.billInfo}>
              <Text style={styles.labelSmall}>Bill #</Text>
              <Text style={styles.valueSmall}>#{item.billNo}</Text>
            </View>

            <View style={styles.actionIcons}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() =>
                  navigation.navigate("pages/bill", { billId: item._id })
                }
              >
                <Eye color="#00e5ff" size={20} />
                <Text style={styles.iconText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Bottom Tabs */}
      <View style={styles.bottomTab}>
        <TabItem
          icon={<Box color="#888" size={24} />}
          label="Products"
          onPress={() => router.push("/pages/product")}
        />
        <TabItem
          icon={<ReceiptText color="#00e5ff" size={24} />}
          label="Billing"
          active
        />
        <TabItem
          icon={<BarChart3 color="#888" size={24} />}
          label="Reports"
          onPress={() => router.push("/pages/reports")}
        />
      </View>
    </SafeAreaView>
  );
};

// ... Styles (Keeping your original styles exactly as they were)
const TabItem = ({ icon, label, active = false, onPress }: any) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    {icon}
    <Text style={[styles.tabLabel, active && { color: "#00e5ff" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1116" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  idSearchContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#1a1d24",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#00e5ff",
    marginBottom: 15,
    overflow: "hidden",
  },
  idInput: { flex: 1, height: 50, color: "#fff", paddingHorizontal: 15 },
  searchBtn: {
    backgroundColor: "#00e5ff",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: { color: "#fff", fontSize: 16, marginBottom: 10 },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f1116",
    borderWidth: 1.5,
    borderColor: "#00e5ff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  dateText: { color: "#fff", marginLeft: 10 },
  calendarCard: {
    backgroundColor: "#1a1d24",
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  billCard: {
    backgroundColor: "#1a1d24",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  billInfo: { flex: 1 },
  labelSmall: { color: "#666", fontSize: 11 },
  valueSmall: { color: "#fff", fontSize: 13, fontWeight: "500" },
  actionIcons: { flexDirection: "row", gap: 15 },
  iconBtn: { alignItems: "center" },
  iconText: { color: "#00e5ff", fontSize: 10, marginTop: 2 },
  emptyText: { color: "#666", textAlign: "center", marginTop: 20 },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: "#16191f",
    height: 75,
    position: "absolute",
    bottom: 0,
    width: "100%",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#333",
  },
  tabItem: { alignItems: "center" },
  tabLabel: { color: "#888", fontSize: 10, marginTop: 4 },
});

export default BillSearch;
