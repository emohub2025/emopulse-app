import React, { useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";

//
// 1. US State List
//
export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

//
// 2. ZIP → State Auto‑Detect
//
export function autoDetectStateFromZip(zip: string): string | null {
  const z = zip.trim();
  if (!/^\d{5}$/.test(z)) return null;

  const prefix = parseInt(z.substring(0, 3), 10);

  if (prefix >= 350 && prefix <= 369) return "AL";
  if (prefix >= 995 && prefix <= 999) return "AK";
  if (prefix >= 850 && prefix <= 869) return "AZ";
  if (prefix >= 716 && prefix <= 729) return "AR";
  if (prefix >= 900 && prefix <= 966) return "CA";
  if (prefix >= 800 && prefix <= 816) return "CO";
  if (prefix >= 600 && prefix <= 699) return "IL";
  if (prefix >= 430 && prefix <= 459) return "OH";
  if (prefix >= 890 && prefix <= 898) return "NV";
  // Add remaining states if needed

  return null;
}

//
// 3. Custom Dropdown Component
//
export default function StateSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (state: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Input-like pressable */}
      <Pressable style={styles.input} onPress={() => setVisible(true)}>
        <Text style={styles.inputText}>
          {value || "Select state"}
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Select State</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {US_STATES.map((s) => (
                <Pressable
                  key={s}
                  style={styles.item}
                  onPress={() => {
                    onChange(s);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.itemText}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable onPress={() => setVisible(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

//
// 4. Styles
//
const styles = StyleSheet.create({
  input: {
    height: 53,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputText: {
    color: "white",
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  itemText: {
    color: "white",
    fontSize: 16,
  },
  cancel: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
  },
});