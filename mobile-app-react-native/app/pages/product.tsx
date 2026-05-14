import {
  BarChart3,
  Box,
  LogOut,
  ReceiptText,
  Search
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- Integration Tools ---
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const ProductList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // BASE_URL for your backend
  const BASE_URL =
    process.env.EXPO_PUBLIC_BASE_URL || "YOUR_BACKEND_IP_ADDRESS";

  // --- Auth & Fetch Logic (From your Web code) ---
  const fetchProducts = async (query = "") => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const endpoint = query
        ? `${BASE_URL}/api/product/search?q=${encodeURIComponent(query)}`
        : `${BASE_URL}/api/product/`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.replace("/auth/login");
      } else {
        console.error("Fetch Error:", error);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // --- Effect: Initial Load ---
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Effect: Debounced Search (Logic from your Web code) ---
  useEffect(() => {
    const delay = setTimeout(() => {
      setIsLoading(true);
      fetchProducts(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  // --- UI: Render Product Item ---
  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.productCard}
      onPress={() => {
        /* Navigate to Details if needed */
      }}
    >
      <View style={styles.cardInfo}>
        <View style={styles.idContainer}>
          <Text style={styles.productIdText}>#{index + 1}</Text>
          <Text style={styles.categoryText}>{item.category || "General"}</Text>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.cardDetails}>
          <Text style={styles.detailText}>Stock: {item.quantity}</Text>
          <Text style={styles.priceText}>Rs. {item.price}</Text>
        </View>
      </View>
      <View style={styles.qtyBadge}>
        <Text style={styles.badgeText}>{item.quantity} Qty</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>INVENTORY</Text>
        <TouchableOpacity
          onPress={() => {
            /* Handle Add New */
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              router.replace("/"); // Aapka login route yahan aayega
            }}
            style={{
              backgroundColor: "#00e5ff",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <LogOut color="#fff" size={20} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search color="#00e5ff" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Type Product Name or ID..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* List */}
      {isLoading && !refreshing ? (
        <ActivityIndicator color="#00e5ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            setRefreshing(true);
            fetchProducts();
          }}
          refreshing={refreshing}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found.</Text>
          }
        />
      )}

      {/* Bottom Tab Bar (Navigation Integrated) */}
      <View style={styles.bottomTab}>
        <TabItem
          icon={<Box color="#00e5ff" size={24} />}
          label="Products"
          active
        />
        <TabItem
          icon={<ReceiptText color="#888" size={24} />}
          label="Billing"
          onPress={() => router.push("/pages/searchbill")}
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

// --- Helper: Tab Item ---
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
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  addBtn: {
    backgroundColor: "#00e5ff",
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1d24",
    borderWidth: 1,
    borderColor: "#00e5ff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  productCard: {
    backgroundColor: "#1a1d24",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardInfo: { flex: 1 },
  idContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  productIdText: {
    color: "#00e5ff",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 10,
  },
  categoryText: { color: "#666", fontSize: 11, textTransform: "uppercase" },
  productName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardDetails: { flexDirection: "row", alignItems: "center" },
  detailText: { color: "#888", fontSize: 13, marginRight: 15 },
  priceText: { color: "#00e5ff", fontSize: 14, fontWeight: "600" },
  qtyBadge: {
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00e5ff",
  },
  badgeText: { color: "#00e5ff", fontWeight: "bold", fontSize: 12 },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: "#16191f",
    height: Platform.OS === "ios" ? 85 : 65,
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

export default ProductList;
