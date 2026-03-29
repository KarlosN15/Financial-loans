import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: string | number;
  label: string;
  sublabel?: string;
  original: any;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.id.toString() === value?.toString());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <div 
        className="w-full bg-slate-50 border-0 border-b-2 border-slate-100 focus-within:border-primary flex items-center transition-all cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 py-4 px-0 text-sm font-black overflow-hidden truncate">
          {selectedOption ? (
            <div className="flex flex-col">
              <span>{selectedOption.label}</span>
              {selectedOption.sublabel && <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedOption.sublabel}</span>}
            </div>
          ) : (
            <span className="text-slate-400 font-medium italic">{placeholder}</span>
          )}
        </div>
        <span className="material-symbols-outlined text-slate-400 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white rounded-3xl shadow-3xl border border-slate-100 mt-2 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-50">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                autoFocus
                type="text"
                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Escribe para buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-xs">No se encontraron resultados</div>
            ) : (
              filteredOptions.map(option => (
                <div 
                  key={option.id}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${value?.toString() === option.id.toString() ? 'bg-primary text-white hover:bg-primary/95' : 'text-slate-700'}`}
                  onClick={() => {
                    onChange(option.id.toString());
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <p className="text-sm font-black leading-tight">{option.label}</p>
                  {option.sublabel && <p className={`text-[10px] font-bold uppercase tracking-widest ${value?.toString() === option.id.toString() ? 'text-white/60' : 'text-slate-400'}`}>{option.sublabel}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
