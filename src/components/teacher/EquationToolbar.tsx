import React, { useState } from 'react';
import { LatexRenderer } from '../common/LatexRenderer';
import {
  Code,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  PlusCircle,
  Eye,
} from 'lucide-react';

interface EquationToolbarProps {
  onInsert: (latexSnippet: string, wrapInMath?: boolean) => void;
  targetFieldName?: string;
}

interface FormulaItem {
  label: string;
  latex: string;
  previewLatex?: string;
  desc?: string;
}

const CATEGORIES: {
  id: string;
  name: string;
  items: FormulaItem[];
}[] = [
  {
    id: 'basic',
    name: 'Aljabar & Pecahan',
    items: [
      { label: 'Pecahan', latex: '\\frac{a}{b}', desc: 'Pecahan biasa' },
      { label: 'Pangkat 2', latex: 'x^{2}', desc: 'Kuadrat' },
      { label: 'Pangkat n', latex: 'x^{n}', desc: 'Eksponen' },
      { label: 'Indeks/Subskrip', latex: 'x_{1}', desc: 'Subskrip' },
      { label: 'Subskrip i', latex: 'x_{i}', desc: 'Indeks umum' },
      { label: 'Plus-Minus', latex: '\\pm', desc: 'Tanda ±' },
      { label: 'Kali', latex: '\\times', desc: 'Simbol kali ×' },
      { label: 'Bagi', latex: '\\div', desc: 'Simbol bagi ÷' },
      { label: 'Titik Kali', latex: '\\cdot', desc: 'Dot product / perkalian' },
      { label: 'Nilai Mutlak', latex: '|x|', desc: 'Nilai mutlak' },
      { label: 'Rumus ABC', latex: 'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', desc: 'Akar kuadrat ABC' },
    ],
  },
  {
    id: 'inequalities',
    name: 'Relasi & Pertidaksamaan',
    items: [
      { label: '≤ (Kurang dari sama)', latex: '\\le', desc: 'Lebih kecil atau sama dengan' },
      { label: '≥ (Lebih dari sama)', latex: '\\ge', desc: 'Lebih besar atau sama dengan' },
      { label: '≠ (Tidak sama)', latex: '\\neq', desc: 'Tidak sama dengan' },
      { label: '< (Kurang dari)', latex: '<', desc: 'Kurang dari murni' },
      { label: '> (Lebih dari)', latex: '>', desc: 'Lebih dari murni' },
      { label: '≈ (Mendekati)', latex: '\\approx', desc: 'Hampir sama dengan' },
      { label: '∈ (Elemen)', latex: '\\in', desc: 'Anggota himpunan' },
      { label: '∉ (Bukan Elemen)', latex: '\\notin', desc: 'Bukan anggota' },
      { label: '⊂ (Himpunan Bagian)', latex: '\\subset', desc: 'Subset' },
      { label: '∪ (Gabungan)', latex: '\\cup', desc: 'Union' },
      { label: '∩ (Irisan)', latex: '\\cap', desc: 'Intersection' },
      { label: '∅ (Himpunan Kosong)', latex: '\\emptyset', desc: 'Empty set' },
    ],
  },
  {
    id: 'systems',
    name: 'Sistem & Matriks',
    items: [
      {
        label: 'SPLDV (Sistem 2 Persamaan)',
        latex: '\\begin{cases} 2x + y = 10 \\\\ x - y = 2 \\end{cases}',
        desc: 'Sistem Persamaan Linear Dua Variabel',
      },
      {
        label: 'SPTLDV (Program Linear DHP)',
        latex: '\\begin{cases} 2x + 3y \\le 12 \\\\ x + 2y \\le 8 \\\\ x \\ge 0,\\, y \\ge 0 \\end{cases}',
        desc: 'Sistem Pertidaksamaan Linear & Syarat Non-Negatif',
      },
      {
        label: 'Matriks 2x2',
        latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        desc: 'Matriks ordo 2x2',
      },
      {
        label: 'Determinan 2x2',
        latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
        desc: 'Garis determinan matriks',
      },
      {
        label: 'Vektor Kolom',
        latex: '\\begin{pmatrix} x \\\\ y \\end{pmatrix}',
        desc: 'Vektor kolom 2D',
      },
      {
        label: 'Titik Koordinat',
        latex: '(x_1, y_1)',
        desc: 'Pasangan berurutan Cartesius',
      },
    ],
  },
  {
    id: 'roots_trig',
    name: 'Akar, Log & Geometri',
    items: [
      { label: 'Akar Kuadrat', latex: '\\sqrt{x}', desc: 'Akar pangkat 2' },
      { label: 'Akar Pangkat n', latex: '\\sqrt[n]{x}', desc: 'Akar berderajat n' },
      { label: 'Logaritma Basis a', latex: '\\log_{a}(b)', desc: 'Logaritma a log b' },
      { label: 'Log Natural', latex: '\\ln(x)', desc: 'Natural logarithm' },
      { label: 'Sudut', latex: '\\angle ABC', desc: 'Notasi sudut' },
      { label: 'Segitiga', latex: '\\Delta ABC', desc: 'Notasi segitiga' },
      { label: 'Tegak Lurus', latex: '\\perp', desc: 'Tegak lurus' },
      { label: 'Sejajar', latex: '\\parallel', desc: 'Sejajar' },
      { label: 'Derajat', latex: '45^\\circ', desc: 'Satuan sudut derajat' },
      { label: 'Sinus', latex: '\\sin(\\theta)', desc: 'Trigonometri sin' },
      { label: 'Cosinus', latex: '\\cos(\\theta)', desc: 'Trigonometri cos' },
      { label: 'Tangen', latex: '\\tan(\\theta)', desc: 'Trigonometri tan' },
    ],
  },
  {
    id: 'greek',
    name: 'Huruf Yunani & Simbol',
    items: [
      { label: 'α (alpha)', latex: '\\alpha' },
      { label: 'β (beta)', latex: '\\beta' },
      { label: 'γ (gamma)', latex: '\\gamma' },
      { label: 'θ (theta)', latex: '\\theta' },
      { label: 'λ (lambda)', latex: '\\lambda' },
      { label: 'μ (mu)', latex: '\\mu' },
      { label: 'π (pi)', latex: '\\pi' },
      { label: 'σ (sigma)', latex: '\\sigma' },
      { label: 'Δ (Delta besar)', latex: '\\Delta' },
      { label: 'Ω (Omega)', latex: '\\Omega' },
      { label: '∞ (Tak hingga)', latex: '\\infty' },
      { label: '∴ (Oleh karena itu)', latex: '\\therefore' },
      { label: '⇒ (Maka/Implikasi)', latex: '\\Rightarrow' },
      { label: '⇔ (Jika dan hanya jika)', latex: '\\Leftrightarrow' },
    ],
  },
  {
    id: 'calculus',
    name: 'Kalkulus & Lanjutan',
    items: [
      { label: 'Limit', latex: '\\lim_{x \\to 0} f(x)', desc: 'Limit fungsi' },
      { label: 'Turunan dy/dx', latex: '\\frac{dy}{dx}', desc: 'Turunan pertama' },
      { label: 'Turunan f\'(x)', latex: 'f\'(x)', desc: 'Aksen turunan' },
      { label: 'Integral Tak Tentu', latex: '\\int f(x)\\,dx', desc: 'Integral tak tentu' },
      { label: 'Integral Tentu', latex: '\\int_{a}^{b} f(x)\\,dx', desc: 'Integral dengan batas' },
      { label: 'Notasi Sigma', latex: '\\sum_{i=1}^{n} x_i', desc: 'Penjumlahan sigma' },
      { label: 'Notasi Perkalian', latex: '\\prod_{i=1}^{n} a_i', desc: 'Perkalian beruntun' },
    ],
  },
];

