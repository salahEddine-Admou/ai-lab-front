/** Avatar visuel — animation d'image quand l'avatar « parle » */
export default function AvatarFace({ speaking = false, mood = 'neutral' }) {
  const speakingClass = speaking
    ? 'scale-105 border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.6)]'
    : 'border-orange-500/60 shadow-none scale-100';
  const moodClass = mood === 'stress' ? 'sepia-[.5] brightness-90' : '';

  return (
    <div className="flex flex-col items-center justify-center" aria-hidden>
      <style>{`
        @keyframes talkMouth {
          0%, 100% { height: 2px; width: 12px; border-radius: 10px; }
          50% { height: 6px; width: 8px; border-radius: 10px; }
        }
        .anim-talk {
          animation: talkMouth 0.2s infinite alternate;
        }
      `}</style>
      <div
        className={`avatar-face relative mx-auto flex h-40 w-40 overflow-hidden rounded-full border-4 bg-neutral-900 transition-all duration-300 sm:h-48 sm:w-48 ${speakingClass} ${moodClass}`}
      >
        <img
          src="/bot-avatar.jpeg"
          alt="Avatar"
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback au cas où l'image n'est pas trouvée
            e.target.style.display = 'none';
          }}
        />
        
        {/* Overlay pour animer la bouche */}
        <div className="absolute left-1/2 top-[41%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {/* Patch sombre pour masquer la bouche d'origine sur l'image */}
          <div className="absolute w-12 h-6 bg-[#0a0a0a] rounded-[50%] blur-[3px]"></div>
          
          {/* Nouvelle bouche générée en CSS */}
          <div 
            className={`relative bg-[#ff8c00] transition-all duration-75 z-10 ${speaking ? 'anim-talk' : 'w-4 h-1 rounded-full'}`}
            style={{ boxShadow: '0 0 4px #ff8c00' }}
          ></div>
        </div>
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-widest text-neutral-500">Coach IA</p>
    </div>
  );
}
