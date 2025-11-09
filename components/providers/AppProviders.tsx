"use client";

import React from "react";
import { ToastProvider } from "./ToastProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
