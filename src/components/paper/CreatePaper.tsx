import { useState } from "react";
import { Sparkles, FileText, LayoutDashboard, ArrowLeft, Send } from "lucide-react";

export function CreatePaper({ onBack, onSave }: { onBack: () => void, onSave: (paper: {title: string, content: string}) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleAIGenerate = () => {
    if (!title) return;
    setGenerating(true);
    setTimeout(() => {
      setContent(
        `# ${title}\n\n## Abstract\nThis paper explores the novel approaches regarding ${title}. We propose a new methodology that significantly improves over existing baselines and pushes the state of the art forward.\n\n## 1. Introduction\nRecent advancements have shown that scaling laws apply to ${title}, making it an exciting area of study. This research bridges the gap between theoretical frameworks and practical applications.\n\n## 2. Methodology\nWe structured our research around a comprehensive analysis of the core variables. By employing a mixed-methods approach, we were able to isolate the factors contributing to performance bottlenecks.\n\n## 3. Results\nOur findings indicate a 40% improvement in overall efficiency compared to the baseline models. The empirical data supports our initial hypothesis.\n\n## 4. Conclusion\nIn conclusion, ${title} presents a promising frontier for future research. Our work establishes a strong foundation for subsequent studies in this domain.`
      );
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="glass-card p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <FileText className="size-6 text-accent" />
          Create New Research Paper
        </h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Paper Topic / Prompt</label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The impact of sparse routing in large language models..."
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-foreground">Content Draft</label>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={!title || generating}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
            >
              <Sparkles className="size-3.5" /> {generating ? "Generating..." : "AI Auto-Write"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your research paper content here, or use the AI to generate a draft..."
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[300px] resize-y focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <button onClick={onBack} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
            Cancel
          </button>
          <button 
            disabled={!title || !content}
            onClick={() => onSave({ title, content })}
            className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
          >
            <Send className="size-4" /> Save Paper
          </button>
        </div>
      </div>
    </div>
  );
}
