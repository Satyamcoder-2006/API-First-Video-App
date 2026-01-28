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

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("CORE SYSTEM FAILURE", "NAME IDENTIFIER REQUIRED");
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("CORE SYSTEM FAILURE", "VALID EMAIL IDENTIFIER REQUIRED");
      return;
    }
    if (password.length < 8) {
      Alert.alert("SECURITY BREACH", "KEY STRENGTH INSUFFICIENT (MIN 8 CHARS)");
      return;
    }

    setLoading(true);
    const result = await signup(name.trim(), email.trim().toLowerCase(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert("PROTOCOL FAILED", result.error || "INITIALIZATION ERROR");
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
          <Feather name="plus-circle" size={64} color={COLORS.accent} />
          <Text style={styles.title}>NEW PROTOCOL</Text>
          <Text style={styles.subtitle}>INITIALIZE ANTIGRAVITY IDENTITY</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={18} color={COLORS.accent} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="FULL NAME"
              placeholderTextColor={COLORS.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

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
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>INITIALIZE</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.linkContainer}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              EXISTING PROTOCOL? <Text style={styles.linkTextBold}>RETRIEVE ACCESS</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SYSTEMS: STABLE | UPTIME: 99.9%</Text>
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
    letterSpacing: 2,
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
