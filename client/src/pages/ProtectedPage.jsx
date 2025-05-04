import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const ProtectedPage = ({ children }) => {
  const { token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !token) {
      navigate(`/signin?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [token, loading, navigate, location.pathname]);

  if (loading) return null;

  return token ? children : null;
};

export default ProtectedPage;
