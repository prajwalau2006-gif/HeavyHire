import React, { useState } from "react";
import {
  Smartphone,
  Copy,
  Check,
  Download,
  FileCode,
} from "lucide-react";
import { kotlinProjectFiles, KotlinFile } from "../kotlinSourceCode";

export const KotlinSourceViewer: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [selectedFilename, setSelectedFilename] = useState<string>("MainActivity.kt");
  const [copied, setCopied] = useState(false);

  const currentFile: KotlinFile =
    kotlinProjectFiles.find((f) => f.filename === selectedFilename) || kotlinProjectFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([currentFile.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = currentFile.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      id="kotlin-source-viewer"
      className="rounded-3xl border shadow-2xl overflow-hidden transition-all bg-[#111111] border-white/10 text-gray-100"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap bg-[#161616]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold border border-amber-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono">
                Android Jetpack Compose MVVM Architecture
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                KOTLIN 2.0 • MATERIAL 3
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Complete production architecture ready to compile in Android Studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Kotlin Code"}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download {currentFile.filename}</span>
          </button>
        </div>
      </div>

      {/* Main File Selector + Code Box */}
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* Left Sidebar of Kotlin Files */}
        <div className="p-3 space-y-1 overflow-y-auto max-h-[550px] bg-[#0c0c0c]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 px-2 block mb-1.5">
            Source Modules & Screens
          </span>
          {kotlinProjectFiles.map((file) => {
            const isSelected = selectedFilename === file.filename;
            return (
              <button
                key={file.filename}
                onClick={() => setSelectedFilename(file.filename)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? "bg-amber-500 text-black shadow-md font-extrabold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <div className="truncate">
                  <span className="block truncate font-mono">{file.filename}</span>
                  <span className="text-[9px] opacity-70 block font-normal">{file.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Code Content Area */}
        <div className="lg:col-span-3 p-4 bg-[#0a0a0a] text-gray-200 font-mono text-xs overflow-x-auto max-h-[550px]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-[11px] text-gray-400 font-mono">
            <span>{currentFile.filename} — {currentFile.description}</span>
            <span className="text-amber-500">Kotlin / Compose</span>
          </div>
          <pre className="leading-relaxed whitespace-pre font-mono selection:bg-amber-500 selection:text-black">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
