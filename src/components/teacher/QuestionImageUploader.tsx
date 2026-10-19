import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Link,
  X,
  Maximize2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface QuestionImageUploaderProps {
  imageUrl?: string;
  imageCaption?: string;
  onImageChange: (url: string | undefined, caption?: string) => void;
}

// Preset mathematical SVG diagrams that teachers can instantly use
const SAMPLE_PRESETS: {
  title: string;
  desc: string;
  svgDataUri: string;
}[] = [
  {
    title: 'Grafik DHP 2x + 3y ≤ 12 (Kuadran I)',
    desc: 'Garis batas (6,0) & (0,4) dengan arsiran DHP ke arah (0,0)',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.7"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  
  <!-- DHP Poligon -->
  <polygon points="60,240 60,120 240,240" fill="rgba(16, 185, 129, 0.25)" stroke="#059669" stroke-width="1.5"/>
  <text x="110" y="200" fill="#047857" font-family="sans-serif" font-size="14" font-weight="bold">DHP</text>
  
  <!-- Axes -->
  <line x1="40" y1="240" x2="360" y2="240" stroke="#334155" stroke-width="2"/>
  <polygon points="365,240 355,235 355,245" fill="#334155"/>
  <text x="365" y="255" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">X</text>
  
  <line x1="60" y1="260" x2="60" y2="40" stroke="#334155" stroke-width="2"/>
  <polygon points="60,35 55,45 65,45" fill="#334155"/>
  <text x="45" y="40" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">Y</text>
  
  <!-- Points -->
  <circle cx="60" cy="240" r="4" fill="#0f172a"/>
  <text x="45" y="255" fill="#64748b" font-family="sans-serif" font-size="11">O(0,0)</text>
  
  <circle cx="240" cy="240" r="4" fill="#dc2626"/>
  <text x="230" y="258" fill="#dc2626" font-family="sans-serif" font-size="12" font-weight="bold">(6, 0)</text>
  
  <circle cx="60" cy="120" r="4" fill="#dc2626"/>
  <text x="15" y="125" fill="#dc2626" font-family="sans-serif" font-size="12" font-weight="bold">(0, 4)</text>
  
  <!-- Line Equation -->
  <line x1="30" y1="100" x2="270" y2="260" stroke="#059669" stroke-width="2.5"/>
  <text x="180" y="140" fill="#065f46" font-family="sans-serif" font-size="12" font-weight="bold" transform="rotate(33 180,140)">2x + 3y = 12</text>
</svg>
    `)}`,
  },
  {
    title: 'Bidang Cartesius Empat Kuadran Bersih',
    desc: 'Sumbu X dan Y dengan skala angka -5 sampai +5',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 300" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <defs>
    <pattern id="cartgrid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#cartgrid)"/>
  
  <!-- Axes -->
  <line x1="20" y1="150" x2="330" y2="150" stroke="#475569" stroke-width="2"/>
  <line x1="175" y1="280" x2="175" y2="20" stroke="#475569" stroke-width="2"/>
  
  <polygon points="335,150 325,145 325,155" fill="#475569"/>
  <polygon points="175,15 170,25 180,25" fill="#475569"/>
  
  <text x="330" y="170" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">X</text>
  <text x="160" y="25" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold">Y</text>
  
  <!-- Point A (2, 3) -->
  <circle cx="225" cy="75" r="5" fill="#2563eb"/>
  <line x1="225" y1="150" x2="225" y2="75" stroke="#93c5fd" stroke-dasharray="3,3"/>
  <line x1="175" y1="75" x2="225" y2="75" stroke="#93c5fd" stroke-dasharray="3,3"/>
  <text x="235" y="70" fill="#1d4ed8" font-family="sans-serif" font-size="12" font-weight="bold">Titik P(2, 3)</text>
  
  <text x="160" y="165" fill="#64748b" font-family="sans-serif" font-size="11">O(0,0)</text>
</svg>
    `)}`,
  },
  {
    title: 'Segitiga Siku-Siku & Garis Tinggi',
    desc: 'Visualisasi geometri untuk dalil Pythagoras & trigonometri',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 250" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <!-- Triangle -->
  <polygon points="50,200 280,200 50,50" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5"/>
  <!-- Right angle mark -->
  <rect x="50" y="180" width="20" height="20" fill="none" stroke="#0369a1" stroke-width="1.5"/>
  
  <text x="35" y="215" fill="#0369a1" font-family="sans-serif" font-size="14" font-weight="bold">A</text>
  <text x="290" y="215" fill="#0369a1" font-family="sans-serif" font-size="14" font-weight="bold">B</text>
  <text x="40" y="45" fill="#0369a1" font-family="sans-serif" font-size="14" font-weight="bold">C</text>
  
  <text x="150" y="225" fill="#475569" font-family="sans-serif" font-size="12">alas = a</text>
  <text x="15" y="130" fill="#475569" font-family="sans-serif" font-size="12" transform="rotate(-90 15,130)">tinggi = t</text>
  <text x="175" y="115" fill="#0369a1" font-family="sans-serif" font-size="12" font-weight="bold" transform="rotate(33 175,115)">sisi miring (hipotenusa)</text>
</svg>
    `)}`,
  },
];

