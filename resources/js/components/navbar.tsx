import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Game Hosting', href: '/' },
  { label: 'VPS', href: '/' },
  { label: 'About Us', href: '/about-us' },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const { auth } = usePage<SharedData>().props;

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center px-3 py-2 text-white">
        <div className="pointer-events-auto flex h-12 w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-3 shadow-lg backdrop-blur-md">
          {/* Left: Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-2 py-1"
          >
            <AppLogoIcon className="h-5 w-5 text-orange-400" />
            <span className="font-semibold tracking-tight">quark</span>
          </Link>

          {/* Center: Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Auth buttons (desktop) / menu (mobile) */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              {auth?.user ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-8 rounded-lg px-3 border-white/15 hover:bg-white/10"
                >
                  <Link href={dashboard()}>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-8 rounded-lg px-3 text-white hover:bg-white/10"
                  >
                    <Link href={login()}>Log in</Link>
                  </Button>
                  <Button
                    asChild
                    className="h-8 rounded-lg px-3 bg-zinc-600/50 text-white hover:bg-zinc-500/50 border-1 border-zinc-500/50"
                  >
                    <Link href={register()}>Register</Link>
                  </Button>
                </>
              )}
            </div>

            <button
              className="md:hidden rounded-lg p-2 hover:bg-white/5"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-x-0 top-14 z-40 md:hidden transition-all ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-3 rounded-2xl border border-white/10 bg-black/70 p-2 shadow-xl backdrop-blur-md">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-white/10 pt-2 flex gap-2">
              {auth?.user ? (
                <Link
                  href={dashboard()}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-center hover:bg-white/10"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href={login()}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl px-3 py-2 text-center hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    href={register()}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-center text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  );
}
