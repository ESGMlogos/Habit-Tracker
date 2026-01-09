import React, { useState } from 'react';
import { X, Trash2, Archive, ArchiveRestore, Plus, Pencil, Check } from 'lucide-react';
import { Habit } from '../types';
import { getCategoryColorClass } from '../constants';

interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  categories: string[];
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAddHabit: (habit: Habit) => void;
  onUpdateHabit: (habit: Habit) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

type Tab = 'habits' | 'categories';

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isOpen, 
  onClose, 
  habits, 
  categories,
  onToggleArchive, 
  onDelete,
  onAddHabit,
  onUpdateHabit,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('habits');
  
  // Category State
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  // Habit State
  const [isCreatingHabit, setIsCreatingHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitForm, setHabitForm] = useState({ title: '', category: '', description: '' });

  // Group habits by category
  const groupedHabits = React.useMemo(() => {
    const groups: Record<string, Habit[]> = {};
    categories.forEach(cat => {
      groups[cat] = habits.filter(h => h.category === cat);
    });
    return groups;
  }, [habits, categories]);

  // --- Habit Actions ---
  const initCreateHabit = () => {
      setIsCreatingHabit(true);
      setEditingHabitId(null);
      setHabitForm({ title: '', category: categories[0] || 'General', description: '' });
  };

  const initEditHabit = (habit: Habit) => {
      setEditingHabitId(habit.id);
      setIsCreatingHabit(false);
      setHabitForm({ title: habit.title, category: habit.category, description: habit.description });
  };

  const cancelHabitForm = () => {
      setIsCreatingHabit(false);
      setEditingHabitId(null);
      setHabitForm({ title: '', category: '', description: '' });
  };

  const saveHabit = () => {
      if (!habitForm.title.trim()) return;

      if (isCreatingHabit) {
          onAddHabit({
              id: crypto.randomUUID(),
              title: habitForm.title,
              category: habitForm.category || categories[0],
              description: habitForm.description,
              createdAt: new Date().toISOString(),
              archived: false
          });
      } else if (editingHabitId) {
          const original = habits.find(h => h.id === editingHabitId);
          if (original) {
              onUpdateHabit({
                  ...original,
                  title: habitForm.title,
                  category: habitForm.category || categories[0],
                  description: habitForm.description
              });
          }
      }
      cancelHabitForm();
  };

  // --- Category Actions ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if(newCategory.trim()) {
        onAddCategory(newCategory.trim());
        setNewCategory('');
    }
  };

  const startEditingCategory = (category: string) => {
    setEditingCategory(category);
    setEditCategoryValue(category);
  };

  const saveEditingCategory = () => {
      if (editingCategory && editCategoryValue.trim() && editCategoryValue !== editingCategory) {
          onUpdateCategory(editingCategory, editCategoryValue.trim());
      }
      setEditingCategory(null);
      setEditCategoryValue('');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#292524]/60 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Sheet */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-full md:w-[480px] bg-[#FDFCF5] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) flex flex-col border-l border-[#E7E5E4] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E7E5E4] bg-[#FDFCF5] sticky top-0 z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-[#292524]">Control Panel</h2>
                <p className="text-xs font-serif text-[#78716c] uppercase tracking-widest mt-1">Administration</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-[#E7E5E4] rounded-sm text-[#78716c] transition-colors"
            >
                <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E7E5E4]">
              <button 
                onClick={() => setActiveTab('habits')}
                className={`flex-1 pb-3 text-sm font-display font-bold tracking-wider uppercase transition-colors relative ${activeTab === 'habits' ? 'text-[#b45309]' : 'text-[#A8A29E] hover:text-[#78716c]'}`}
              >
                  Disciplines
                  {activeTab === 'habits' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b45309]"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('categories')}
                className={`flex-1 pb-3 text-sm font-display font-bold tracking-wider uppercase transition-colors relative ${activeTab === 'categories' ? 'text-[#b45309]' : 'text-[#A8A29E] hover:text-[#78716c]'}`}
              >
                  Categories
                  {activeTab === 'categories' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b45309]"></div>}
              </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* VIEW: HABITS */}
            {activeTab === 'habits' && (
                <>
                {/* Create New Habit Button */}
                {!isCreatingHabit && !editingHabitId && (
                    <button 
                        onClick={initCreateHabit}
                        className="w-full py-3 border-2 border-dashed border-[#D6D3D1] hover:border-[#b45309] text-[#78716c] hover:text-[#b45309] rounded-sm flex items-center justify-center gap-2 transition-all group mb-4"
                    >
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-display font-bold uppercase tracking-wide text-sm">New Discipline</span>
                    </button>
                )}

                {/* Inline Habit Form (Create or Edit) */}
                {(isCreatingHabit || editingHabitId) && (
                    <div className="p-4 bg-white border border-[#b45309] rounded-sm shadow-sm mb-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E7E5E4]">
                            <h4 className="font-display font-bold text-[#b45309] uppercase tracking-wider text-xs">
                                {isCreatingHabit ? 'Create Discipline' : 'Edit Discipline'}
                            </h4>
                            <div className="flex gap-1">
                                <button onClick={saveHabit} className="p-1 hover:bg-[#F0FDF4] text-[#15803d] rounded-sm">
                                    <Check size={18} />
                                </button>
                                <button onClick={cancelHabitForm} className="p-1 hover:bg-[#FEF2F2] text-[#ef4444] rounded-sm">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-[#A8A29E] uppercase font-bold mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={habitForm.title}
                                    onChange={(e) => setHabitForm({...habitForm, title: e.target.value})}
                                    className="w-full border border-[#D6D3D1] p-2 rounded-sm text-sm text-[#292524] outline-none focus:border-[#b45309]"
                                    placeholder="Discipline Name"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#A8A29E] uppercase font-bold mb-1">Category</label>
                                <select 
                                    value={habitForm.category}
                                    onChange={(e) => setHabitForm({...habitForm, category: e.target.value})}
                                    className="w-full border border-[#D6D3D1] p-2 rounded-sm text-sm text-[#292524] outline-none focus:border-[#b45309]"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#A8A29E] uppercase font-bold mb-1">Description</label>
                                <input 
                                    type="text" 
                                    value={habitForm.description}
                                    onChange={(e) => setHabitForm({...habitForm, description: e.target.value})}
                                    className="w-full border border-[#D6D3D1] p-2 rounded-sm text-sm text-[#292524] outline-none focus:border-[#b45309]"
                                    placeholder="Description..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* List of Habits */}
                {categories.map((category) => {
                    const categoryHabits = groupedHabits[category];
                    if (!categoryHabits || categoryHabits.length === 0) return null;

                    return (
                        <div key={category} className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-2 py-0.5 text-[9px] uppercase font-display font-bold tracking-widest rounded-sm shadow-sm ${getCategoryColorClass(category)}`}>
                                    {category}
                                </span>
                                <div className="h-px bg-[#E7E5E4] flex-1"></div>
                            </div>

                            <div className="space-y-3">
                                {categoryHabits.map(habit => {
                                    // Don't show the row if it's currently being edited
                                    if (habit.id === editingHabitId) return null;

                                    return (
                                        <div 
                                            key={habit.id} 
                                            className={`
                                                group flex items-center justify-between p-4 rounded-sm border transition-all duration-300
                                                ${habit.archived 
                                                    ? 'bg-[#F5F5F4] border-[#E7E5E4] opacity-70 grayscale' 
                                                    : 'bg-white border-[#E7E5E4] hover:border-[#b45309]/30 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <div className="flex-1 pr-4">
                                                <h4 className={`font-display font-bold text-sm ${habit.archived ? 'text-[#78716c] line-through' : 'text-[#292524]'}`}>
                                                    {habit.title}
                                                </h4>
                                                <p className="font-serif text-xs text-[#78716c] italic mt-0.5 truncate">
                                                    {habit.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => initEditHabit(habit)}
                                                    title="Edit"
                                                    disabled={isCreatingHabit || editingHabitId !== null}
                                                    className="p-2 text-[#78716c] hover:text-[#b45309] hover:bg-[#F5F5F4] rounded-sm transition-colors disabled:opacity-30"
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                <button
                                                    onClick={() => onToggleArchive(habit.id)}
                                                    title={habit.archived ? "Restore" : "Archive"}
                                                    disabled={isCreatingHabit || editingHabitId !== null}
                                                    className="p-2 text-[#78716c] hover:text-[#b45309] hover:bg-[#F5F5F4] rounded-sm transition-colors disabled:opacity-30"
                                                >
                                                    {habit.archived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                                                </button>
                                                
                                                <div className="w-px h-4 bg-[#E7E5E4] mx-1"></div>

                                                <button
                                                    onClick={() => {
                                                        if(confirm('Are you sure you want to delete this discipline permanently?')) {
                                                            onDelete(habit.id);
                                                        }
                                                    }}
                                                    title="Delete Permanently"
                                                    disabled={isCreatingHabit || editingHabitId !== null}
                                                    className="p-2 text-[#78716c] hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-30"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                {habits.length === 0 && !isCreatingHabit && (
                    <div className="text-center py-12 opacity-50">
                        <p className="font-serif italic text-[#78716c]">No disciplines recorded.</p>
                    </div>
                )}
                </>
            )}

            {/* VIEW: CATEGORIES */}
            {activeTab === 'categories' && (
                <div className="animate-fade-in space-y-6">
                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New Category..."
                            className="flex-1 bg-white border border-[#D6D3D1] rounded-sm p-3 text-sm text-[#292524] placeholder-[#A8A29E] focus:ring-1 focus:ring-[#b45309] outline-none font-serif"
                        />
                        <button 
                            type="submit"
                            disabled={!newCategory.trim()}
                            className="bg-[#292524] text-[#FDFCF5] p-3 rounded-sm hover:bg-[#44403C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </form>

                    <div className="space-y-2">
                        {categories.map(cat => (
                             <div 
                                key={cat}
                                className="flex items-center justify-between p-3 bg-white border border-[#E7E5E4] rounded-sm group hover:border-[#b45309]/30 transition-colors"
                             >
                                {editingCategory === cat ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input 
                                            type="text" 
                                            value={editCategoryValue}
                                            onChange={(e) => setEditCategoryValue(e.target.value)}
                                            className="flex-1 bg-[#F5F5F4] border border-[#b45309] rounded-sm px-2 py-1 text-sm text-[#292524] font-display font-bold outline-none"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && saveEditingCategory()}
                                        />
                                        <button onClick={saveEditingCategory} className="text-[#15803d] p-1 hover:bg-[#F0FDF4] rounded-sm">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => setEditingCategory(null)} className="text-[#ef4444] p-1 hover:bg-[#FEF2F2] rounded-sm">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getCategoryColorClass(cat).split(' ')[0]}`}></div>
                                            <span className="font-display font-bold text-[#292524] text-sm">{cat}</span>
                                            <span className="text-[10px] text-[#A8A29E] font-serif bg-[#F5F5F4] px-1.5 py-0.5 rounded-sm">
                                                {habits.filter(h => h.category === cat).length} uses
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditingCategory(cat)}
                                                className="p-1.5 text-[#78716c] hover:text-[#b45309] hover:bg-[#F5F5F4] rounded-sm transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDeleteCategory(cat)}
                                                className="p-1.5 text-[#78716c] hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                             </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-[#E7E5E4] bg-[#F5F5F4]/50">
             <p className="text-[10px] text-[#A8A29E] text-center font-serif">
                "It is not that we have a short time to live, but that we waste a lot of it." — Seneca
             </p>
        </div>
      </div>
    </>
  );
};