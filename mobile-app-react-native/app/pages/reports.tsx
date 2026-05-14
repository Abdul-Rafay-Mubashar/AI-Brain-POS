import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  BarChart3,
  Box,
  Calendar,
  ReceiptText,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const Reports = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  // --- Modal & Download States ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const today = new Date().toISOString().split("T")[0];

      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch(`${BASE_URL}/api/reports/daily?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/api/reports/weekly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/api/reports/monthly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDailyReport(await dailyRes.json());
      setWeeklyReport((await weeklyRes.json()) || []);
      setMonthlyReport(await monthlyRes.json());
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);

      const token = await AsyncStorage.getItem("token");

      const sDate = startDate.toISOString().split("T")[0];
      const eDate = endDate.toISOString().split("T")[0];

      const fileUri =
        (FileSystem as any).documentDirectory +
        `report-${sDate}-to-${eDate}.pdf`;

      const downloadRes = await FileSystem.downloadAsync(
        `${BASE_URL}/api/reports/custom?startDate=${sDate}&endDate=${eDate}`,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("FILE SAVED:", downloadRes.uri);
      Alert.alert("Success", "Report downloaded successfully");

      await Sharing.shareAsync(downloadRes.uri);

      setModalVisible(false);
    } catch (error: any) {
      console.log(error);

      Alert.alert("Error", error?.message || "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };
  // --- Logic for Charts ---
  const maxVal =
    weeklyReport.length > 0
      ? Math.max(...weeklyReport.map((i) => i.totalSale))
      : 1;
  const roundedMax = Math.ceil(maxVal / 5000) * 5000;
  const calculateHeight = (value: number) => {
    const percentage = (value / roundedMax) * 100;
    return `${Math.min(Math.max(percentage, 5), 100)}%`;
  };
  const weekTotals = {
    sales: weeklyReport.reduce((s, d) => s + (d.totalSale || 0), 0),
    profit: weeklyReport.reduce((s, d) => s + (d.totalProfit || 0), 0),
  };
  const mSales = monthlyReport?.totalSale || 0;
  const mProfit = monthlyReport?.totalProfit || 0;
  const marginPercentage =
    mSales > 0 ? Math.round((mProfit / mSales) * 100) : 0;
  const radius = 45,
    stroke = 7,
    normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (marginPercentage / 100) * circumference;

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="large" color="#00e5ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER with working Calendar Link */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REPORTS</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Calendar color="#00e5ff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* DAILY REPORT */}
        <View style={styles.reportCard}>
          <Text style={styles.cardTitle}>
            DAILY REPORT ({dailyReport?.date || "Today"})
          </Text>
          <View style={styles.statsRow}>
            <StatItem
              label="Total Sales"
              value={`Rs. ${dailyReport?.totalSale?.toLocaleString() || 0}`}
            />
            <StatItem
              label="Total Cost"
              value={`Rs. ${dailyReport?.totalCost?.toLocaleString() || 0}`}
            />
          </View>
          <View style={styles.chartPlaceholder}>
            <View style={styles.lineChartMock} />
            <TrendingUp color="#00e5ff" size={20} style={styles.chartIcon} />
          </View>
          <View style={styles.statsRowBottom}>
            <StatItem
              label="Total Profit"
              value={`Rs. ${dailyReport?.totalProfit?.toLocaleString() || 0}`}
            />
          </View>
        </View>

        {/* WEEKLY REPORT */}
        <View style={styles.reportCard}>
          <Text style={styles.cardTitle}>WEEKLY REPORT</Text>
          <View style={styles.statsRow}>
            <StatItem
              label="Total Sales"
              value={`Rs. ${weekTotals.sales.toLocaleString()}`}
            />
            <StatItem
              label="Total Profit"
              value={`Rs. ${weekTotals.profit.toLocaleString()}`}
            />
          </View>
          <View style={styles.barChartContainer}>
            {weeklyReport.map((item, index) => (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValueText}>
                  {item.totalSale > 1000
                    ? `${(item.totalSale / 1000).toFixed(1)}k`
                    : item.totalSale}
                </Text>
                <View
                  style={[
                    styles.bar,
                    { height: calculateHeight(item.totalSale) as any },
                  ]}
                />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* MONTHLY REPORT */}
        <View style={styles.reportCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Monthly Report</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.customDateText}>Set Custom Date</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {monthlyReport?.month || "Current Month"}
          </Text>
          <View style={styles.monthlyContent}>
            <View style={styles.monthlyStats}>
              <StatItem
                label="Total Sales"
                value={`Rs. ${mSales.toLocaleString()}`}
              />
              <View style={{ marginTop: 12 }}>
                <StatItem
                  label="Total Profit"
                  value={`Rs. ${mProfit.toLocaleString()}`}
                />
              </View>
            </View>
            <View style={styles.donutContainer}>
              <Text style={styles.donutLabel}>Profit Margin</Text>
              <View style={styles.donutWrapper}>
                <Svg height="80" width="80" viewBox="0 0 80 80">
                  <Circle
                    cx="40"
                    cy="40"
                    r={normalizedRadius}
                    stroke="#2a2e37"
                    strokeWidth={stroke}
                    fill="transparent"
                  />
                  <Circle
                    cx="40"
                    cy="40"
                    r={normalizedRadius}
                    stroke="#00e5ff"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    transform="rotate(-90 40 40)"
                  />
                </Svg>
                <View style={styles.donutTextOverlay}>
                  <Text style={styles.percentageText}>{marginPercentage}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CUSTOM DATE MODAL - Integrated from your web component */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Enter Start & End Date</Text>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.inputLabel}>Start Date</Text>
              <Text style={styles.inputText}>{startDate.toDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.inputLabel}>End Date</Text>
              <Text style={styles.inputText}>{endDate.toDateString()}</Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setShowStartPicker(false);
                  if (d) setStartDate(d);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setShowEndPicker(false);
                  if (d) setEndDate(d);
                }}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleDownloadReport}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveBtnText}>Download Report</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTTOM TAB */}
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
          icon={<BarChart3 color="#00e5ff" size={24} />}
          label="Reports"
          active
        />
      </View>
    </SafeAreaView>
  );
};

// ... StatItem aur TabItem components (Wahi purany)
const StatItem = ({ label, value }: any) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

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
  loadingArea: {
    flex: 1,
    backgroundColor: "#0f1116",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  reportCard: {
    backgroundColor: "#1a1d24",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statsRowBottom: { flexDirection: "row", marginTop: 10 },
  statItem: { flex: 1 },
  statLabel: { color: "#666", fontSize: 12 },
  statValue: { color: "#fff", fontSize: 15, fontWeight: "bold", marginTop: 4 },
  chartPlaceholder: {
    height: 60,
    justifyContent: "center",
    marginVertical: 10,
  },
  lineChartMock: {
    height: 2,
    backgroundColor: "#00e5ff",
    width: "100%",
    opacity: 0.3,
  },
  chartIcon: { position: "absolute", right: 20, top: 10 },
  barColumn: { alignItems: "center", justifyContent: "flex-end", flex: 1 },
  barValueText: {
    color: "#00e5ff",
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 4,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    marginTop: 15,
  },
  bar: { width: 15, backgroundColor: "#00e5ff", borderRadius: 4 },
  barLabel: { color: "#666", fontSize: 10, marginTop: 8 },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: { color: "#666", fontSize: 13, marginTop: 4, marginBottom: 15 },
  customDateText: { color: "#00e5ff", fontSize: 12 },
  monthlyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthlyStats: { flex: 1 },
  donutContainer: { alignItems: "center", width: 100 },
  donutLabel: { color: "#666", fontSize: 10, marginBottom: 4 },
  donutWrapper: { justifyContent: "center", alignItems: "center" },
  donutTextOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: "#16191f",
    height: 75,
    position: "absolute",
    bottom: 0,
    width: "100%",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  tabItem: { alignItems: "center" },
  tabLabel: { color: "#888", fontSize: 10, marginTop: 4 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1a1d24",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalHeading: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  dateInput: {
    backgroundColor: "#2a2e37",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  inputLabel: { color: "#666", fontSize: 12, marginBottom: 4 },
  inputText: { color: "#00e5ff", fontSize: 16, fontWeight: "600" },
  modalActions: { marginTop: 10 },
  saveBtn: {
    backgroundColor: "#00e5ff",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtnText: { color: "#000", fontWeight: "bold", fontSize: 15 },
  cancelBtn: { height: 50, justifyContent: "center", alignItems: "center" },
  cancelBtnText: { color: "#ff4444", fontSize: 15 },
});

export default Reports;
