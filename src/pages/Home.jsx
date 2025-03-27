import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatArea from "../components/ChatArea";
import socket from "../socket";

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [chatType, setChatType] = useState(null);
  const [currentGroupName, setCurrentGroupName] = useState("");

  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }

    socket.emit("userLogin", username);

    const handleReceiveMessage = (message) => {
      if (
        (chatType === "group" && currentChat === message.groupId) ||
        (chatType === "private" &&
          (currentChat === `${username}-${message.sender}` ||
            currentChat === `${message.sender}-${username}`))
      ) {
        setMessages((prev) => [...prev, message]);
      }

      setLastMessages((prev) => ({
        ...prev,
        [message.groupId || message.sender]: message,
      }));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("updateUsers", setUsers);
    socket.on("updateGroups", setGroups);
    socket.on("updateLastMessages", setLastMessages);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("updateUsers", setUsers);
      socket.off("updateGroups", setGroups);
      socket.off("updateLastMessages", setLastMessages);
    };
  }, [username, currentChat, chatType]);

  const fetchMessages = (chatId, type) => {
    socket.emit("fetchMessages", { chatId, type }, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });
  };

  const sendMessage = (content) => {
    const message = {
      sender: username,
      receiver: chatType === "private" ? currentChat.split("-").find((u) => u !== username) : null,
      groupId: chatType === "group" ? currentChat : null,
      content,
      timestamp: new Date().toISOString(),
    };
    socket.emit("sendMessage", message);
  };

  const createGroup = () => navigate("/create-group");

  const selectChat = (chatId, type) => {
    setCurrentChat(chatId);
    setChatType(type);
    setSidebarOpen(false);
    fetchMessages(chatId, type);

    if (type === "group") {
      const group = groups.find((g) => g._id === chatId);
      setCurrentGroupName(group ? group.name : "Unknown Group");
    } else {
      setCurrentGroupName("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    socket.emit("userLogout", username);
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-gradient-to-b from-teal-400 from-50% to-gray-100 to-50% space-y-6 px-4">
      <h2 className="font-pacific font-bold text-4xl text-white max-sm:hidden sm:text-3xl">Messenger</h2>

      <div className="flex w-full max-w-6xl h-[80vh] bg-white rounded-md max-sm:h-[90vh] shadow-lg overflow-hidden relative">
        {!isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute right-2 top-4 w-12 z-10 bg-teal-600 text-white text-3xl flex items-center justify-center sm:hidden"
          >
            ☰
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`flex flex-col bg-gray-100 w-64 h-full p-4 border-r transition-transform duration-300 ease-in-out 
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
            absolute sm:relative z-10`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="sm:hidden bg-red-500 text-white px-3 py-1 rounded-md self-end mb-4"
          >
            ✕
          </button>

          {/* Create Group Button */}
          <button
            onClick={createGroup}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-3 hover:bg-blue-600 w-full"
          >
            + Create Group
          </button>

          {/* Scrollable Users & Groups */}
          <h3 className="text-lg font-semibold">Users</h3>
          <div className="flex-grow overflow-y-auto hide-scrollbar space-y-3">
            {users.map((user) => {
              const lastMessage = lastMessages[user.username];
              return (
                <div
                  key={user.username}
                  className={`flex items-center p-2 bg-white shadow-sm rounded-md hover:bg-gray-200 cursor-pointer ${
                    currentChat === `${username}-${user.username}` ||
                    currentChat === `${user.username}-${username}`
                      ? "bg-gray-300"
                      : ""
                  }`}
                  onClick={() => selectChat(`${username}-${user.username}`, "private")}
                >
                  <div className="relative w-10 h-10 flex items-center justify-center bg-teal-600 text-white rounded-full text-lg font-bold">
                    {user.username[0].toUpperCase()}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                        user.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{user.username}</p>
                    {lastMessage && (
                      <p className="text-sm text-gray-500">
                        {lastMessage.content} • {new Date(lastMessage.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {groups.map((group) => {
              const lastMessage = lastMessages[group._id];
              return (
                <div
                  key={group._id}
                  className={`flex items-center p-2 bg-white shadow-sm rounded-md hover:bg-gray-200 cursor-pointer ${
                    currentChat === group._id ? "bg-gray-300" : ""
                  }`}
                  onClick={() => selectChat(group._id, "group")}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full text-lg font-bold">
                    {group.name[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{group.name}</p>
                    {lastMessage && (
                      <p className="text-sm text-gray-500">
                        {lastMessage.content} • {new Date(lastMessage.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Logout Button at Bottom */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full mt-3"
          >
            Logout
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white max-sm:w-full  flex flex-col">
          <ChatArea 
            messages={messages} 
            sendMessage={sendMessage} 
            currentChat={currentChat} 
            chatType={chatType} 
            username={username} 
            groupName={currentGroupName} 
          />
        </div>
      </div>
    </div>
  );
}
