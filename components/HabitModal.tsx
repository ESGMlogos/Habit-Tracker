import React, { useState } from 'react';
import { Habit } from '../types';
import { X } from 'lucide-react';

interface HabitModalProps {
  onClose: () => void;
  onSave: (habit: Habit) => void;
  categories: string[];
}

export const HabitModal: React.FC<HabitModalProps> = ({ onClose, onSave, categories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(categories[0] || 'General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: crypto.randomUUID(),
      title,
      description,
      category,
      createdAt: new Date().toISOString(),
      archived: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292524]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#FDFCF5] border border-[#E7E5E4] rounded-sm p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b45309] to-[#c2410c]"></div>
        
        <div className="flex justify-between items-center mb-8 border-b border-[#E7E5E4] pb-4">
          <h2 className="text-2xl font-display font-bold text-[#292524]">New Discipline</h2>
          <button onClick={onClose} className="text-[#78716c] hover:text-[#b45309] transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-[#78716c] mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read the Stoics"
              className="w-full bg-white border border-[#D6D3D1] rounded-sm p-3 text-[#292524] placeholder-[#A8A29E] focus:ring-1 focus:ring-[#b45309] focus:border-[#b45309] outline-none font-serif"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-[#78716c] mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-[#D6D3D1] rounded-sm p-3 text-[#292524] focus:ring-1 focus:ring-[#b45309] focus:border-[#b45309] outline-none font-serif appearance-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-[#78716c] mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What virtue does this cultivate?"
              className="w-full bg-white border border-[#D6D3D1] rounded-sm p-3 text-[#292524] placeholder-[#A8A29E] focus:ring-1 focus:ring-[#b45309] focus:border-[#b45309] outline-none font-serif"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#292524] hover:bg-[#44403C] text-[#FDFCF5] font-display font-bold uppercase tracking-widest rounded-sm transition-all shadow-md hover:shadow-lg mt-4"
          >
            Commit
          </button>
        </form>
      </div>
    </div>
  );
};