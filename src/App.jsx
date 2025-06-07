import React, { useState, useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";

function MainApp() {
  const { loading } = useLoading();

  return (
    <>
      {loading && <LoadingScreen />}
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  );
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <LoadingProvider>
      <MainApp />
    </LoadingProvider>
  );
}
