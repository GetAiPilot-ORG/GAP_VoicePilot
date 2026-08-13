"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Copy, Trash2, AlertTriangle, X, PhoneCall } from "lucide-react";
import { deleteAssistantAction, duplicateAssistantAction } from "@/app/actions/assistants";
import AssistantTestModal from "@/components/AssistantTestModal";

interface AssistantActionMenuProps {
  assistantId: string;
  assistantName: string;
}

export default function AssistantActionMenu({ assistantId, assistantName }: AssistantActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAssistantAction(assistantId);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert("Failed to delete assistant: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDuplicating(true);
    setIsOpen(false);
    try {
      await duplicateAssistantAction(assistantId);
    } catch (err: any) {
      alert("Failed to duplicate assistant: " + err.message);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <>
      <div className="relative inline-flex items-center gap-2 text-left" ref={menuRef}>
        <button
          onClick={() => setIsTestModalOpen(true)}
          className="btn-pill-secondary text-xs px-2.5 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-200 transition-colors flex items-center gap-1"
          title="Test Voice Agent"
        >
          <PhoneCall className="w-3 h-3 text-emerald-600" />
          Test
        </button>

        <Link href={`/dashboard/assistants/${assistantId}`}>
          <button className="btn-pill-secondary text-xs px-3 py-1.5 font-semibold hover:bg-black hover:text-white transition-colors">
            Configure
          </button>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isDeleting || isDuplicating}
          className="p-1.5 rounded-[8px] hover:bg-surface-soft border border-hairline text-neutral-600 hover:text-black transition-colors"
          title="More options"
        >
          <MoreVertical className={`w-4 h-4 ${isDeleting || isDuplicating ? "animate-spin" : ""}`} />
        </button>

        {/* 3-Dots Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-white text-black border border-black/10 rounded-[12px] p-1.5 shadow-2xl z-[100] animate-fadeIn space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsTestModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-[8px] hover:bg-surface-soft text-neutral-700 hover:text-black transition-colors text-left"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              Test Voice Call
            </button>

            <button
              onClick={handleDuplicate}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-[8px] hover:bg-surface-soft text-neutral-700 hover:text-black transition-colors text-left"
            >
              <Copy className="w-3.5 h-3.5 text-neutral-500" />
              Duplicate
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setIsDeleteModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-[8px] hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Professional Confirmation Modal Dialog */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-[16px] max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp text-black text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-black">Delete Voice Assistant?</h3>
                  <p className="text-xs text-neutral-500 font-medium">This action cannot be undone.</p>
                </div>
              </div>

              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-full hover:bg-surface-soft transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-[10px] bg-surface-soft border border-hairline text-xs leading-relaxed text-neutral-700">
              Are you sure you want to delete <strong className="text-black font-mono font-bold">"{assistantName}"</strong>? This will permanently remove it from both <strong className="text-black">VoicePilot</strong> and <strong className="text-black">Voice API</strong>.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-[10px] border border-hairline text-xs font-semibold hover:bg-surface-soft text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] text-xs font-bold py-2.5 shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? "Deleting..." : "Delete Assistant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Call Modal */}
      <AssistantTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        assistant={{
          id: assistantId,
          name: assistantName
        }}
      />
    </>
  );
}
