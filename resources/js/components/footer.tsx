import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Github, Twitter, Youtube } from 'lucide-react';
import { type SharedData } from '@/types';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const productLinks: FooterLink[] = [
  { label: 'Game Hosting', href: '/' },
  { label: 'Web Hosting', href: '/web-hosting' },
];

const companyLinks: FooterLink[] = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Careers', href: '/careers' },
  { label: 'Infrastructure Status', href: '/status' },
  { label: 'Brand Guidelines', href: '/brand-guidelines' },
];

const legalLinks: FooterLink[] = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Service Level Agreement', href: '/sla' },
];

type PageProps = SharedData & {
  name?: string; // comes from HandleInertiaRequests share() at the root
};

export default function Footer() {
  const { name } = usePage<PageProps>().props;
  const appName = name ?? 'Your App';

  return (
    <footer className="relative mt-16 w-full text-brand-cream">
      <div className="w-full border-t border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="px-0 py-8 sm:py-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
              <FooterColumn title="Products" links={productLinks} />
              <FooterColumn title="Company" links={companyLinks} />
              <FooterColumn title="Legal" links={legalLinks} />
              <div className="flex flex-col gap-3">
                <div className="mt-2 flex items-center gap-3 text-brand-cream/70">
                  <SocialIcon
                    label="GitHub"
                    href="https://github.com/your-org"
                    icon={<Github className="h-4 w-4" />}
                  />
                  <SocialIcon
                    label="Twitter"
                    href="https://twitter.com/your-handle"
                    icon={<Twitter className="h-4 w-4" />}
                  />
                  <SocialIcon
                    label="YouTube"
                    href="https://youtube.com/@your-channel"
                    icon={<Youtube className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-sm text-brand-cream/60 md:flex-row md:items-center">
              <p>
                © {new Date().getFullYear()} {appName}. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/cookies"
                  className="rounded-md px-2 py-1 text-brand-cream/70 hover:text-brand-cream"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[-1] h-32 bg-gradient-to-t from-black/40 to-transparent" />
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-brand-cream/80">{title}</h3>
      <ul className="flex flex-col">
        {links.map((item) =>
          item.external ? (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1.5 text-sm text-brand-cream/70 hover:text-brand-cream"
              >
                {item.label}
              </a>
            </li>
          ) : (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-2 py-1.5 text-sm text-brand-cream/70 hover:text-brand-cream"
              >
                {item.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function SocialIcon({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="rounded-lg p-2 text-brand-cream/70 transition-colors hover:bg-white/10 hover:text-brand-cream"
    >
      {icon}
    </a>
  );
}
