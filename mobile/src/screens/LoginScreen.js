import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING, BORDER_RADIUS } from "../theme";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("CORE SYSTEM FAILURE", "EMAIL IDENTIFIER REQUIRED");
      return;
    }
    if (!password) {
      Alert.alert("CORE SYSTEM FAILURE", "SECURITY KEY REQUIRED");
      return;
    }

    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert("AUTH ERROR", result.error || "INVALID PROTOCOL");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSpacer}>
          <Feather name="shield" size={64} color={COLORS.accent} />
          <Text style={styles.title}>STREAMVAULT</Text>
          <Text style={styles.subtitle}>SECURE AUTHENTICATION HUB</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={18} color={COLORS.accent} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="PRIMARY EMAIL"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Feather name="lock" size={18} color={COLORS.accent} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="SECURITY KEY"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>AUTHENTICATE</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={styles.linkContainer}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              NO ACCESS? <Text style={styles.linkTextBold}>INITIALIZE ACCOUNT</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ENCRYPTION: AES-256 ACTIVE</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: "center",
  },
  headerSpacer: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginTop: 20,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: "700",
    letterSpacing: 3,
    marginTop: 8,
  },
  content: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "600",
    letterSpacing: 1,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  linkContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
  },
  linkTextBold: {
    color: COLORS.accent,
    fontWeight: "900",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
    color: COLORS.border,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
