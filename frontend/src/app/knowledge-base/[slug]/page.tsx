'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, BookOpenText, CircleCheckBig, ChevronRight, Clock3 } from 'lucide-react';
import { getKnowledgeDocument, getRelatedDocuments } from '@/data/knowledge-base';

export default function KnowledgeDocumentPage({ params }: { params: { slug: string } }) {
  const document = getKnowledgeDocument(params.slug);
  const [feedback, setFeedback] = useState<'Yes' | 'No' | null>(null);

  if (!document) {
    notFound();
  }

  const relatedDocuments = getRelatedDocuments(document.slug, document.categorySlug);

  const badgeClassName = (badge: string | null) => {
    if (badge === 'Baru') {
      return 'bg-sky-50 text-sky-700';
    }

    if (badge === 'Populer') {
      return 'bg-emerald-50 text-emerald-700';
    }

    return 'bg-slate-100 text-slate-500';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-700">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/knowledge-base" className="transition-colors hover:text-slate-700">IT Help Center</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-500">{document.title}</span>
        </div>

        <div className="mt-5 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <Link
              href="/knowledge-base"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Guides
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">{document.category}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{document.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{document.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {document.readTime}
              </span>
              {document.badge && (
                <span className={`rounded-full px-3 py-1.5 font-semibold ${badgeClassName(document.badge)}`}>
                  {document.badge}
                </span>
              )}
              {document.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-50 px-3 py-1.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Issue Summary</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {document.summary} Ikuti langkah-langkah di bawah ini terlebih dahulu. Kalau masalah masih berlanjut setelah semua langkah dicoba,
          Anda bisa lanjut menghubungi tim IT.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Step-by-step Guide</h2>
        <div className="mt-6 space-y-4">
          {document.steps.map((step, index) => (
            <div key={step} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {index + 1}
              </div>
              <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {document.notes && document.notes.length > 0 && (
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Extra Tips / Troubleshooting</h2>
          <div className="mt-5 space-y-3">
            {document.notes.map((note) => (
              <div key={note} className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
                <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p>{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Still need help?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {document.helpText}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tickets"
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition-all hover:opacity-90"
          >
            Create an IT Support Ticket
          </Link>
          <Link
            href="/settings"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Contact the IT Team
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Was this article helpful?</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFeedback('Yes')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
              feedback === 'Yes'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setFeedback('No')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
              feedback === 'No'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {relatedDocuments.length > 0 && (
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Related Articles</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {relatedDocuments.map((item) => (
              <Link
                key={item.slug}
                href={`/knowledge-base/${item.slug}`}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition-colors hover:bg-slate-100"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