export const EquationToolbar: React.FC<EquationToolbarProps> = ({
  onInsert,
  targetFieldName = 'Teks Soal',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('basic');
  const [wrapMode, setWrapMode] = useState<'inline' | 'block' | 'raw'>('inline');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showSandbox, setShowSandbox] = useState<boolean>(false);
  const [customFormula, setCustomFormula] = useState<string>('\\frac{2x + 1}{3} \\le 5');
  const [copiedLatex, setCopiedLatex] = useState<string | null>(null);

  const handleInsertSnippet = (snippet: string) => {
    let textToInsert = snippet;
    if (wrapMode === 'inline') {
      textToInsert = `$${snippet}$`;
    } else if (wrapMode === 'block') {
      textToInsert = `\n$$${snippet}$$\n`;
    }
    onInsert(textToInsert, wrapMode !== 'raw');
  };

  const handleCopy = (latex: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedLatex(latex);
    setTimeout(() => setCopiedLatex(null), 1500);
  };

  const currentCategoryObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 text-xs space-y-3">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <span className="font-serif italic text-sm">∑</span>
          </div>
          <div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
              <span>Equation & LaTeX Toolbar</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.2 rounded-full">
                Target: {targetFieldName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Klik simbol atau rumus untuk langsung menyisipkan ke kolom input.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setWrapMode('inline')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                wrapMode === 'inline'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Sisipkan di dalam kalimat: $rumus$"
            >
              Inline ($)
            </button>
            <button
              type="button"
              onClick={() => setWrapMode('block')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                wrapMode === 'block'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Sisipkan baris baru terpusat: $$rumus$$"
            >
              Display ($$)
            </button>
            <button
              type="button"
              onClick={() => setWrapMode('raw')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                wrapMode === 'raw'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tanpa tanda dollar: rumus"
            >
              Polos
            </button>
          </div>

          {/* Sandbox Toggle */}
          <button
            type="button"
            onClick={() => setShowSandbox(!showSandbox)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
              showSandbox
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Buka kanvas uji coba rumus LaTeX bebas"
          >
            <Eye size={12} />
            <span className="hidden sm:inline">Uji Rumus</span>
          </button>

          {/* Minimize / Expand */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 cursor-pointer"
            title={isExpanded ? 'Sembunyikan' : 'Buka'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items Palette Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
            {currentCategoryObj.items.map((item, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col items-center justify-center p-2 rounded-lg border border-slate-100 hover:border-emerald-400 hover:bg-emerald-50/40 transition text-center cursor-pointer bg-slate-50/50"
                onClick={() => handleInsertSnippet(item.latex)}
                title={`${item.label} (${item.latex}) - Klik untuk sisipkan`}
              >
                <div className="text-sm font-serif font-medium text-slate-900 min-h-[28px] flex items-center justify-center pointer-events-none">
                  <LatexRenderer text={`$${item.previewLatex || item.latex}$`} />
                </div>
                <span className="text-[10px] text-slate-500 truncate w-full pt-1 font-sans">
                  {item.label}
                </span>

                {/* Quick copy overlay icon on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item.latex);
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 transition"
                  title="Salin kode LaTeX"
                >
                  {copiedLatex === item.latex ? (
                    <Check size={11} className="text-emerald-600" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Quick Common Equations for Math Teachers */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Preset Siap Pakai:</span>
            <button
              type="button"
              onClick={() => handleInsertSnippet('2x + 3y \\le 12')}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-mono transition cursor-pointer"
            >
              $2x + 3y \le 12$
            </button>
            <button
              type="button"
              onClick={() => handleInsertSnippet('x \\ge 0,\\, y \\ge 0')}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-mono transition cursor-pointer"
            >
              $x \ge 0, y \ge 0$
            </button>
            <button
              type="button"
              onClick={() => handleInsertSnippet('(x_0, y_0) = (0, 4)')}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-mono transition cursor-pointer"
            >
              $(0, 4)$
            </button>
            <button
              type="button"
              onClick={() => handleInsertSnippet('Z = 500x + 800y')}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-mono transition cursor-pointer"
            >
              $Z = 500x + 800y$
            </button>
            <button
              type="button"
              onClick={() => handleInsertSnippet('\\frac{3}{4}')}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-mono transition cursor-pointer"
            >
              $\frac{3}{4}$
            </button>
          </div>

          {/* Interactive Formula Sandbox Drawer */}
          {showSandbox && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Eye size={13} className="text-amber-700" />
                  Kanvas Uji Coba Rumus LaTeX
                </span>
                <span className="text-[10px] text-amber-800 font-normal">
                  Ketik rumus LaTeX di bawah untuk melihat hasil rendering seketika
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <textarea
                    rows={2}
                    value={customFormula}
                    onChange={(e) => setCustomFormula(e.target.value)}
                    placeholder="Contoh: \frac{a+b}{c} atau \sqrt{x^2+y^2}..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-mono text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400">
                      Format KaTeX standar didukung penuh
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet(customFormula)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer"
                    >
                      <PlusCircle size={12} />
                      <span>Sisipkan ke {targetFieldName}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-amber-200 flex flex-col items-center justify-center min-h-[64px] text-center overflow-x-auto">
                  <span className="text-[10px] text-slate-400 mb-1 font-sans">
                    Hasil Pratinjau:
                  </span>
                  <div className="text-base text-slate-900 font-serif">
                    <LatexRenderer text={`$$${customFormula}$$`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
