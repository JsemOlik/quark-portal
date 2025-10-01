import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { planData } from './data/plans';
import { formatGameName } from '@/lib/utils/formatGameName';

type Step = 1 | 2;

type VariantMap = Record<string, Array<{ id: string; name: string }>>;

const games = [
  { id: 'minecraft', name: 'Minecraft' },
  { id: 'counter_strike', name: 'Counter-Strike' },
  { id: 'rust', name: 'Rust' },
  { id: 'ark', name: 'ARK: Survival Ascended' },
  { id: 'gmod', name: "Garry's Mod" },
//   { id: 'valheim', name: 'Valheim' },
];

const gameVariants: VariantMap = {
  // Minecraft variants (Version)
  minecraft: [
    { id: 'paper', name: 'Paper' },
    { id: 'vanilla', name: 'Vanilla' },
    { id: 'purpur', name: 'Purpur' },
    { id: 'bungeecord', name: 'Bungeecord' },
    { id: 'fabric', name: 'Fabric' },
    { id: 'sponge', name: 'Sponge (SpongeVanilla)' },
    { id: 'forge', name: 'Forge' },
  ],
  // Counter-Strike variants
  counter_strike: [
    { id: 'csgo', name: 'CS:GO' },
    { id: 'cs2', name: 'CS2' },
  ],
  // No variants for these — we’ll hide the dropdown
  rust: [],
  ark: [],
  gmod: [],
  valheim: [],
};

