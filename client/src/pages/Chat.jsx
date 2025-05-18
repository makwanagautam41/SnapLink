import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import PostTopBar from "../components/PostTopBar";
import useThemeStyles from "../utils/themeStyles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const chatUsers = {
  johnshinoda: {
    name: "John Shinoda",
    avatar: "https://randomuser.me/api/portraits/men/37.jpg",
    online: false,
    messages: [
      { fromMe: false, text: "Hey man, how R U???", time: "08:30" },
      { fromMe: true, text: "I'm good, John! How about you?", time: "08:31" },
      { fromMe: false, text: "All good here!", time: "08:32" },
    ],
  },
  dinaharrison: {
    name: "Dina Harrison",
    avatar: "https://randomuser.me/api/portraits/women/38.jpg",
    online: true,
    messages: [
      {
        fromMe: false,
        text: "Hey Travis, would U like to drink some coffe with me?",
        time: "20:21",
      },
      { fromMe: true, text: "Shure! At 11:00 am ?", time: "20:22" },
      {
        fromMe: false,
        text: "Emm, no. Maybe at 10? Cuz i have to finish my home work. My professor is jackass...",
        time: "20:24",
      },
      {
        fromMe: true,
        text: "Wow, i heard that he is nerd, but never that he is a jackass. Anyway at 10 is ok. Would be my motivation get up earlier 😊",
        time: "20:25",
      },
      {
        fromMe: false,
        text: "Yay! I have a tons stories about that man. Ok, have a nice evening, see ya!",
        time: "20:26",
      },
      { fromMe: true, text: "See ya 😊", time: "20:28" },
    ],
  },
  mandyguoles: {
    name: "Mandy Guoles",
    avatar: "https://randomuser.me/api/portraits/women/39.jpg",
    online: false,
    messages: [
      { fromMe: false, text: "Let me be alone, please...", time: "16:43" },
      { fromMe: true, text: "Okay, take care Mandy!", time: "16:44" },
    ],
  },
  sampettersen: {
    name: "Sam Pettersen",
    avatar: "https://randomuser.me/api/portraits/men/40.jpg",
    online: true,
    messages: [
      { fromMe: false, text: "Hey dude, where is my...", time: "18:29" },
      { fromMe: true, text: "Your what? 😅", time: "18:30" },
    ],
  },
};

const sharedFiles = [
  {
    name: "Project Proposal.pdf",
    img: "https://cdn-icons-png.flaticon.com/512/337/337946.png",
    date: "Mar 15, 2024",
    size: "2.4 MB",
  },
  {
    name: "Meeting Notes.docx",
    img: "https://cdn-icons-png.flaticon.com/512/337/337932.png",
    date: "Mar 14, 2024",
    size: "1.2 MB",
  },
  {
    name: "Design Assets.zip",
    img: "https://cdn-icons-png.flaticon.com/512/337/337946.png",
    date: "Mar 13, 2024",
    size: "15.8 MB",
  },
];

const sharedLinks = [
  {
    name: "Project Repository",
    url: "https://github.com/username/project",
    time: "2 days ago",
  },
  {
    name: "Design System",
    url: "https://figma.com/file/123456",
    time: "1 week ago",
  },
  {
    name: "Meeting Recording",
    url: "https://zoom.us/recording/123456",
    time: "3 days ago",
  },
];

