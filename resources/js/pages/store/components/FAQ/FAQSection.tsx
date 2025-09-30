import React from 'react';
import { faqData } from '../../data/faq';
import FaqRow from './FaqRow';

export default function FAQSection() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 pb-20">
      <h2 className="mb-6 text-2xl font-semibold text-white">
        Minecraft Server Hosting FAQ
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {faqData.map((f) => (
          <FaqRow key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </section>
  );
}