export default function ConfigureServer({
  csrf,
  initialPlan: planProp,
  initialBill: billProp,
}: {
  csrf?: string;
  initialPlan?: string;
  initialBill?: string;
}) {
  const { props } = usePage();
  const user = (props as any).auth?.user as any;

  const [step, setStep] = React.useState<Step>(1);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const planId = planProp || '';
  const billing =
    billProp === 'monthly' || billProp === 'yearly' ? billProp : 'yearly';

  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>(
    billing
  );
  const selectedPlan = React.useMemo(
    () => planData.find((p) => p.id === planId) || null,
    [planId]
  );
  const monthlyPrice = React.useMemo(() => {
    if (!selectedPlan) return null;
    const base = selectedPlan.priceCZK;
    return billingCycle === 'yearly' ? Math.round(base * 0.85) : base;
  }, [selectedPlan, billingCycle]);

  // Game and Variant
  const [game, setGame] = React.useState<string>('minecraft');

  const [variant, setVariant] = React.useState<string>(() => {
    const list = gameVariants['minecraft'] ?? [];
    return list[0]?.id ?? '';
  });

  React.useEffect(() => {
    const list = gameVariants[game] ?? [];
    setVariant(list[0]?.id ?? '');
  }, [game]);

  // Show variant select only for games that have variants
  const showVariant = (gameVariants[game] ?? []).length > 0;

  const [serverName, setServerName] = React.useState<string>('My Quark Server');
  const [region, setRegion] = React.useState<string>('eu-central');

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [country, setCountry] = React.useState('CZ');
  const [saveBillingInfo, setSaveBillingInfo] = React.useState(false);

  const [processing, setProcessing] = React.useState(false);

  function getCsrfToken(): string {
    if (csrf) return csrf;
    const el = document.querySelector(
      'meta[name="csrf-token"]'
    ) as HTMLMetaElement | null;
    return el?.content || '';
  }

  function useAccountDetails() {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      if (user.billing_address) setAddress(user.billing_address);
      if (user.billing_city) setCity(user.billing_city);
      if (user.billing_country) setCountry(user.billing_country);
    }
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateBillingStep(): boolean {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submitCheckout() {
    if (processing) return;

    if (!validateBillingStep()) {
      return;
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      alert('Invalid billing cycle.');
      return;
    }
    setProcessing(true);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/checkout';

    const add = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    add('_token', getCsrfToken());
    add('plan', planId || selectedPlan?.id || 'custom');
    add('billing', billingCycle);

    // Game and Variant: send game and game_variant
    // For single-variant games, variant can be empty; backend should tolerate that or ignore it
    add('game', game);
    if (showVariant && variant) {
      add('game_variant', variant);
    }

    add('server_name', serverName);
    add('region', region);
    add('billing_name', fullName);
    add('billing_address', address);
    add('billing_city', city);
    add('billing_country', country);
    add('save_billing_info', saveBillingInfo ? '1' : '0');

    document.body.appendChild(form);
    form.submit();
  }

  return (
    <>
      <Head title="Configure your server">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pt-4">
          <Navbar />
        </header>

        <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-10">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm text-brand-cream/70 hover:text-brand"
            >
              ← Back to pricing
            </Link>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-brand-cream">
            Configure your server
          </h1>
          <p className="mb-6 text-brand-cream/80">
            Plan:{' '}
            <span className="font-semibold">
              {selectedPlan?.tier || planId || 'Custom'}
            </span>{' '}
            • Billing:{' '}
            <span className="font-semibold capitalize">{billingCycle}</span>
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 text-sm text-brand-cream/80">
              <div
                className={`h-2 w-24 rounded-full transition-all duration-300 ${
                  step >= 1 ? 'bg-brand' : 'bg-white/10'
                }`}
              ></div>
              <div
                className={`h-2 w-24 rounded-full transition-all duration-300 ${
                  step >= 2 ? 'bg-brand' : 'bg-white/10'
                }`}
              ></div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-brand-cream/60">
              <span>Server Details</span>
              <span>Billing Info</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content - Animated Transition */}
            <div className="lg:col-span-2">
              <div
                className={`transition-all duration-500 ${
                  step === 1
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-10 absolute'
                }`}
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 text-lg font-semibold text-brand-cream">
                        Server details
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-brand-cream">Game</Label>
                          <Select value={game} onValueChange={setGame}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select game" />
                            </SelectTrigger>
                            <SelectContent>
                              {games.map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                  {g.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {showVariant && (
                            <div className="mt-4">
                              <Label className="text-brand-cream">
                                {game === 'minecraft' ? 'Version' : 'Variant'}
                              </Label>
                              <Select
                                value={variant}
                                onValueChange={setVariant}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue
                                    placeholder={
                                      game === 'minecraft'
                                        ? 'Select version'
                                        : 'Select variant'
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {(gameVariants[game] ?? []).map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                      {v.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-brand-cream">Server name</Label>
                          <Input
                            className="mt-2"
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label className="text-brand-cream">Region</Label>
                          <Select value={region} onValueChange={setRegion}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eu-central">
                                EU Central (Prague)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-brand-cream">
                            Billing cycle
                          </Label>
                          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                            <button
                              type="button"
                              onClick={() => setBillingCycle('monthly')}
                              className={
                                'rounded-full px-3 py-1 text-sm text-white transition-all ' +
                                (billingCycle === 'monthly'
                                  ? 'bg-brand'
                                  : 'hover:bg-white/10')
                              }
                            >
                              Monthly
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillingCycle('yearly')}
                              className={
                                'rounded-full px-3 py-1 text-sm text-white transition-all ' +
                                (billingCycle === 'yearly'
                                  ? 'bg-brand'
                                  : 'hover:bg-white/10')
                              }
                            >
                              Yearly
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setStep(2)}
                        className="rounded-xl bg-brand text-brand-brown hover:bg-brand"
                      >
                        Continue to billing
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`transition-all duration-500 ${
                  step === 2
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-10 absolute'
                }`}
              >
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-lg font-semibold text-brand-cream">
                          Billing information
                        </div>
                        {user && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-brand text-xs hover:bg-brand/10"
                            onClick={useAccountDetails}
                          >
                            Use account details
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-brand-cream">
                            Full name *
                          </Label>
                          <Input
                            className={`mt-2 ${
                              errors.fullName ? 'border-red-500' : ''
                            }`}
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (errors.fullName)
                                setErrors({ ...errors, fullName: '' });
                            }}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.fullName}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-brand-cream">Email *</Label>
                          <Input
                            className={`mt-2 ${
                              errors.email ? 'border-red-500' : ''
                            }`}
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email)
                                setErrors({ ...errors, email: '' });
                            }}
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-brand-cream">Address *</Label>
                          <Input
                            className={`mt-2 ${
                              errors.address ? 'border-red-500' : ''
                            }`}
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              if (errors.address)
                                setErrors({ ...errors, address: '' });
                            }}
                          />
                          {errors.address && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.address}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-brand-cream">City *</Label>
                          <Input
                            className={`mt-2 ${
                              errors.city ? 'border-red-500' : ''
                            }`}
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (errors.city)
                                setErrors({ ...errors, city: '' });
                            }}
                          />
                          {errors.city && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-brand-cream">Country *</Label>
                          <Select
                            value={country}
                            onValueChange={(v) => {
                              setCountry(v);
                              if (errors.country)
                                setErrors({ ...errors, country: '' });
                            }}
                          >
                            <SelectTrigger
                              className={`mt-2 ${
                                errors.country ? 'border-red-500' : ''
                              }`}
                            >
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CZ">Czechia</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                              <SelectItem value="US">United States</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.country && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-3 text-lg font-semibold text-brand-cream">
                        Payment
                      </div>
                      <p className="mb-4 text-sm text-brand-cream/80">
                        You will be redirected to Stripe Checkout to securely
                        enter your payment details and complete the
                        subscription.
                      </p>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="save-billing"
                          checked={saveBillingInfo}
                          onCheckedChange={(checked) =>
                            setSaveBillingInfo(checked as boolean)
                          }
                          className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                        />
                        <label
                          htmlFor="save-billing"
                          className="cursor-pointer text-sm text-brand-cream/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Save my billing address for future purchases
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="rounded-xl text-brand-cream"
                        onClick={() => {
                          setStep(1);
                          setErrors({});
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        disabled={processing}
                        className="rounded-xl bg-brand text-brand-brown hover:bg-brand"
                        onClick={submitCheckout}
                      >
                        {processing ? 'Processing…' : 'Pay now'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-lg font-semibold text-brand-cream">
                Order summary
              </div>
              <ul className="space-y-2 text-sm text-brand-cream/80">
                <li>
                  Plan:{' '}
                  <span className="font-medium">
                    {selectedPlan?.tier || planId || 'Custom'}
                  </span>
                </li>
                <li>
                  Game:{' '}
                  <span className="font-medium">
                    {formatGameName(game)}
                  </span>
                </li>
                {showVariant && (
                  <li>
                    {game === 'minecraft' ? 'Version' : 'Variant'}:{' '}
                    <span className="font-medium">
                      {(gameVariants[game] ?? []).find(
                        (v) => v.id === variant
                      )?.name ?? variant}
                    </span>
                  </li>
                )}
                <li>
                  Region: <span className="font-medium">{region}</span>
                </li>
                <li>
                  Billing:{' '}
                  <span className="font-medium capitalize">
                    {billingCycle}
                  </span>
                </li>
              </ul>
              <hr className="my-4 border-white/10" />
              <div className="flex items-baseline justify-between">
                <span className="text-brand-cream/80">Estimated total</span>
                {monthlyPrice !== null ? (
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      Kč{monthlyPrice}
                      <span className="ml-1 text-sm font-normal text-brand-cream/80">
                        /month
                      </span>
                    </div>
                    {billingCycle === 'yearly' ? (
                      <div className="text-xs text-brand-cream/60">
                        Billed yearly: Kč{monthlyPrice * 12}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-2xl font-bold">Kč—</span>
                )}
              </div>
              <p className="mt-2 text-xs text-brand-cream/60">
                Prices mirror plan selection and billing cycle.
              </p>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
