import { useState } from 'react';
import { stationsApi } from '../../api/stationsApi';

export default function VoixDuClient() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim() && !file) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await stationsApi.station6.analyze({ text, file });
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
          <h1 className="text-4xl font-bold text-purple-500">Le Hub Client Intelligent (Voix du Client)</h1>
          <p className="text-neutral-400 mt-2">Analysez vos avis clients en un instant et obtenez des brouillons de réponses.</p>
        </header>

        {!result && (
          <section className="border border-neutral-800 rounded-3xl p-8 max-w-2xl mx-auto bg-neutral-900/50 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Dictez ou collez un avis client</label>
              <textarea
                className="w-full bg-black border border-neutral-700 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Ex: Le service était très lent hier soir..."
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            
            <div className="relative flex items-center py-2">
               <div className="flex-grow border-t border-neutral-800"></div>
               <span className="flex-shrink-0 mx-4 text-neutral-500 text-sm">OU</span>
               <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            <div>
               <label className="block text-sm font-semibold mb-2">Uploader un fichier CSV d'avis</label>
               <input
                 type="file"
                 accept=".csv"
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
              onClick={handleAnalyze}
              disabled={loading || (!text.trim() && !file)}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {loading ? 'Analyse en cours...' : 'Lancer l\'analyse'}
            </button>
          </section>
        )}

        {result && (
          <div className="space-y-8 mt-8">
            {/* Top Cards: Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50 text-center">
                 <h3 className="text-sm font-semibold text-neutral-400 mb-4">Répartition des Sentiments</h3>
                 <div className="flex h-4 rounded-full overflow-hidden mb-4">
                   <div style={{ width: (result.summary?.positivePercent || 0) + '%' }} className="bg-green-500"></div>
                   <div style={{ width: (result.summary?.neutralPercent || 0) + '%' }} className="bg-yellow-500"></div>
                   <div style={{ width: (result.summary?.negativePercent || 0) + '%' }} className="bg-red-500"></div>
                 </div>
                 <div className="flex justify-between text-xs font-bold">
                   <span className="text-green-500">{result.summary?.positivePercent}% Pos</span>
                   <span className="text-yellow-500">{result.summary?.neutralPercent}% Neu</span>
                   <span className="text-red-500">{result.summary?.negativePercent}% Nég</span>
                 </div>
              </div>

              <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50">
                 <h3 className="text-sm font-semibold text-neutral-400 mb-4">Top 3 des Thèmes</h3>
                 <ul className="space-y-2">
                   {result.summary?.topThemes?.map((theme, i) => (
                     <li key={i} className="bg-black text-purple-400 px-3 py-2 rounded-lg text-sm font-semibold border border-purple-900/30">
                       #{i+1} {theme}
                     </li>
                   ))}
                 </ul>
              </div>

              <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50 text-center flex flex-col items-center justify-center">
                 <h3 className="text-sm font-semibold text-neutral-400 mb-2">Urgences à traiter</h3>
                 <div className="text-6xl font-extrabold text-red-500">
                   {result.summary?.urgentCount}
                 </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-purple-500">Détail des Avis</h3>
                 <button className="bg-white text-black font-bold py-2 px-4 rounded-xl hover:bg-neutral-200 transition-colors text-sm" onClick={() => window.print()}>
                    Exporter (PDF)
                 </button>
              </div>
              
              <div className="space-y-4">
                 {result.reviews?.map((review, i) => (
                   <div key={i} className="bg-black border border-neutral-800 p-5 rounded-2xl">
                     <div className="flex justify-between items-start gap-4">
                       <p className="text-neutral-300 flex-1 leading-relaxed">"{review.text}"</p>
                       <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                         review.sentiment === 'positif' ? 'bg-green-500/20 text-green-500' :
                         review.sentiment === 'negatif' ? 'bg-red-500/20 text-red-500' :
                         'bg-yellow-500/20 text-yellow-500'
                       }`}>
                         {review.sentiment.toUpperCase()}
                       </span>
                     </div>
                     
                     {review.replyDraft && (
                       <div className="mt-4 bg-purple-900/20 border border-purple-900/50 p-4 rounded-xl">
                         <h4 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">Suggestion de réponse</h4>
                         <p className="text-sm text-purple-200">{review.replyDraft}</p>
                       </div>
                     )}
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
