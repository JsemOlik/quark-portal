// resources/js/Pages/storage/components/FAQ.tsx
import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export default function FAQ() {
  return (
    <section className="relative mx-auto w-full border-t border-white/5">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="1" className="rounded-xl border border-white/10 px-3">
              <AccordionTrigger>Is it compatible with AWS S3 SDKs?</AccordionTrigger>
              <AccordionContent>
                Yes—use AWS SDKs, rclone, s3cmd, AWS CLI, or MinIO client. Configure the custom
                endpoint and your keys.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2" className="rounded-xl border border-white/10 px-3">
              <AccordionTrigger>Where is the data stored?</AccordionTrigger>
              <AccordionContent>
                EU-based nodes with low-latency uplinks. Region selection available where listed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3" className="rounded-xl border border-white/10 px-3">
              <AccordionTrigger>Do you support panel backups?</AccordionTrigger>
              <AccordionContent>
                Yes—point your panel backup destination to the S3 endpoint with your access/secret
                keys. We provide a quick-start in docs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="4" className="rounded-xl border border-white/10 px-3">
              <AccordionTrigger>What redundancy should I choose?</AccordionTrigger>
              <AccordionContent>
                Single-replica is cost‑effective for non‑critical data. Erasure coding offers
                increased durability with small overhead.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="5" className="rounded-xl border border-white/10 px-3">
              <AccordionTrigger>How does egress work?</AccordionTrigger>
              <AccordionContent>
                Each plan includes TBs of egress. Overages are billed per GB at the rate shown at
                checkout.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="6" className="rounded-xl border border-white/10 px-3">
              <AccordionTrigger>Any request charges?</AccordionTrigger>
              <AccordionContent>
                API requests are included up to fair‑use thresholds designed for typical backups and
                asset hosting.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
