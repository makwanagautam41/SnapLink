import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import getThemeStyles from "./utils/themeStyles.js";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Notifications from "./components/Notifications";
import Explore from "./pages/Explore";
import Reels from "./pages/Reels";
import SearchAndExplore from "./pages/SearchAndExplore";
import SearchedUserProfile from "./pages/SearchedUserProfile";
import NotFound from "./pages/NotFound";
import ProtectedPage from "./pages/ProtectedPage";
import Settings from "./pages/Settings";
import MyPostsModal from "./components/MyPostsModal";
import PostModal from "./components/PostModal";
import EditProfile from "./pages/EditProfile";
import SettingsLayout from "./components/settings/SettingsLayout";
import PersonalDetails from "./components/settings/PersonalDetails";
import AccountAndSecurity from "./components/settings/PasswordAndSecurity";
import AccountPrivacy from "./components/settings/AccountPrivacy";
import Blocked from "./components/settings/Blocked";
import CloseFriends from "./components/settings/CloseFriends";
import ReportProblem from "./components/settings/ReportProblem";
import SwitchAppearance from "./components/settings/SwitchAppearance";

// temp
import { useTheme } from "./context/ThemeContext";

const App = () => {
  const location = useLocation();
  const state = location.state;
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen">
      <Toaster />
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 p-2 z-10">
                <Home />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 z-10">
                <EditProfile />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/:username"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 z-10">
                <Profile />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/:username/post/:postId"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 z-10">
                <Profile />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 z-10">
                <SearchedUserProfile />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/profile/:username/post/:postId"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 z-10">
                <SearchedUserProfile />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/notification"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 z-10">
                <Notifications />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 p-2 z-10">
                <Explore />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/explore/:username/post/:postId"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 p-2 z-10">
                <Explore />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/reels"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 p-2 z-10">
                <Reels />
              </div>
            </ProtectedPage>
          }
        />
        <Route
          path="/explore/search"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 p-2 z-10">
                <SearchAndExplore />
              </div>
            </ProtectedPage>
          }
        />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Settings />} />
          <Route path="personal-details" element={<PersonalDetails />} />
          <Route
            path="password-and-security"
            element={<AccountAndSecurity />}
          />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="account-privacy" element={<AccountPrivacy />} />
          <Route path="close-friend" element={<CloseFriends />} />
          <Route path="blocked" element={<Blocked />} />
          <Route path="report-problem" element={<ReportProblem />} />
          <Route path="switch-appearance" element={<SwitchAppearance />} />
        </Route>
        <Route
          path="*"
          element={
            <ProtectedPage>
              <Sidebar />
              <div className="flex-1 lg:ml-64 z-10">
                <NotFound />
              </div>
            </ProtectedPage>
          }
        />
      </Routes>
      {state?.backgroundLocation && (
        <Routes>
          <Route path="/:username/post/:postId" element={<MyPostsModal />} />
        </Routes>
      )}
      {state?.searchedUserbackgroundLocation && (
        <Routes>
          <Route
            path="profile/:username/post/:postId"
            element={<PostModal />}
          />
        </Routes>
      )}
      {state?.exploreUserBackgroundLocation && (
        <Routes>
          <Route
            path="/explore/:username/post/:postId"
            element={<PostModal />}
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