const Chat = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const chatUser = chatUsers[username];
  const styles = useThemeStyles();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatUser]);

  return (
    <div
      className={`flex flex-col md:flex-row h-full min-h-screen ${styles.bg}`}
    >
      <PostTopBar title={chatUser ? chatUser.name : "Chat"} />
      {/* Chat Section */}
      <div
        className={`flex-1 flex flex-col max-w-full md:max-w-2xl ${styles.bg} rounded-lg shadow-md md:shadow-none md:rounded-none`}
      >
        {/* Chat Header */}
        {chatUser ? (
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <img
              src={chatUser.avatar}
              alt={chatUser.name}
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <div className="font-semibold">{chatUser.name}</div>
              <div className="text-xs text-green-500">
                {chatUser.online ? "Online" : "Offline"}
              </div>
            </div>
            <div className="ml-auto text-gray-400 text-sm">20 March 2021</div>
          </div>
        ) : (
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="font-semibold">User not found</div>
          </div>
        )}
        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4`}
          style={{ minHeight: 0, maxHeight: "calc(100vh - 220px)" }}
        >
          {chatUser && chatUser.messages.length > 0 ? (
            chatUser.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.fromMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow text-sm ${
                    msg.fromMe
                      ? "bg-blue-100 dark:bg-blue-800 text-gray-900 dark:text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {msg.text}
                  <div className="text-xs text-gray-400 text-right mt-1">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">No messages yet.</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Message Input */}
        <div
          className={`p-4 border-t border-gray-200 dark:border-gray-800 ${styles.bg} flex items-center`}
        >
          <input
            type="text"
            placeholder="Type your message"
            className={`flex-1 px-4 py-2 rounded-full ${styles.input} focus:outline-none`}
          />
          <button className="ml-2 bg-blue-500 hover:bg-blue-600 hover:rotate-45 cursor-pointer text-white rounded-full p-3 transition">
            <svg
              className="button__icon"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M14.2199 21.9352C13.0399 21.9352 11.3699 21.1052 10.0499 17.1352L9.32988 14.9752L7.16988 14.2552C3.20988 12.9352 2.37988 11.2652 2.37988 10.0852C2.37988 8.91525 3.20988 7.23525 7.16988 5.90525L15.6599 3.07525C17.7799 2.36525 19.5499 2.57525 20.6399 3.65525C21.7299 4.73525 21.9399 6.51525 21.2299 8.63525L18.3999 17.1252C17.0699 21.1052 15.3999 21.9352 14.2199 21.9352ZM7.63988 7.33525C4.85988 8.26525 3.86988 9.36525 3.86988 10.0852C3.86988 10.8052 4.85988 11.9052 7.63988 12.8252L10.1599 13.6652C10.3799 13.7352 10.5599 13.9152 10.6299 14.1352L11.4699 16.6552C12.3899 19.4352 13.4999 20.4252 14.2199 20.4252C14.9399 20.4252 16.0399 19.4352 16.9699 16.6552L19.7999 8.16525C20.3099 6.62525 20.2199 5.36525 19.5699 4.71525C18.9199 4.06525 17.6599 3.98525 16.1299 4.49525L7.63988 7.33525Z"
                fill="#fff"
              ></path>
              <path
                d="M10.11 14.7052C9.92005 14.7052 9.73005 14.6352 9.58005 14.4852C9.29005 14.1952 9.29005 13.7152 9.58005 13.4252L13.16 9.83518C13.45 9.54518 13.93 9.54518 14.22 9.83518C14.51 10.1252 14.51 10.6052 14.22 10.8952L10.64 14.4852C10.5 14.6352 10.3 14.7052 10.11 14.7052Z"
                fill="#fff"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      {/* Right Sidebar (User Info & Shared Files) */}
      <div
        className={`hidden lg:flex flex-col w-80 ${styles.bg} border-l border-gray-200 dark:border-gray-800 p-4`}
      >
        {chatUser && (
          <>
            <div className="flex flex-col items-center mb-6">
              <img
                src={chatUser.avatar}
                alt={chatUser.name}
                className="w-20 h-20 rounded-full shadow-md"
              />
              <h2 className="mt-2 text-lg font-semibold">{chatUser.name}</h2>
            </div>
            <div className="mb-6">
              <div className="font-semibold mb-2">Shared Files</div>
              <div className="space-y-2">
                {sharedFiles.map((file, i) => (
                  <div key={i} className="flex items-center">
                    <img
                      src={file.img}
                      alt={file.name}
                      className="w-10 h-10 rounded mr-2"
                    />
                    <div className="flex-1">
                      <div className="text-sm">{file.name}</div>
                      <div className="text-xs">{file.date}</div>
                    </div>
                    <div className="text-xs ml-2">{file.size}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Shared Links</div>
              <div className="space-y-2">
                {sharedLinks.map((link, i) => (
                  <div key={i} className="flex items-center">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      {link.name}
                    </a>
                    <span className="text-xs text-gray-400 ml-auto">
                      {link.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
