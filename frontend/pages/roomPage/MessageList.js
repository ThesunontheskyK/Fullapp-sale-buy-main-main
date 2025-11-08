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
      className="flex-1 bg-gray-50 border border-black/5"
      contentContainerStyle={{ 
        padding: 16, 
        paddingBottom: 20,
        flexGrow: 1,
        justifyContent: 'flex-end'
      }}
      showsVerticalScrollIndicator={false}
      inverted={false}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => {
        const isQuotation = item.type === "quotation";
        const isCurrentUser = item.sender_id === currentUserId;
        const isSystemMsg = item.type === "system";

        return (
          <View className={`mb-3 ${isSystemMsg ? "items-center" : isCurrentUser ? "items-end" : "items-start"}`}>
            <View
              className={`px-4 py-3 rounded-2xl shadow-sm ${
                isSystemMsg
                  ? "bg-gray-200 rounded-md"
                  : isQuotation
                  ? "bg-white border border-black/10 max-w-[85%]"
                  : isCurrentUser
                  ? "bg-blue-500 rounded-br-md max-w-[75%]"
                  : "bg-white border border-gray-200 rounded-bl-md max-w-[75%]"
              }`}
            >
              {isSystemMsg ? (
                <Text className="text-gray-500 font-semibold text-sm">{item.text || ""}</Text>
              ) : isQuotation ? (
                <View className="flex gap-3">
                  <Text className="font-semibold text-black/60">ใบเสนอราคา</Text>
                  <Text className="text-gray-500 text-sm">{item.quotation.productName || ""}</Text>
                  <View className="flex flex-row justify-between border-t border-b border-black/20 py-3">
                    <Text className="font-semibold text-black/60 text-sm">ราคารวมสุทธิ</Text>
                    <Text className="font-semibold text-black/60 text-sm">฿ {item.quotation.price || ""}</Text>
                  </View>
                  <View className="flex flex-row justify-between py-2">
                    <Text className="font-semibold text-blue-500 text-sm">ดูฉบับเต็ม</Text>
                    <Text className="font-semibold text-blue-500 text-sm">ดาวน์โหลด</Text>
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