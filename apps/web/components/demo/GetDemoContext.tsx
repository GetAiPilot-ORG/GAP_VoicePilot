"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { GetDemoModal } from "./GetDemoModal";

interface DemoModalContextType {
  isOpen: boolean;
  source: string;
  openDemoModal: (source?: string) => void;
  closeDemoModal: () => void;
}

const DemoModalContext = createContext<DemoModalContextType | undefined>(undefined);

export function DemoModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("website_hero");

  const openDemoModal = (sourceName = "website_hero") => {
    setSource(sourceName);
    setIsOpen(true);
  };

  const closeDemoModal = () => {
    setIsOpen(false);
  };

  return (
    <DemoModalContext.Provider value={{ isOpen, source, openDemoModal, closeDemoModal }}>
      {children}
      <GetDemoModal isOpen={isOpen} onClose={closeDemoModal} source={source} />
    </DemoModalContext.Provider>
  );
}

export function useDemoModal() {
  const context = useContext(DemoModalContext);
  if (!context) {
    throw new Error("useDemoModal must be used within a DemoModalProvider");
  }
  return context;
}
