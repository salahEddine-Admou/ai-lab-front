import { useState } from 'react';
import { stationsApi } from '../../api/stationsApi';

export default function StudioEntrepreneur() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await stationsApi.station1.generate(idea);
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
          <h1 className="text-4xl font-bold text-orange-500">Le Studio Créatif</h1>
          <p className="text-neutral-400 mt-2">Votre plan d'affaires, logo et risques en 2 minutes.</p>
        </header>

        {!result && (
          <section className="border border-neutral-800 rounded-3xl p-8 max-w-2xl mx-auto bg-neutral-900/50">
            <h2 className="text-2xl font-semibold mb-4">Quelle est votre idée ?</h2>
            <textarea
              className="w-full bg-black border border-neutral-700 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
              rows={4}
              placeholder="Ex: Je veux vendre de l'huile d'argan bio à Tiznit"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !idea.trim()}
              className="mt-6 w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {loading ? 'Génération en cours...' : 'Démarrer le Studio'}
            </button>
          </section>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Column 1: Business Plan */}
            <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Plan d'affaires</h3>
              <div className="space-y-4 text-sm text-neutral-300">
                <div>
                  <strong className="block text-white">Marché Cible</strong>
                  {result.businessPlan?.targetMarket}
                </div>
                <div>
                  <strong className="block text-white">Prix Unitaire Estimé</strong>
                  {result.businessPlan?.unitPrice}
                </div>
                <div>
                  <strong className="block text-white">Chiffre d'affaires mensuel</strong>
                  {result.businessPlan?.monthlyRevenue}
                </div>
                <div>
                  <strong className="block text-white">Coût de lancement</strong>
                  {result.businessPlan?.startupCost}
                </div>
              </div>
            </div>

            {/* Column 2: Logos */}
            <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Choix du Logo</h3>
              <div className="grid grid-cols-1 gap-4">
                {result.logos?.map((logo, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all">
                    <img src={logo} alt={`Logo ${i+1}`} className="h-24 object-contain" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Risks */}
            <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50 relative">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Score de Viabilité</h3>
              <div className="text-5xl font-extrabold text-white text-center mb-6">
                {result.viabilityScore}<span className="text-2xl text-neutral-500">/10</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Risques principaux :</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300">
                {result.risks?.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
              <div className="absolute bottom-6 left-6 right-6">
                 <button className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-neutral-200 transition-colors" onClick={() => window.print()}>
                  Imprimer le dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
