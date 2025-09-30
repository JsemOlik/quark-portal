import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { planData } from './data/plans';

type Step = 1 | 2;

const games = [
    { id: 'minecraft', name: 'Minecraft' },
    { id: 'valheim', name: 'Valheim' },
    { id: 'ark', name: 'ARK: Survival Ascended' },
    { id: 'rust', name: 'Rust' },
    { id: 'cs2', name: 'Counter-Strike 2' },
];

export default function ConfigureServer() {
    const [step, setStep] = React.useState<Step>(1);
    const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');
    const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://local');
    const initialPlan = url.searchParams.get('plan') || '';
    const initialBill = (url.searchParams.get('bill') as 'monthly' | 'yearly') || 'yearly';

    const [planId] = React.useState<string>(initialPlan);
    const [billing, setBilling] = React.useState<'monthly' | 'yearly'>(initialBill);
    const selectedPlan = React.useMemo(() => planData.find(p => p.id === planId) || null, [planId]);
    const monthlyPrice = React.useMemo(() => {
        if (!selectedPlan) return null;
        const base = selectedPlan.priceCZK;
        return billing === 'yearly' ? Math.round(base * 0.85) : base;
    }, [selectedPlan, billing]);

    const [game, setGame] = React.useState<string>('minecraft');
    const [serverName, setServerName] = React.useState<string>('My Quark Server');
    const [region, setRegion] = React.useState<string>('eu-central');

    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [city, setCity] = React.useState('');
    const [country, setCountry] = React.useState('CZ');
    const [cardNumber, setCardNumber] = React.useState('');
    const [cardExpiry, setCardExpiry] = React.useState('');
    const [cardCvc, setCardCvc] = React.useState('');

    function Progress() {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-center gap-3 text-sm text-brand-cream/80">
                    <div className={`h-2 w-24 rounded-full ${step >= 1 ? 'bg-brand' : 'bg-white/10'}`}></div>
                    <div className={`h-2 w-24 rounded-full ${step >= 2 ? 'bg-brand' : 'bg-white/10'}`}></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-brand-cream/60">
                    <span>Details</span>
                    <span>Billing</span>
                </div>
            </div>
        );
    }

    function StepDetails() {
        return (
            <div className={"space-y-6 animate-in " + (direction === 'forward' ? 'fade-in-0 slide-in-from-right-4' : 'fade-in-0 slide-in-from-left-4')}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 text-lg font-semibold text-brand-cream">Server details</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-brand-cream">Game</Label>
                            <Select value={game} onValueChange={setGame}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select game" />
                                </SelectTrigger>
                                <SelectContent>
                                    {games.map((g) => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-brand-cream">Server name</Label>
                            <Input className="mt-2" value={serverName} onChange={(e) => setServerName(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-brand-cream">Region</Label>
                            <Select value={region} onValueChange={setRegion}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="eu-central">EU Central (Frankfurt)</SelectItem>
                                    <SelectItem value="eu-west">EU West (Paris)</SelectItem>
                                    <SelectItem value="us-east">US East (Virginia)</SelectItem>
                                    <SelectItem value="us-west">US West (Oregon)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-brand-cream">Billing cycle</Label>
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                                <button onClick={() => setBilling('monthly')} className={'rounded-full px-3 py-1 text-sm text-white ' + (billing === 'monthly' ? 'bg-brand' : 'hover:bg-white/10')}>Monthly</button>
                                <button onClick={() => setBilling('yearly')} className={'rounded-full px-3 py-1 text-sm text-white ' + (billing === 'yearly' ? 'bg-brand' : 'hover:bg-white/10')}>Yearly</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => { setDirection('forward'); setStep(2); }} className="rounded-xl bg-brand text-brand-brown hover:bg-brand">Continue to billing</Button>
                </div>
            </div>
        );
    }

    function StepBilling() {
        return (
            <div className={"space-y-6 animate-in " + (direction === 'forward' ? 'fade-in-0 slide-in-from-right-4' : 'fade-in-0 slide-in-from-left-4')}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 text-lg font-semibold text-brand-cream">Billing information</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-brand-cream">Full name</Label>
                            <Input className="mt-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-brand-cream">Email</Label>
                            <Input className="mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-brand-cream">Address</Label>
                            <Input className="mt-2" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-brand-cream">City</Label>
                            <Input className="mt-2" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-brand-cream">Country</Label>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CZ">Czechia</SelectItem>
                                    <SelectItem value="DE">Germany</SelectItem>
                                    <SelectItem value="FR">France</SelectItem>
                                    <SelectItem value="US">United States</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 text-lg font-semibold text-brand-cream">Payment method</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label className="text-brand-cream">Card number</Label>
                            <Input className="mt-2" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-brand-cream">Expiry</Label>
                            <Input className="mt-2" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-brand-cream">CVC</Label>
                            <Input className="mt-2" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-brand-cream/60">Payments are not processed yet. We will integrate Laravel Cashier later.</p>
                </div>

                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="rounded-xl text-brand-cream" onClick={() => { setDirection('backward'); setStep(1); }}>Back</Button>
                    <Button className="rounded-xl bg-brand text-brand-brown hover:bg-brand">Pay now</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Configure your server">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>

                <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-10">
                    <div className="mb-6">
                        <Link href='/store' className="text-sm text-brand-cream/70 hover:text-brand">← Back to pricing</Link>
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold text-brand-cream">Configure your server</h1>
                    <p className="mb-6 text-brand-cream/80">Plan: <span className="font-semibold">{selectedPlan?.tier || planId || 'Custom'}</span> • Billing: <span className="font-semibold capitalize">{billing}</span></p>

                    <Progress />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            {step === 1 ? <StepDetails /> : <StepBilling />}
                        </div>
                        <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="mb-3 text-lg font-semibold text-brand-cream">Order summary</div>
                            <ul className="space-y-2 text-sm text-brand-cream/80">
                                <li>Plan: <span className="font-medium">{selectedPlan?.tier || planId || 'Custom'}</span></li>
                                <li>Game: <span className="font-medium">{games.find(g => g.id === game)?.name}</span></li>
                                <li>Region: <span className="font-medium">{region}</span></li>
                                <li>Billing: <span className="font-medium capitalize">{billing}</span></li>
                            </ul>
                            <hr className="my-4 border-white/10" />
                            <div className="flex items-baseline justify-between">
                                <span className="text-brand-cream/80">Estimated total</span>
                                {monthlyPrice !== null ? (
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">Kč{monthlyPrice}<span className="ml-1 text-sm font-normal text-brand-cream/80">/month</span></div>
                                        {billing === 'yearly' ? (
                                            <div className="text-xs text-brand-cream/60">Billed yearly: Kč{monthlyPrice * 12}</div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <span className="text-2xl font-bold">Kč—</span>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-brand-cream/60">Prices mirror plan selection and billing cycle.</p>
                        </aside>
                    </div>
                </section>
            </div>
        </>
    );
}


