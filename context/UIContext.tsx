"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface UIContextType {
    isSidebarOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <UIContext.Provider value={{ isSidebarOpen, openSidebar, closeSidebar, toggleSidebar }}>
            {children}
            <Toaster position="top-right" />
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
};
