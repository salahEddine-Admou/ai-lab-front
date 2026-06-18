import { useState } from 'react';
import { stationsApi } from '../../api/stationsApi';

export default function CapTourisme() {
  const [form, setForm] = useState({ city: '', days: 3, nationality: '', language: 'fr' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!form.city) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await stationsApi.station2.itinerary(form);
      setResult(data);
      
      // Play audio welcome message
      if (data.welcomeMessage && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.welcomeMessage);
        utterance.lang = form.language;
        window.speechSynthesis.speak(utterance);
      }
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
          <h1 className="text-4xl font-bold text-orange-500">Le Portail Immersif (Cap Tourisme)</h1>
          <p className="text-neutral-400 mt-2">Votre itinéraire sur mesure avec message vocal de bienvenue.</p>
        </header>

        {!result && (
          <section className="border border-neutral-800 rounded-3xl p-8 max-w-2xl mx-auto bg-neutral-900/50 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Ville de départ</label>
              <input
                className="w-full bg-black border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: Agadir, Marrakech..."
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Durée (Jours)</label>
                <input
                  type="number"
                  min="1" max="14"
                  className="w-full bg-black border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Langue Préférée</label>
                <select
                  className="w-full bg-black border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="es">Espagnol</option>
                  <option value="de">Allemand</option>
                  <option value="ar">Arabe</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Nationalité (Optionnel)</label>
              <input
                className="w-full bg-black border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: Espagnole"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={loading || !form.city}
              className="mt-6 w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {loading ? 'Création de l\'itinéraire...' : 'Générer mon voyage'}
            </button>
          </section>
        )}

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Map Placeholder */}
            <div className="lg:col-span-2 border border-neutral-800 rounded-3xl p-2 bg-neutral-900/50 min-h-[500px] flex flex-col relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/6/30/25.png')] bg-cover bg-center"></div>
               <div className="relative z-10 p-6 flex flex-col h-full">
                 <h3 className="text-xl font-bold text-orange-400 mb-4">Carte de votre itinéraire</h3>
                 <div className="flex-grow space-y-6 overflow-y-auto pr-2">
                    {result.itinerary?.map((day, i) => (
                      <div key={i} className="bg-black/80 backdrop-blur-sm p-4 rounded-xl border border-neutral-800">
                        <h4 className="font-bold text-orange-500 mb-2">Jour {day.day}</h4>
                        <div className="space-y-3">
                          {day.stops?.map((stop, j) => (
                            <div key={j} className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-400 shrink-0">
                                {j+1}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{stop.name}</div>
                                <div className="text-xs text-orange-300">{stop.hours}</div>
                                <div className="text-sm text-neutral-400 mt-1">{stop.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            {/* Right Panel Info */}
            <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-900/50 space-y-8 flex flex-col">
              <div>
                <h3 className="text-xl font-bold text-orange-400 mb-4">Message Vocal</h3>
                <div className="bg-black border border-neutral-800 p-4 rounded-xl text-sm italic text-neutral-300">
                  "{result.welcomeMessage}"
                </div>
                <button 
                  onClick={() => {
                    if(window.speechSynthesis) {
                      const utterance = new SpeechSynthesisUtterance(result.welcomeMessage);
                      utterance.lang = form.language;
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="mt-3 text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  ▶ Réécouter
                </button>
              </div>

              {result.weather && (
                <div>
                  <h3 className="text-xl font-bold text-orange-400 mb-4">Météo Actuelle</h3>
                  <div className="flex items-center gap-4 bg-black border border-neutral-800 p-4 rounded-xl">
                    <div className="text-4xl font-light text-white">{result.weather.temperature}°C</div>
                    <div className="text-sm text-neutral-400">
                      <div>Vent: {result.weather.windspeed} km/h</div>
                      <div>Météo Code: {result.weather.weathercode}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8">
                 <button className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-neutral-200 transition-colors" onClick={() => window.print()}>
                  Imprimer (PDF + QR)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
