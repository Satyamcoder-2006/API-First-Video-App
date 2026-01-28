import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { apiCall } from "../api/client";
import { COLORS, SPACING, BORDER_RADIUS } from "../theme";
import { Feather } from "@expo/vector-icons";

export default function DashboardScreen({ navigation }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = useCallback(async () => {
    const { data, error } = await apiCall("/dashboard", { method: "GET" });
    if (error) {
      Alert.alert("Error", error || "Failed to load videos");
      setVideos([]);
    } else {
      setVideos(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchVideos();
    });
    return unsubscribe;
  }, [navigation, fetchVideos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, [fetchVideos]);

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => navigation.navigate("VideoPlayer", { videoId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playIconContainer}>
          <Feather name="play" size={20} color={COLORS.accent} />
        </View>
        {!item.thumbnail_url && (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Feather name="image" size={32} color={COLORS.border} />
          </View>
        )}
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.videoDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>INITIALIZING...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>DASHBOARD</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
          <Feather name="refresh-cw" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="video-off" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>NO CONTENT DETECTED</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>RETRY CONNECT</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: "space-between",
  },
  videoCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    width: "48%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.1)",
  },
  thumbnailContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    width: "100%",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.card,
  },
  placeholderThumbnail: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
  },
  playIconContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  videoInfo: {
    padding: 10,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.accent,
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 20,
    letterSpacing: 2,
    fontWeight: "600",
  },
  refreshButton: {
    marginTop: 24,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  refreshButtonText: {
    color: COLORS.accent,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});
