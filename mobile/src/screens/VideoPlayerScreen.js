import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { apiCall } from "../api/client";

import { COLORS, SPACING, BORDER_RADIUS } from "../theme";
import { Feather } from "@expo/vector-icons";

export default function VideoPlayerScreen({ route, navigation }) {
  const { videoId } = route.params;
  const [embedUrl, setEmbedUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoEmbedUrl();
  }, [videoId]);

  const fetchVideoEmbedUrl = async () => {
    const { data, error } = await apiCall(`/video/${videoId}/play`, {
      method: "GET",
    });
    if (error || !data?.embed_url) {
      Alert.alert("LINK FAILURE", error || "UNABLE TO RETRIEVE STREAM");
      navigation.goBack();
      return;
    }
    const urlMatch = data.embed_url.match(/embed\/([^?]+)/);
    if (urlMatch && urlMatch[1]) {
      setEmbedUrl(urlMatch[1]);
    } else {
      Alert.alert("LINK FAILURE", "INVALID STREAM IDENTIFIER");
      navigation.goBack();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>BUFFERING STREAM...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color={COLORS.accent} />
          <Text style={styles.backButtonText}>BACK TO HUB</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playerWrapper}>
        <View style={styles.playerContainer}>
          <YoutubePlayer
            height={200}
            width={"100%"}
            videoId={embedUrl}
            play={true}
            webViewStyle={{ opacity: 0.99 }}
          />
          <View style={styles.activeIndicator} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>SECURE STREAM ACTIVE</Text>
        <Text style={styles.infoSubtitle}>IDENTITY VERIFIED | ENCRYPTED PROTOCOL</Text>
      </View>

      <View style={styles.statusFooter}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>LIVE STREAM ENCRYPTED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginLeft: 8,
  },
  playerWrapper: {
    width: "100%",
    backgroundColor: COLORS.black,
    marginTop: 20,
    alignItems: "center",
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.black,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 2,
    height: "100%",
    backgroundColor: COLORS.accent,
  },
  infoContainer: {
    padding: 30,
    alignItems: 'center',
  },
  infoTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  infoSubtitle: {
    color: COLORS.accent,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 10,
  },
  statusFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00FF00",
    marginRight: 10,
  },
  statusText: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: "900",
    letterSpacing: 2,
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.accent,
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: "700",
  },
});

