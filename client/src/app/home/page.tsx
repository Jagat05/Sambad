"use client";

import React from "react";
import { useSelector } from "react-redux";

export default function Home() {
  const username = useSelector((state: any) => state.user.username);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "2rem",
        fontWeight: "bold",
      }}
    >
      Welcome, {username || "Guest"}!
    </div>
  );
}
