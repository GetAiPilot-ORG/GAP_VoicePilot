"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bot, ChevronDown, Check, UserX, Search, Sparkles } from "lucide-react";

export interface AssistantOption {
  id: string;
  name: string;
}

interface AssistantSelectProps {
  value?: string | null;
  assistants: AssistantOption[];
  onSelect: (assistantId: string) => void;
  disabled?: boolean;
}

export function AssistantSelect({
  value,
  assistants,
  onSelect,
  disabled = false,
}: AssistantSelectProps) {
  const [search, setSearch] = React.useState("");

  const selectedAssistant = React.useMemo(() => {
    if (!value || value === "none") return null;
    return assistants.find((a) => a.id === value) || null;
  }, [value, assistants]);

  const filteredAssistants = React.useMemo(() => {
    if (!search.trim()) return assistants;
    return assistants.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [assistants, search]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} asChild>
        {selectedAssistant ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-all shadow-xs group focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="max-w-[150px] truncate">{selectedAssistant.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors ml-0.5 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-hairline bg-surface-soft/80 text-neutral-600 text-xs font-medium hover:border-black/30 hover:text-black hover:bg-white transition-all group focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-5 h-5 rounded-md bg-neutral-200/60 flex items-center justify-center text-neutral-500 group-hover:bg-neutral-200 shrink-0">
              <UserX className="w-3.5 h-3.5" />
            </div>
            <span className="text-neutral-500 group-hover:text-black font-medium">Unassigned</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors ml-0.5 shrink-0" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[230px] p-1.5 rounded-xl border border-hairline bg-white shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-1"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
          Select Assistant
        </DropdownMenuLabel>

        {assistants.length > 4 && (
          <div className="px-2 py-1 mb-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-soft border border-hairline rounded-lg text-xs">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search assistants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-black outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        )}

        <DropdownMenuItem
          onClick={() => onSelect("none")}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors my-0.5 ${
            !selectedAssistant
              ? "bg-neutral-100 text-neutral-900 font-bold"
              : "text-neutral-600 hover:bg-rose-50 hover:text-rose-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <UserX className="w-3.5 h-3.5 text-neutral-400" />
            <span>Unassigned</span>
          </div>
          {!selectedAssistant && <Check className="w-3.5 h-3.5 text-black" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-hairline" />

        <div className="max-h-[200px] overflow-y-auto space-y-0.5">
          {filteredAssistants.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-neutral-400">
              No assistants found
            </div>
          ) : (
            filteredAssistants.map((ast) => {
              const isSelected = selectedAssistant?.id === ast.id;
              return (
                <DropdownMenuItem
                  key={ast.id}
                  onClick={() => onSelect(ast.id)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? "bg-black text-white font-semibold"
                      : "text-neutral-800 hover:bg-surface-soft hover:text-black"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{ast.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
