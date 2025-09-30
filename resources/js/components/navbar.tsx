import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { login, register } from '@/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Game Hosting', href: '/' },
  { label: 'VPS', href: '/vps' },
  { label: 'About Us', href: '/' },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { auth } = usePage<SharedData>().props;

  // detect scroll
  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 py-2 text-white w-full max-w-full overflow-x-hidden">
        <div
          className={`pointer-events-auto flex h-12 w-full min-w-0 items-center justify-between px-2
          transition-all duration-200 ease-in-out
          ${
            scrolled
              ? 'max-w-7xl rounded-2xl border border-white/10 bg-brand-brown/60 shadow-lg backdrop-blur-md'
              : 'max-w-6xl bg-transparent border-none shadow-none rounded-none'
          }`}
        >
          {/* Left: Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-2 py-1"
          >
            <AppLogoIcon className="h-5 w-5 text-brand" />
            <span className="font-yaro tracking-tight">quark</span>
          </Link>

          {/* Center: Links */}
          <nav className="hidden md:flex items-center gap-1 min-w-0">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Auth buttons (desktop) / menu (mobile) */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              {auth?.user ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-8 rounded-lg px-3 border-white/15 hover:bg-white/10"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  {/* Login dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 rounded-lg px-3 text-white hover:bg-white/10 gap-1"
                      >
                        Log in
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="min-w-[180px] rounded-xl"
                    >
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href={login()} className="w-full">
                          Portal
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <a
                          href="https://youtube.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          Game Panel
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    asChild
                    className="h-8 rounded-lg px-3 bg-brand-cream/10 text-white hover:bg-brand-cream/20 border-1 border-brand-cream/20"
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
        className={`fixed inset-x-0 top-14 z-40 md:hidden transition-all text-white mt-2 w-full overflow-x-hidden ${
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
            <div className="mt-2 border-t border-white/10 pt-2 flex flex-col gap-2">
              {auth?.user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-white/5 px-3 py-2 text-center hover:bg-white/10"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href={login()}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-center hover:bg-white/10"
                  >
                    Portal (Log in)
                  </Link>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2 text-center hover:bg-white/10"
                  >
                    Game Panel
                  </a>
                  <Link
                    href={register()}
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-blue-600 px-3 py-2 text-center text-white hover:bg-blue-700"
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
      className="rounded-xl px-3 py-1.5 text-sm hover:bg-white/10 transition-colors truncate"
    >
      {children}
    </Link>
  );
}
