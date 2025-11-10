import React, { useState } from "react";
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";

export default function MessageList({ messages, currentUserId, flatListRef, onDeleteMessage }) {

  const formatTime = (timestamp) =>
    new Date(timestamp * 1000).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        inverted
        renderItem={({ item }) => {
          const isQuotation = item.type === "quotation";
          const isCurrentUser = item.sender_id === currentUserId;
          const isSystemMsg = item.type === "system";

          // กำหนดสไตล์การจัดวางข้อความ (ซ้าย, ขวา, กลาง)
          const messageAlignment = isSystemMsg
            ? styles.itemsCenter
            : isCurrentUser
            ? styles.itemsEnd
            : styles.itemsStart;

          // กำหนดสไตล์พื้นหลังและรูปร่างของ Message Bubble
          const messageBubbleStyle = [
            styles.baseBubble,
            isSystemMsg
              ? styles.systemBubble
              : isQuotation
              ? styles.quotationBubble
              : isCurrentUser
              ? styles.currentUserBubble
              : styles.otherUserBubble,
          ];
          
          // กำหนดสไตล์ข้อความภายใน Message Bubble
          const messageTextStyle = isCurrentUser 
            ? styles.currentUserText 
            : styles.otherUserText;


          const handleLongPress = () => {
            if (!isSystemMsg && isCurrentUser && onDeleteMessage) {
              Alert.alert(
                "ลบข้อความ",
                "คุณต้องการลบข้อความนี้หรือไม่?",
                [
                  {
                    text: "ยกเลิก",
                    style: "cancel"
                  },
                  {
                    text: "ลบ",
                    style: "destructive",
                    onPress: () => onDeleteMessage(item.id)
                  }
                ]
              );
            }
          };

          return (
            <View
              style={[styles.messageWrapper, messageAlignment]}
            >
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={500}
                activeOpacity={isSystemMsg || !isCurrentUser ? 1 : 0.7}
              >
                <View
                  style={messageBubbleStyle}
                >
                {isSystemMsg ? (
                  <Text style={styles.systemText}>
                    {item.text || ""}
                  </Text>
                ) : isQuotation ? (
                  <View style={styles.quotationContent}>
                    <Text style={styles.quotationTitle}>
                      ใบเสนอราคา
                    </Text>
                    <Text style={styles.quotationProduct}>
                      {item.quotation.productName || ""}
                    </Text>
                    <View style={styles.quotationPriceRow}>
                      <Text style={styles.quotationPriceLabel}>
                        ราคารวมสุทธิ
                      </Text>
                      <Text style={styles.quotationPriceValue}>
                        ฿ {item.quotation.price || ""}
                      </Text>
                    </View>
                    <View style={styles.quotationActionRow}>
                      <Text style={styles.quotationActionText}>
                        ดูฉบับเต็ม
                      </Text>
                      <Text style={styles.quotationActionText}>
                        ดาวน์โหลด
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.baseText, messageTextStyle]}>
                    {item.text || ""}
                  </Text>
                )}
                </View>
              </TouchableOpacity>
              {!isSystemMsg && (
                <Text
                  style={[styles.timestamp, isCurrentUser ? styles.textRight : styles.textLeft]}
                >
                  {formatTime(item.timestamp)}
                </Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

// --- StyleSheet Definitions ---
const styles = StyleSheet.create({
  // --- FlatList and Container Styles ---
  container: {
    flex: 1, // flex-1
  },
  flatList: {
    flex: 1, // flex-1
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)', // border border-black/5
  },
  contentContainer: {
    flexDirection: "column-reverse",
    padding: 14,
    flexGrow: 1,
  },

  // --- Message Wrapper and Alignment Styles ---
  messageWrapper: {
    marginBottom: 12, // mb-3
  },
  itemsCenter: {
    alignItems: 'center',
  },
  itemsEnd: {
    alignItems: 'flex-end',
  },
  itemsStart: {
    alignItems: 'flex-start',
  },

  // --- Base Message Bubble Styles ---
  baseBubble: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    borderRadius: 16, // rounded-2xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, // shadow-sm (ค่าประมาณ)
    shadowRadius: 1.41,
    elevation: 2,
  },
  baseText: {
    fontSize: 15, // text-[15px]
    maxWidth: 180, // max-w-[180px]
  },

  // --- Conditional Message Bubble Styles ---
  // System Message (items-center)
  systemBubble: {
    backgroundColor: '#E5E7EB', // bg-gray-200
    borderRadius: 6, // rounded-md
    maxWidth: '80%', // กำหนดให้ไม่กว้างเกินไป
    shadowOpacity: 0, // ลบเงาสำหรับข้อความระบบ
    elevation: 0,
  },
  systemText: {
    color: '#6B7280', // text-gray-500
    fontWeight: '600', // font-semibold
    fontSize: 14, // text-[14px]
  },

  // Current User Message (items-end)
  currentUserBubble: {
    backgroundColor: '#6495ED', // bg-[#6495ED]
    borderBottomRightRadius: 6, // rounded-br-md
    maxWidth: '75%', // max-w-[75%]
  },
  currentUserText: {
    color: 'white', // text-white
  },

  // Other User Message (items-start)
  otherUserBubble: {
    backgroundColor: 'white', // bg-white
    borderWidth: 1,
    borderColor: '#E5E7EB', // border border-gray-200
    borderBottomLeftRadius: 6, // rounded-bl-md
    maxWidth: '75%', // max-w-[75%]
  },
  otherUserText: {
    color: '#374151', // text-gray-800
  },

  // Quotation Message
  quotationBubble: {
    backgroundColor: 'white', // bg-white
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // border border-black/10
    width: 256, // w-64
    borderRadius: 16, // rounded-2xl
  },
  quotationContent: {
    gap: 16, // gap-4 (ใช้ margin แทนใน RN)
  },
  quotationTitle: {
    fontWeight: '600', // font-semibold
    color: 'rgba(0, 0, 0, 0.6)', // text-black/60
  },
  quotationProduct: {
    color: '#6B7280', // text-gray-500
    fontSize: 14, // text-[14px]
  },
  quotationPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12, // py-3
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // border-t border-b border-black/20
  },
  quotationPriceLabel: {
    fontWeight: '600', // font-semibold
    color: 'rgba(0, 0, 0, 0.6)', // text-black/60
    fontSize: 14, // text-[14px]
  },
  quotationPriceValue: {
    fontWeight: '600', // font-semibold
    color: 'rgba(0, 0, 0, 0.6)', // text-black/60
    fontSize: 14, // text-[14px]
  },
  quotationActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8, // py-2
  },
  quotationActionText: {
    fontWeight: '600', // font-semibold
    color: '#3B82F6', // text-blue-500
    fontSize: 13, // text-[13px]
  },

  // --- Timestamp Styles ---
  timestamp: {
    fontSize: 11, // text-[11px]
    color: '#9CA3AF', // text-gray-400
    marginTop: 4, // mt-1
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
});