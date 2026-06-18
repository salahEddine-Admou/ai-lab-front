import { useState } from 'react';
import { stationsApi } from '../../api/stationsApi';

export default function AtelierMarketing() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await stationsApi.station5.campaign(prompt, file);
      setResult(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-orange-500">L'Incubateur Express (Atelier Marketing)</h1>
          <p className="text-neutral-400 mt-2">Créez votre campagne sociale en français et en darija avec un poster généré.</p>
        </header>

        {!result && (
          <section className="border border-neutral-800 rounded-3xl p-8 max-w-2xl mx-auto bg-neutral-900/50 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Décrivez votre produit</label>
              <textarea
                className="w-full bg-black border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: Huile d'argan bio d'une coopérative à Tiznit"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div>
               <label className="block text-sm font-semibold mb-2">Photo de référence (Optionnel)</label>
               <input
                 type="file"
                 accept="image/*"
                 onChange={(e) => setFile(e.target.files?.[0])}
                 className="block w-full text-sm text-neutral-400
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-xl file:border-0
                   file:text-sm file:font-bold
                   file:bg-neutral-800 file:text-white
                   hover:file:bg-neutral-700 transition-colors"
               />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="mt-6 w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {loading ? 'Génération de la campagne...' : 'Créer ma campagne'}
            </button>
          </section>
        )}

        {result && (
          <div className="space-y-8 mt-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Facebook */}
                <div className="border border-blue-600/50 rounded-3xl p-6 bg-blue-900/10">
                  <h3 className="text-xl font-bold text-blue-500 mb-4 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{result.captions?.facebook}</p>
                </div>
                
                {/* Instagram */}
                <div className="border border-pink-600/50 rounded-3xl p-6 bg-pink-900/10">
                  <h3 className="text-xl font-bold text-pink-500 mb-4 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    Instagram
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{result.captions?.instagram}</p>
                </div>

                {/* LinkedIn */}
                <div className="border border-cyan-600/50 rounded-3xl p-6 bg-cyan-900/10">
                  <h3 className="text-xl font-bold text-cyan-500 mb-4 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{result.captions?.linkedin}</p>
                </div>
             </div>

             <div className="border border-neutral-800 rounded-3xl p-8 bg-neutral-900/50 flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                 <h3 className="text-2xl font-bold text-orange-400 mb-4">Poster Généré</h3>
                 <p className="text-sm text-neutral-400 mb-6">Un poster carré, prêt à être téléchargé et publié sur vos réseaux sociaux pour accompagner ces textes.</p>
                 <button className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-neutral-200 transition-colors" onClick={() => window.print()}>
                    Imprimer la campagne
                 </button>
               </div>
               <div className="w-64 h-64 bg-black rounded-xl border-2 border-dashed border-neutral-700 flex items-center justify-center p-2 overflow-hidden shrink-0">
                  {result.posterUrl ? (
                    <img src={result.posterUrl} alt="Poster" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-neutral-500">Pas d'image</span>
                  )}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
