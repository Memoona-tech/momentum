"use client";

import React from "react";
import { X } from "lucide-react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm px-0 md:px-4">
      <div className="bg-void-900 border border-void-600 rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto shadow-vault">
        <div className="flex items-center justify-between px-5 py-4 border-b border-void-700 sticky top-0 bg-void-900">
          <h2 className="font-display text-lg text-parchment">{title}</h2>
          <button onClick={onClose} className="text-void-400 hover:text-gold-400" aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
