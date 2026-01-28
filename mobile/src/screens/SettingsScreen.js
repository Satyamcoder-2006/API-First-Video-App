import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api/client";
import { COLORS, SPACING, BORDER_RADIUS } from "../theme";
import { Feather } from "@expo/vector-icons";

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const { data, error } = await apiCall("/auth/me", { method: "GET" });
    if (error) {
      Alert.alert("Error", error || "Failed to load user info");
    } else {
      setUserInfo(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "LOGOUT",
      "TERMINATE CURRENT SESSION?",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "LOGOUT",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>PROFILE</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="user" size={18} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>CREDENTIALS</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>NAME</Text>
          <Text style={styles.infoValue}>{userInfo?.name || "ANONYMOUS"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>EMAIL</Text>
          <Text style={styles.infoValue}>{userInfo?.email || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="shield" size={18} color={COLORS.accent} />
          <Text style={styles.sectionTitle}>SECURITY</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={COLORS.white} />
          <Text style={styles.logoutButtonText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>ANTIGRAVITY OS V1.0.4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.textPrimary,
  },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.accent,
    marginLeft: 10,
  },
  infoRow: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginLeft: 10,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 10,
    color: COLORS.border,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
