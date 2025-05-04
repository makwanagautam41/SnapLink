import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import ProtectedPage from "../../pages/ProtectedPage";
import SettingMenu from "./SettingsMenu";

const SettingsLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [menuVisible, setMenuVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuVisible(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (location.pathname === "/settings") {
        setMenuVisible(true);
      } else {
        setMenuVisible(false);
      }
    }
  }, [location.pathname, isMobile]);

  return (
    <ProtectedPage>
      <div className="flex w-full">
        <Sidebar />
        <div className="flex flex-1 lg:ml-64 z-10 ">
          {menuVisible && (
            <SettingMenu setMenuVisible={setMenuVisible} isMobile={isMobile} />
          )}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
};

export default SettingsLayout;
