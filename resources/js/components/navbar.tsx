import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
// Removed import of login/register route helpers to avoid queryParams errors
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
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
  const getInitials = useInitials();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[1500] flex w-full max-w-full justify-center overflow-x-hidden px-3 py-2 text-white">
        <div
          className={`pointer-events-auto flex h-12 w-full min-w-0 items-center justify-between px-2 transition-all duration-200 ease-in-out ${
            scrolled
              ? 'max-w-7xl rounded-2xl border border-white/10 bg-brand-brown/60 shadow-lg backdrop-blur-md'
              : 'max-w-6xl rounded-none border-none bg-transparent shadow-none'
          }`}
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 rounded-lg px-2 py-1">
            <AppLogoIcon className="h-5 w-5 text-brand" />
            <span className="font-yaro tracking-tight">Sigma Hosting lol</span>
          </Link>

          {/* Center: Links */}
          <nav className="hidden min-w-0 items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Auth buttons (desktop) / menu (mobile) */}
          <div className="flex min-w-0 items-center gap-2">
            <div className="hidden min-w-0 items-center gap-2 sm:flex">
              {auth?.user ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="h-8 rounded-lg border-white/15 px-3 hover:bg-white/10"
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>

                  {auth.user.is_admin && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-8 rounded-lg border-brand/30 bg-brand/10 px-3 hover:bg-brand/20 text-brand"
                    >
                      <Link href="/admin">Admin</Link>
                    </Button>
                  )}

                  {/* Avatar dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="size-9 rounded-full p-0 hover:bg-white/10"
                        aria-label="User menu"
                      >
                        <Avatar className="size-8 overflow-hidden rounded-full">
                          <AvatarImage
                            src={auth.user.avatar}
                            alt={auth.user.name}
                          />
                          <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(auth.user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="z-[2000] w-56 rounded-xl border border-white/10 bg-neutral-900/95 text-white shadow-xl backdrop-blur-md"
                    >
                      <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
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
                      className="z-[2000] min-w-[180px] rounded-xl border border-white/10 bg-neutral-900/95 text-white shadow-xl backdrop-blur-md"
                    >
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/login" className="w-full">
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
                    className="h-8 rounded-lg border-1 border-brand-cream/20 bg-brand-cream/10 px-3 text-white hover:bg-brand-cream/20"
                  >
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="rounded-lg p-2 hover:bg-white/5 md:hidden"
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
        className={`fixed inset-x-0 top-14 z-[1200] mt-2 w-full overflow-x-hidden text-white transition-all md:hidden ${
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
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-2">
              {auth?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-white/5 px-3 py-2 text-center hover:bg-white/10"
                  >
                    Dashboard
                  </Link>
                  {auth.user.is_admin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="rounded-xl bg-brand/10 px-3 py-2 text-center hover:bg-brand/20 text-brand border border-brand/30"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
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
                    href="/register"
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
      className="truncate rounded-xl px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
    >
      {children}
    </Link>
  );
}
