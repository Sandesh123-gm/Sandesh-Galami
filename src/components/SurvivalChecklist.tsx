import React, { useState, useEffect } from "react";
import { ChecklistItem } from "../types";
import { Plus, Trash, CheckSquare, Square, CheckCircle, Package } from "lucide-react";

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: "item-1", text: "Ready-to-eat dry foods (Chura, Dalmoth, biscuits for 3 days)", checked: false },
  { id: "item-2", text: "Clean water container (min. 3 liters per individual)", checked: false },
  { id: "item-3", text: "Waterproof matches, candle/lighter or tactical whistle", checked: false },
  { id: "item-4", text: "Charged Power Bank with multi-tip micro USB cables", checked: false },
  { id: "item-5", text: "Essential emergency medicines (cetamol, bandage, antiseptics)", checked: false },
  { id: "item-6", text: "Photocopy of Citizenship (Nagarikta) or personal status certificates", checked: false },
  { id: "item-7", text: "Heavy-duty LED flashlight with extra dry cells", checked: false },
];

export default function SurvivalChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("snirs_survival_checklist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        setItems(INITIAL_CHECKLIST);
      }
    } else {
      setItems(INITIAL_CHECKLIST);
    }
  }, []);

  const saveList = (list: ChecklistItem[]) => {
    setItems(list);
    localStorage.setItem("snirs_survival_checklist", JSON.stringify(list));
  };

  const handleToggle = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveList(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      checked: false
    };

    saveList([...items, newItem]);
    setNewItemText("");
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveList(updated);
  };

  const completedCount = items.filter(i => i.checked).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-none p-5 flex flex-col h-full" id="safety-checklist-card">
      <div className="border-b-2 border-orange-600 pb-3 mb-4">
        <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-600" />
          Ready Pack Kit Checked
        </h2>
        <p className="text-[10px] font-mono text-white/40 tracking-wider">NEPAL REGIONAL MOUNTAIN SURVIVAL GEAR</p>
      </div>

      {/* Progress scale */}
      <div className="mb-4 bg-black border border-white/5 p-3.5">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="font-mono text-white/55 uppercase tracking-wide">Readiness Indicator</span>
          <span className="font-bold font-mono text-orange-500">{progressPercent}% SECURED</span>
        </div>
        <div className="w-full bg-white/10 h-2.5 rounded-none relative overflow-hidden">
          <div 
            className="bg-orange-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        {progressPercent === 100 && (
          <p className="text-[10px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> Survival configuration optimal. Emergency ready!
          </p>
        )}
      </div>

      {/* Checklist list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mb-4 max-h-[220px] scrollbar-thin scrollbar-thumb-white/10">
        {items.map((item) => (
          <div 
            key={item.id}
            className={`flex items-start justify-between p-2 hover:bg-white/5 border transition-all ${
              item.checked ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-black"
            }`}
          >
            <button 
              onClick={() => handleToggle(item.id)}
              className="flex items-start gap-2.5 text-left text-xs text-white/90 select-none cursor-pointer flex-1 py-0.5"
            >
              {item.checked ? (
                <CheckSquare className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
              ) : (
                <Square className="h-4.5 w-4.5 text-white/30 hover:text-orange-500 shrink-0 mt-0.5" />
              )}
              <span className={`leading-relaxed font-mono ${item.checked ? "line-through text-white/40" : "text-white/85"}`}>
                {item.text}
              </span>
            </button>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="text-white/30 hover:text-red-500 p-0.5 transition-colors cursor-pointer shrink-0"
              title="Delete Kit Tag"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add local kit item (e.g., Radio, Spanner)..."
          className="flex-grow bg-black text-white text-xs border border-white/20 p-2.5 focus:border-orange-500 focus:outline-none placeholder-white/30"
        />
        <button
          type="submit"
          className="bg-orange-600 hover:bg-white text-black font-black px-4 transition-colors cursor-pointer text-xs uppercase flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>
    </div>
  );
}
