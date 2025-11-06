import { Text, View, FlatList } from "react-native";

export default function MessageList({ messages, currentUserId, flatListRef }) {
  const formatTime = (timestamp) =>
    new Date(timestamp * 1000).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ 
        padding: 16, 
        paddingBottom: 20
      }}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() =>
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50)
      }
      keyboardShouldPersistTaps="handled"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      renderItem={({ item }) => {
        const isQuotation = item.type === "quotation";
        const isCurrentUser = item.sender_id === currentUserId;
        const isSystemMsg = item.type === "system";

        return (
          <View className={`mb-3 ${isSystemMsg ? "items-center" : isCurrentUser ? "items-end" : "items-start"}`}>
            <View
              className={`px-6 py-3 rounded-2xl max-w-[100%] shadow-sm ${
                isSystemMsg
                  ? "text-[#125c91] bg-gray-200 rounded-md"
                  : isQuotation
                  ? "bg-white border border-black/10"
                  : isCurrentUser
                  ? "bg-blue-500 rounded-br-md"
                  : "bg-white border border-gray-200 rounded-bl-md"
              }`}
            >
              {isSystemMsg ? (
                <Text className="text-gray-500 font-semibold">{item.text || ""}</Text>
              ) : isQuotation ? (
                <View className="w-60 flex gap-4">
                  <Text className="font-semibold text-black/60">ใบเสนอราคา</Text>
                  <Text className="text-gray-500">{item.quotation.productName || ""}</Text>
                  <View className="flex flex-row justify-between border-t border-b border-black/20 py-4 text-gray-500 text-sm">
                    <Text className="font-semibold text-black/60">ราคารวมสุทธิ</Text>
                    <Text className="font-semibold text-black/60">฿ {item.quotation.price || ""}</Text>
                  </View>
                  <View className="flex flex-row justify-between py-2">
                    <Text className="font-semibold text-blue-500">ดูฉบับเต็ม</Text>
                    <Text className="font-semibold text-blue-500">ดาวโหลด</Text>
                  </View>
                </View>
              ) : (
                <Text className={`text-base ${isCurrentUser ? "text-white" : "text-gray-800"}`}>
                  {item.text || ""}
                </Text>
              )}
            </View>
            {!isSystemMsg && (
              <Text className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                {formatTime(item.timestamp)}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}