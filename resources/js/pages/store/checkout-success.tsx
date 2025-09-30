import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';

export default function CheckoutSuccess({ serverId }: { serverId: number }) {
    return (
        <>
            <Head title="Checkout success" />
            <div className="min-h-screen bg-[#FDFDFC] text-[rgb(255,245,235)] dark:bg-background">
                <header className="mx-auto w-full max-w-7xl px-4 pt-4">
                    <Navbar />
                </header>
                <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-10">
                    <h1 className="mb-2 text-2xl font-semibold text-brand-cream">Payment successful</h1>
                    <p className="mb-6 text-brand-cream/80">Your server #{serverId} is being provisioned. You'll receive an email shortly.</p>
                    <Link href={`/dashboard/servers/${serverId}`} className="underline">Go to server</Link>
                </section>
            </div>
        </>
    );
}


