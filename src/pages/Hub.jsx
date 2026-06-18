import { Link } from 'react-router-dom';

const STATIONS = [
  {
    id: 'booster',
    title: 'Le Booster\nde Carrière',
    subtitle: 'ODC IA Lab',
    path: '/parcours',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-white group-hover:text-orange-500 transition-colors">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        {/* Decorative elements representing the arrow */}
        <path d="M22 12A10 10 0 0 0 2 12" stroke="#f97316" strokeDasharray="4 4" />
        <path d="M22 12l-2-2m2 2l-2 2" stroke="#f97316" />
        <circle cx="2" cy="12" r="1.5" fill="#f97316" stroke="none" />
      </svg>
    )
  },
  {
    id: 'studio',
    title: 'Le Studio\nCréatif',
    subtitle: 'ODC IA Lab',
    path: '/studio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-white group-hover:text-orange-500 transition-colors">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 7v4m-2-2h4" stroke="#f97316" />
        {/* Decorative elements */}
        <path d="M12 2A10 10 0 0 1 22 12" stroke="#f97316" strokeDasharray="4 4" />
        <circle cx="12" cy="2" r="1.5" fill="#f97316" stroke="none" />
      </svg>
    )
  },
  {
    id: 'incubateur',
    title: "L'Incubateur\nExpress",
    subtitle: 'ODC IA Lab',
    path: '/incubateur',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-white group-hover:text-orange-500 transition-colors">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <circle cx="12" cy="12" r="2" />
        <path d="M22 22A16 16 0 0 1 6 6" stroke="#f97316" strokeDasharray="4 4" />
        <circle cx="6" cy="6" r="1.5" fill="#f97316" stroke="none" />
      </svg>
    )
  },
  {
    id: 'hub',
    title: 'Le Hub Client\nIntelligent',
    subtitle: 'ODC IA Lab',
    path: '/hub-client',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-white group-hover:text-orange-500 transition-colors">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
        {/* Decorative elements */}
        <path d="M22 12A10 10 0 0 1 12 22" stroke="#f97316" strokeDasharray="4 4" />
        <circle cx="12" cy="22" r="1.5" fill="#f97316" stroke="none" />
      </svg>
    )
  },
  {
    id: 'portail',
    title: 'Le Portail\nImmersif',
    subtitle: 'ODC IA Lab',
    path: '/tourisme',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-white group-hover:text-orange-500 transition-colors">
        <path d="M4 14v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2.5a.5.5 0 0 0-.4.2l-.9 1.2a1 1 0 0 1-1.6 0l-.9-1.2a.5.5 0 0 0-.4-.2H6a2 2 0 0 1-2-2Z" />
        <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
        {/* Decorative elements */}
        <path d="M2 12A10 10 0 0 0 12 22" stroke="#f97316" strokeDasharray="4 4" />
        <circle cx="2" cy="12" r="1.5" fill="#f97316" stroke="none" />
      </svg>
    )
  },
  {
    id: 'agritech',
    title: 'Agritech\nSouss',
    subtitle: 'ODC IA Lab',
    path: '/agritech',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-white group-hover:text-orange-500 transition-colors">
        <path d="M12 22C12 22 4 15 4 8C4 3 12 2 12 2C12 2 20 3 20 8C20 15 12 22 12 22Z" />
        <path d="M12 22V12" strokeDasharray="4 4" stroke="#f97316" />
        <circle cx="12" cy="12" r="1.5" fill="#f97316" stroke="none" />
      </svg>
    )
  }
];

export default function Hub() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 sm:p-12">
      <div className="max-w-5xl w-full">
        <h1 className="sr-only">ODC IA Lab Stations</h1>
        <div className="border border-orange-500/50 rounded-3xl p-8 sm:p-16 relative shadow-[0_0_40px_rgba(249,115,22,0.05)]">
          {/* Subtle background glow inside the border */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 justify-items-start pl-0 sm:pl-4 relative z-10">
            {STATIONS.map((station) => (
              <Link 
              key={station.id}
              to={station.path}
              className={`flex items-center gap-6 group ${
                station.path === '#' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform duration-300'
              }`}
              onClick={(e) => station.path === '#' && e.preventDefault()}
            >
              {/* Icon Container */}
              <div className="relative flex-shrink-0 flex items-center justify-center w-16 h-16">
                {/* Subtle glow behind icon on hover */}
                {station.path !== '#' && (
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                {station.icon}
              </div>
              
              {/* Text content with left border */}
              <div className={`border-l-[2px] border-neutral-700 pl-4 py-1 h-full flex flex-col justify-center transition-colors duration-300 ${station.path !== '#' ? 'group-hover:border-orange-500' : ''}`}>
                <h2 className={`font-bold text-xl sm:text-2xl leading-tight whitespace-pre-line transition-colors duration-300 ${station.path !== '#' ? 'text-white group-hover:text-orange-100' : 'text-neutral-300'}`}>
                  {station.title}
                </h2>
                <div className="flex items-center mt-1 gap-3">
                  <p className="text-orange-500 text-sm font-semibold tracking-wider">
                    {station.subtitle}
                  </p>
                  <div className="w-12 h-[1px] bg-orange-500"></div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
