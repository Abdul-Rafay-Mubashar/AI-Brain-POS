import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";

import {
  BarChart3,
  Box,
  ChevronLeft,
  MoreVertical,
  ReceiptText,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// --- Types ---
interface BillItem {
  id: string;
  name: string;
  qty: number;
  rate: string;
  total: string;
}

const BillDetail = () => {
  const router = useRouter();
  const { billId } = useLocalSearchParams(); // URL se ID lene ke liye

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [billData, setBillData] = useState<any>(null);
  const [items, setItems] = useState<BillItem[]>([]);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  const fetchBillDetail = async () => {
    try {
      setLoading(true);
      console.log(`${BASE_URL}/api/bill/${billId}`);
      const token = await AsyncStorage.getItem("token");
      // Apne backend ka sahi URL yahan likhein
      const response = await fetch(`${BASE_URL}/api/bill/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setBillData(data);
        // Backend data ko UI format mein map karna
        const mappedItems = data.items.map((item: any) => ({
          id: item._id,
          name: item.nameSnapshot || "Product",
          qty: item.quantity,
          rate: item.salePriceSnapshot,
          total: (item.quantity * item.salePriceSnapshot).toString(),
        }));
        setItems(mappedItems);
      }
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (response.status === 404) {
        router.push("/pages/product");
        return;
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Connection failed");
    } finally {
      setLoading(false);
    }
  };
  const downloadBill = async () => {
    if (!billId) return;

    try {
      setDownloading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      const fileUri =
        (FileSystem as any).documentDirectory +
        `bill-${billData?.billNo || "invoice"}.pdf`;

      // Download file
      const downloadRes = await FileSystem.downloadAsync(
        `${BASE_URL}/api/bill/download/${billId}`,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (downloadRes.status !== 200) {
        throw new Error("Download failed");
      }

      // Share / open file
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("Success", "File saved successfully.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Bill download karne mein masla hua.");
    } finally {
      setDownloading(false);
    }
  };
  const getFileUri = () => {
    return (
      (FileSystem as any).documentDirectory +
      `bill-${billData?.billNo || "invoice"}.pdf`
    );
  };
  const shareBill = async () => {
    if (!billId) return;

    try {
      setDownloading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      const fileUri = getFileUri();

      const downloadRes = await FileSystem.downloadAsync(
        `${BASE_URL}/api/bill/download/${billId}`,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ verify file actually exists
      const fileInfo = await FileSystem.getInfoAsync(downloadRes.uri);

      if (!fileInfo.exists) {
        throw new Error("File not saved properly");
      }

      Alert.alert("Success", "Bill downloaded successfully.");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Download failed.");
    } finally {
      setDownloading(false);
    }
  };
  useEffect(() => {
    if (billId) fetchBillDetail();
  }, [billId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#5de4ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Bill Detail: #{billData?.billNo || "N/A"}
        </Text>
        <TouchableOpacity>
          <MoreVertical color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bill Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {billData?.createdAt
                ? new Date(billData.createdAt).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bill No:</Text>
            <Text style={styles.value}>{billData?.billNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total:</Text>
            <Text style={[styles.value, { color: "#fff", fontWeight: "bold" }]}>
              Rs. {billData?.totalSale || "0"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bill Items</Text>

        {/* Bill Items List (Dynamic) */}
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemRow}>
              <Text style={styles.itemSubText}>
                Qty: {item.qty} @ Rs. {item.rate}
              </Text>
              <Text style={styles.itemTotal}>Rs. {item.total}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Payment Info Card */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <View>
              <Text style={styles.labelSmall}>Payment Method:</Text>
              <Text style={styles.valueSmall}>
                {billData?.paymentMethod || "Cash"}
              </Text>
            </View>
            <View>
              <Text style={styles.labelSmall}>Paid:</Text>
              <Text style={styles.valueSmall}>
                Rs. {billData?.totalSale || "0"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.downloadBtn}>
          <Text style={styles.downloadBtnText} onPress={shareBill}>
            Download Invoice (PDF)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadBtn}>
          <Text style={styles.downloadBtnText} onPress={downloadBill}>
            Share Invoice (PDF)
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav Mockup */}
      <View style={styles.bottomTab}>
        <TabItem
          icon={<Box color="#888" size={24} />}
          label="Products"
          onPress={() => router.push("/pages/product")}
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

const TabItem = ({ icon, label, active = false, onPress }: any) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    {icon}
    <Text style={[styles.tabLabel, active && { color: "#5de4ff" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ... Styles remain exactly the same as your original code
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    height: 60,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  scrollContent: { padding: 15, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  row: { flexDirection: "row", marginBottom: 8 },
  label: { color: "#888", width: 100, fontSize: 15 },
  value: { color: "#ccc", fontSize: 15 },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
  },
  itemCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  itemName: { color: "#fff", fontSize: 16, fontWeight: "500", marginBottom: 5 },
  itemRow: { flexDirection: "row", justifyContent: "space-between" },
  itemSubText: { color: "#888", fontSize: 13 },
  itemTotal: { color: "#fff", fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#333", marginVertical: 15 },
  paymentCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  paymentRow: { flexDirection: "row", justifyContent: "space-between" },
  labelSmall: { color: "#888", fontSize: 12, marginBottom: 4 },
  valueSmall: { color: "#fff", fontSize: 14, fontWeight: "500" },
  downloadBtn: {
    backgroundColor: "#5de4ff",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  downloadBtnText: { color: "#000", fontWeight: "bold", fontSize: 15 },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: "#121212",
    height: 70,
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#222",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: { alignItems: "center" },
  tabLabel: { color: "#888", fontSize: 10, marginTop: 4 },
});

export default BillDetail;
