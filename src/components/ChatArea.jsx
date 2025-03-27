import { useState } from "react";

export default function ChatArea({ currentChat, chatType, username, messages, sendMessage, groupName }) {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-4 bg-teal-600 text-white shadow-md">
        {currentChat ? (
          <>
            <div className="w-10 h-10 flex items-center justify-center bg-white text-teal-600 rounded-full text-lg font-bold">
              {chatType === "group" ? groupName.charAt(0).toUpperCase() : currentChat.charAt(0).toUpperCase()}
            </div>
            <h3 className="ml-3 text-lg font-semibold">
              {chatType === "group" ? groupName : currentChat}
            </h3>
          </>
        ) : (
          <h3 className="text-lg font-bold">Select a chat</h3>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3 bg-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[70%] p-3 rounded-md shadow ${
              msg.sender === username ? "bg-teal-500 text-white ml-auto" : "bg-white text-gray-800"
            }`}
          >
            {chatType === "group" && msg.sender !== username && (
              <p className="text-sm font-semibold">{msg.sender}</p>
            )}
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Message Input Box */}
      {currentChat && (
        <div className="flex items-center p-3 bg-white border-t">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded-md outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 px-2 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
