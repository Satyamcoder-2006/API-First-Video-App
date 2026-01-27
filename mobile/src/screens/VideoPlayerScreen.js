import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { apiCall } from "../api/client";

export default function VideoPlayerScreen({ route, navigation }) {
  const { videoId } = route.params;
  const [embedUrl, setEmbedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetchVideoEmbedUrl();
  }, [videoId]);

  const fetchVideoEmbedUrl = async () => {
    const { data, error } = await apiCall(`/video/${videoId}/play`, {
      method: "GET",
    });
    if (error || !data?.embed_url) {
      Alert.alert("Error", error || "Failed to load video");
      navigation.goBack();
      return;
    }
    // Extract YouTube ID from embed URL
    const urlMatch = data.embed_url.match(/embed\/([^?]+)/);
    if (urlMatch && urlMatch[1]) {
      setEmbedUrl(urlMatch[1]);
    } else {
      Alert.alert("Error", "Invalid video URL");
      navigation.goBack();
    }
    setLoading(false);
  };

  const togglePlaying = () => {
    setPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  const onStateChange = (state) => {
    if (state === "playing") {
      setPlaying(true);
    } else if (state === "paused") {
      setPlaying(false);
    } else if (state === "ended") {
      setPlaying(false);
    }
  };

  const onProgress = (data) => {
    setCurrentTime(data.currentTime);
    setDuration(data.duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!embedUrl) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playerContainer}>
        <YoutubePlayer
          height={220}
          videoId={embedUrl}
          play={playing}
          mute={muted}
          onChangeState={onStateChange}
          onProgress={onProgress}
          webViewStyle={{ opacity: 0.99 }}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlaying}
        >
          <Text style={styles.controlButtonText}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Text style={styles.controlButtonText}>
            {muted ? "🔊 Unmute" : "🔇 Mute"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 15,
    backgroundColor: "#1a1a1a",
  },
  backButton: {
    paddingVertical: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  playerContainer: {
    width: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  controlButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  timeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
  },
});
