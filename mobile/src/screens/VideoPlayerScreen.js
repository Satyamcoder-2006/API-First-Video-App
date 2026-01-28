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
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);

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

  const togglePlaying = () => {
    setPlaying(prev => !prev);
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  // Sync the 'playing' state with the actual YouTube player
  useEffect(() => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    }
  }, [playing]);

  const onStateChange = (state) => {
    if (state === "playing") {
      setPlaying(true);
    } else if (state === "paused" || state === "ended") {
      setPlaying(false);
    }
  };

  // Polling for current time because onProgress can be unreliable
  useEffect(() => {
    let interval;
    if (playing && playerRef.current) {
      interval = setInterval(async () => {
        try {
          const time = await playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (e) {
          // Ignore errors during polling
        }
      }, 500); // Poll every 500ms
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const onReady = async () => {
    if (playerRef.current) {
      try {
        const videoDuration = await playerRef.current.getDuration();
        setDuration(videoDuration);
        // Kickstart the player and ensure it knows it should be playing if 'playing' is true
        if (playing) {
          // Small seek to trigger the internal bridge state update
          playerRef.current.seekTo(0, true);
        }
      } catch (err) {
        console.log("Error fetching duration or kickstarting:", err);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            ref={playerRef}
            height={200}
            width={"100%"}
            videoId={embedUrl}
            play={playing}
            mute={muted}
            onChangeState={onStateChange}
            onReady={onReady}
            initialPlayerParams={{
              controls: false, // We use our own controls
              rel: false,
              modestbranding: true,
            }}
            webViewStyle={{ opacity: 0.99 }}
          />
          <View style={styles.activeIndicator} />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlPrimary}
          onPress={togglePlaying}
          activeOpacity={0.7}
        >
          <Feather name={playing ? "pause" : "play"} size={24} color={COLORS.white} />
          <Text style={styles.controlText}>{playing ? "HALT" : "RESUME"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlSecondary}
          onPress={toggleMute}
          activeOpacity={0.7}
        >
          <Feather name={muted ? "volume-x" : "volume-2"} size={24} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarActive,
              { width: `${(currentTime / (duration || 1)) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} <Text style={styles.timeSeparator}>/</Text> {formatTime(duration)}
        </Text>
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
    marginTop: 10,
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
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    marginTop: 40,
  },
  controlPrimary: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginRight: 15,
    minWidth: 160,
  },
  controlSecondary: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  controlText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginLeft: 12,
  },
  timeContainer: {
    paddingHorizontal: 40,
    marginTop: 40,
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 2,
    backgroundColor: COLORS.border,
    marginBottom: 15,
  },
  progressBarActive: {
    height: "100%",
    backgroundColor: COLORS.accent,
  },
  timeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  timeSeparator: {
    color: COLORS.accent,
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


