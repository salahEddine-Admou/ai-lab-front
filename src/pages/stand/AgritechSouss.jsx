import { useState } from 'react';
import { stationsApi } from '../../api/stationsApi';

export default function AgritechSouss() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await stationsApi.station3.analyze(file);
      setResult(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-green-500">Agritech Souss</h1>
          <p className="text-neutral-400 mt-2">Analysez une feuille et obtenez un diagnostic et un plan d'irrigation.</p>
        </header>

        {!result && (
          <section className="border border-neutral-800 rounded-3xl p-8 bg-neutral-900/50 text-center">
             <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-green-500">
                  <path d="M12 22C12 22 4 15 4 8C4 3 12 2 12 2C12 2 20 3 20 8C20 15 12 22 12 22Z" />
                  <path d="M12 22V12" stroke="#22c55e" />
                </svg>
             </div>
             
             <h2 className="text-2xl font-semibold mb-2">Simulateur de Scan Box</h2>
             <p className="text-neutral-400 mb-8 text-sm">Prenez une photo de votre plante ou téléchargez une image.</p>
             
             <input
               type="file"
               accept="image/*"
               onChange={(e) => setFile(e.target.files?.[0])}
               className="block w-full max-w-sm mx-auto text-sm text-neutral-400
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-xl file:border-0
                 file:text-sm file:font-bold
                 file:bg-green-600 file:text-white
                 hover:file:bg-green-500 transition-colors"
             />

             <button
               onClick={handleAnalyze}
               disabled={loading || !file}
               className="mt-8 w-full max-w-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
             >
               {loading ? 'Analyse IA en cours...' : 'Lancer le diagnostic'}
             </button>
          </section>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Diagnosis */}
            <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50 space-y-6">
              <div className="flex items-center gap-4 border-b border-neutral-800 pb-4">
                <div className={`text-2xl font-bold ${result.diagnosis?.confidence > 90 ? 'text-green-500' : 'text-orange-500'}`}>
                   {result.diagnosis?.confidence}%
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white">{result.diagnosis?.name}</h3>
                   <p className="text-sm text-neutral-400">Fiabilité de l'IA</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Symptômes identifiés</h4>
                <p className="text-neutral-300 text-sm leading-relaxed">{result.diagnosis?.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-green-400 mb-2">Traitement recommandé</h4>
                <p className="text-neutral-300 text-sm leading-relaxed">{result.treatment}</p>
              </div>

              <div>
                <h4 className="font-semibold text-green-400 mb-2">Produits locaux suggérés</h4>
                <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                  {result.localProducts?.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Irrigation & Print */}
            <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50 flex flex-col">
               <h3 className="text-xl font-bold text-green-500 mb-4">Plan d'irrigation (7 jours)</h3>
               <div className="bg-black border border-neutral-800 rounded-xl p-4 text-sm text-neutral-300 leading-relaxed mb-6">
                  {result.irrigationPlan}
               </div>

               <div className="mt-auto pt-4 border-t border-neutral-800">
                 <button className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-neutral-200 transition-colors" onClick={() => window.print()}>
                  Imprimer l'ordonnance + QR Code
                </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
