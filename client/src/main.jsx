import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PostProvider } from "./context/PostContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { StoryProvider } from "./context/StoryContext.jsx";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <PostProvider>
        <StoryProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StoryProvider>
      </PostProvider>
    </AuthProvider>
  </ThemeProvider>
);
