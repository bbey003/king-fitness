'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';

interface NavUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
}

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
];

export function Navbar({ user }: { user: NavUser | null }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totalQty, openCart } = useCart();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    router.push('/');
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'provider';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled ? 'bg-ink-950/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <span
              aria-hidden="true"
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-800 grid place-items-center shadow-glow"
            >
              <span className="text-white">K</span>
            </span>
            <span>King Fitness</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    pathname === l.href
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart, ${totalQty} items`}
              className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {totalQty > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center text-[10px] font-bold rounded-full bg-brand-500 text-white">
                  {totalQty}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-800 grid place-items-center text-xs font-bold">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm hidden lg:inline">{user.display_name}</span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-glow"
                  >
                    <Link
                      href="/account"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                    >
                      <User size={16} aria-hidden="true" /> Account
                    </Link>
                    <Link
                      href="/account/bookings"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                    >
                      <LayoutDashboard size={16} aria-hidden="true" /> My bookings
                    </Link>
                    <Link
                      href="/account/orders"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                    >
                      <ShoppingBag size={16} aria-hidden="true" /> Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5 text-brand-200"
                      >
                        <LayoutDashboard size={16} aria-hidden="true" /> Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5 text-red-300"
                    >
                      <LogOut size={16} aria-hidden="true" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Get started
                </Link>
              </div>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-white/80 hover:bg-white/10"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/10">
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                      pathname === l.href
                        ? 'text-white bg-white/10'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li>
                    <Link href="/account" className="block px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/5">
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/bookings" className="block px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/5">
                      My bookings
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link href="/admin" className="block px-3 py-2.5 rounded-lg text-sm text-brand-200 hover:bg-white/5">
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left block px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-white/5"
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <li className="flex gap-2 pt-2">
                  <Link href="/login" className="btn-secondary flex-1 text-sm py-2 px-4">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary flex-1 text-sm py-2 px-4">
                    Get started
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