export const QuestionImageUploader: React.FC<QuestionImageUploaderProps> = ({
  imageUrl,
  imageCaption,
  onImageChange,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>(imageCaption || '');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal caption if parent changes
  React.useEffect(() => {
    setCaption(imageCaption || '');
  }, [imageCaption]);

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);

    // Validate type
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'image/gif',
    ];
    if (!validTypes.includes(file.type)) {
      setErrorMsg(
        'Format berkas tidak didukung. Harap pilih gambar bertipe PNG, JPG, JPEG, WEBP, SVG, atau GIF.'
      );
      return;
    }

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran berkas melebihi 5 MB. Harap gunakan gambar yang lebih ringkas.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result, caption);
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    setErrorMsg(null);
    if (!inputUrl.trim()) {
      setErrorMsg('Harap masukkan tautan URL gambar yang valid.');
      return;
    }
    onImageChange(inputUrl.trim(), caption);
    setInputUrl('');
  };

  const handleApplyPreset = (svgData: string, presetTitle: string) => {
    onImageChange(svgData, caption || presetTitle);
  };

  const handleRemoveImage = () => {
    onImageChange(undefined, undefined);
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    onImageChange(imageUrl, val);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
      {/* Title & Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <ImageIcon size={14} />
          </div>
          <div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
              <span>Lampiran Gambar Soal (Ilustrasi / Grafik / Diagram)</span>
              {imageUrl && (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  Terlampir
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Format umum: PNG, JPG, JPEG, WEBP, SVG, GIF (Maks. 5 MB).
            </p>
          </div>
        </div>

        {imageUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold cursor-pointer transition"
          >
            <Trash2 size={12} />
            <span>Hapus Gambar</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-2.5 flex items-center gap-2 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* When Image is Loaded: Show Preview & Caption Editor */}
      {imageUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white p-2.5 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group max-w-[260px] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[140px]">
              <img
                src={imageUrl}
                alt={caption || 'Ilustrasi Soal'}
                className="max-h-[160px] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-1 text-xs font-semibold transition cursor-pointer backdrop-blur-[1px]"
              >
                <Maximize2 size={16} />
                <span>Perbesar</span>
              </button>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Keterangan / Judul Gambar (Ditampilkan di bawah ilustrasi)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  placeholder="Contoh: Gambar 1. Daerah Himpunan Penyelesaian Sistem Pertidaksamaan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                <span>Gambar siap dirender pada lembar asesmen siswa dan kunci telaah.</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    Ganti Gambar...
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* When No Image: Show Upload / URL / Presets Box */
        <div className="space-y-3">
          {/* Method tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Upload size={13} />
              <span>Unggah Berkas Gambar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Link size={13} />
              <span>Tautan URL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles size={13} />
              <span>Preset Diagram Matematika</span>
            </button>
          </div>

          {/* Tab 1: Upload Dropzone */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-slate-300 bg-white hover:border-emerald-500 hover:bg-slate-50/60'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Upload size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Tarik & lepas gambar ke kotak ini, atau <span className="text-emerald-700 underline">pilih dari perangkat</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Dukungan format: PNG, JPG, JPEG, WEBP, SVG, GIF (Maks. 5 MB)
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Direct URL */}
          {activeTab === 'url' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Masukkan URL Tautan Gambar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/diagram-matematika.png..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Terapkan
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Pastikan tautan dapat diakses secara publik dan menggunakan protokol HTTPS.
              </p>
            </div>
          )}

          {/* Tab 3: Presets */}
          {activeTab === 'presets' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
              <div className="text-[11px] font-semibold text-slate-600">
                Pilih diagram matematika vektor siap pakai untuk soal Anda:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_PRESETS.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplyPreset(p.svgDataUri, p.title)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer flex flex-col space-y-1.5"
                  >
                    <div className="h-24 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center p-1">
                      <img src={p.svgDataUri} alt={p.title} className="h-full object-contain" />
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-tight">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2">
                      {p.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Zoom / Lightbox Modal */}
      {isZoomOpen && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="font-bold text-slate-900 text-sm sm:text-base">
                {caption || 'Pratinjau Gambar Soal'}
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-center p-2 bg-slate-50 rounded-2xl max-h-[70vh] overflow-auto">
              <img
                src={imageUrl}
                alt={caption || 'Gambar Soal'}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
