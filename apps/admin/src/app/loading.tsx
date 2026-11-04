"use client";

import React from "react";
import { AppLoader } from "@/components/ui/app-loader";

export default function Loading() {
  return <AppLoader fullPage color="#22d3ee" size={18} speedMultiplier={1.2} text="Loading SoftSasi OmniStay..." />;
}

