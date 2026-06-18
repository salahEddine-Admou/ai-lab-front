import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const publicLinks = [
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#workflow', label: 'Comment ça marche' },
];

const authLinks = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/interviews', label: 'Entretiens' },
  { to: '/companies', label: 'Offres' },
  { to: '/applications', label: 'Candidatures' },
  { to: '/cv', label: 'Mon CV' },
];

function isNavActive(pathname, to) {
  if (to === '/interviews') {
    return pathname === '/interviews' || pathname.startsWith('/interviews/');
  }
  return pathname === to;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/');
  };

  const linkClass = (active) =>
    `block py-2 text-sm transition md:inline md:py-0 ${
      active ? 'text-orange-400' : 'text-neutral-400 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-black/95 backdrop-blur-lg">
      <div className="page-container flex h-14 items-center justify-between gap-3 sm:h-16">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-bold text-white" onClick={closeMenu}>
          <span className="flex h-8 w-8 items-center justify-center bg-orange-500 text-xs font-bold text-black">
            AI
          </span>
          <span className="text-sm sm:text-base">AI RH</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {user
            ? authLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={linkClass(isNavActive(location.pathname, item.to))}
                >
                  {item.label}
                </Link>
              ))
            : publicLinks.map((item) => (
                <a key={item.href} href={item.href} className={linkClass(false)}>
                  {item.label}
                </a>
              ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <button type="button" onClick={handleLogout} className="btn-secondary text-xs">
              Déconnexion
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-xs">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary text-xs">
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-300 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {menuOpen ? (
            <span className="text-xl leading-none">×</span>
          ) : (
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-800 bg-black md:hidden">
          <nav className="page-container flex flex-col py-3">
            {user
              ? authLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className={linkClass(isNavActive(location.pathname, item.to))}
                  >
                    {item.label}
                  </Link>
                ))
              : publicLinks.map((item) => (
                  <a key={item.href} href={item.href} onClick={closeMenu} className={linkClass(false)}>
                    {item.label}
                  </a>
                ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-neutral-800 pt-3">
              {user ? (
                <button type="button" onClick={handleLogout} className="btn-secondary w-full text-xs">
                  Déconnexion
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className="btn-secondary w-full text-center text-xs">
                    Connexion
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="btn-primary w-full text-center text-xs">
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
