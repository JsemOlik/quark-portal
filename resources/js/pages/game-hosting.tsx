import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';

export default function GameHosting() {

    return (
        <>
            <Head title="Game Hosting">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <Navbar/>
                </header>
                <div className='max-w-4xl text-white flex flex-col gap-4 items-start'>
                    <h1 className='text-6xl'>Elevate your next Game Server</h1>
                    <p>Powered by our cutting-edge network, enjoy warp-speed¹ connections and exceptional performance for all your favorite games. Switch between games with ease and experience the future of multiplayer.</p>
                    <div>
                        <Button size="lg" className="mr-2"><Link href="/store">Learn More</Link></Button>
                        <Button size="lg"><Link href="/store">Starting at just Kč292/month</Link></Button>
                    </div>

                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
