import React, { useState } from 'react';
import { FLUTTER_CODEBASE, CodeFile } from '../data/flutterCodebase';
import { FileCode, Copy, Check, Search, Download, FolderTree, Code, Terminal } from 'lucide-react';

export const FlutterCodeExplorer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(FLUTTER_CODEBASE[0].path);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const activeFile = FLUTTER_CODEBASE.find((f) => f.path === selectedFilePath) || FLUTTER_CODEBASE[0];

  const filteredFiles = FLUTTER_CODEBASE.filter((f) => {
    const matchesSearch = f.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllAsTxt = () => {
    const combined = FLUTTER_CODEBASE.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prepmate_bd_flutter_codebase.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden max-w-6xl mx-auto my-4">
      {/* Top Action Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600/30 text-emerald-400 rounded-lg flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              PrepMate BD — Flutter Dart Clean Architecture Codebase
            </h3>
            <p className="text-[11px] text-slate-400">
              Riverpod + GoRouter + Dio + Gemini AI + bdapps Carrier Billing API (PHP)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Active File'}
          </button>

          <button
            onClick={handleDownloadAllAsTxt}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export All Files (.txt)
          </button>
        </div>
      </div>

      {/* Grid: File Sidebar & Code Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Sidebar */}
        <div className="md:col-span-4 bg-slate-950/60 p-3 border-r border-slate-800 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file path..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            {['all', 'core', 'auth', 'quiz', 'community', 'subscription', 'backend'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* File Tree List */}
          <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = file.path === activeFile.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-bold'
                      : 'hover:bg-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-slate-800 text-slate-400 rounded shrink-0">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code View Area */}
        <div className="md:col-span-8 bg-slate-900 flex flex-col">
          {/* File Tab Info */}
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" /> {activeFile.path}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Language: {activeFile.language.toUpperCase()} | Category: {activeFile.category}
            </span>
          </div>

          {/* Editor/Code Viewer */}
          <div className="p-4 overflow-auto max-h-[500px] font-mono text-xs leading-relaxed text-slate-200 selection:bg-emerald-700 selection:text-white">
            <pre>
              <code>{activeFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
