'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { Search, ChevronRight, ArrowRight, Clock3 } from 'lucide-react';
import { getLatestDocuments, getPopularDocuments, knowledgeDocuments, knowledgeGroups } from '@/data/knowledge-base';

export default function KnowledgeBasePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const articleListRef = useRef<HTMLDivElement | null>(null);

  const popularDocuments = useMemo(() => getPopularDocuments(), []);
  const latestDocuments = useMemo(() => getLatestDocuments(), []);

  const filteredDocuments = useMemo(() => {
    return knowledgeDocuments.filter((document) => {
      const matchCategory = !selectedCategory || document.categorySlug === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        document.title.toLowerCase().includes(query) ||
        document.summary.toLowerCase().includes(query) ||
        document.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeCategory = useMemo(() => {
    return knowledgeGroups.find((group) => group.slug === selectedCategory) || null;
  }, [selectedCategory]);

  const badgeClassName = (badge: string | null) => {
    if (badge === 'Baru') {
      return 'bg-sky-50 text-sky-700';
    }

    if (badge === 'Populer') {
      return 'bg-emerald-50 text-emerald-700';
    }

    return 'bg-slate-100 text-slate-500';
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory((current) => current === slug ? null : slug);

    window.setTimeout(() => {
      articleListRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(244,248,255,0.96)_100%)] p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Guides</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">IT Help Center</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Find quick solutions to common issues without creating a ticket.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search issues or keywords..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Guide Categories</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Choose the topic that fits best</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {knowledgeGroups.map((group) => (
            <button
              key={group.slug}
              type="button"
              onClick={() => handleCategorySelect(group.slug)}
              className={`rounded-[1.7rem] border p-5 text-left transition-all ${
                selectedCategory === group.slug
                  ? 'border-[#b9d5f5] bg-[rgba(220,236,255,0.65)] shadow-sm'
                  : 'border-[var(--border)] bg-white/90 shadow-sm hover:border-[#c7d8ee] hover:bg-[var(--surface-soft)]'
              } cursor-pointer`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <group.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{group.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  {group.documents.length} articles
                </p>
                <span className="text-xs font-semibold text-primary">
                  {selectedCategory === group.slug ? 'Filtered' : 'View articles'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Popular Articles</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Most viewed</h2>
            </div>
            <Link href="/tickets" className="text-sm font-semibold text-primary transition-colors hover:text-[var(--primary-deep)]">
              Need help?
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {popularDocuments.map((document) => (
              <Link
                key={document.slug}
                href={`/knowledge-base/${document.slug}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4 transition-colors hover:bg-white"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{document.title}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{document.category}</span>
                    <span>•</span>
                    <span>{document.readTime}</span>
                    {document.badge && (
                      <>
                        <span>•</span>
                        <span className={`rounded-full px-2 py-1 font-semibold ${badgeClassName(document.badge)}`}>
                          {document.badge}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Latest Articles</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Recently added</h2>
          </div>

          <div className="mt-6 space-y-3">
            {latestDocuments.map((document) => (
              <Link
                key={document.slug}
                href={`/knowledge-base/${document.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4 transition-colors hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{document.title}</p>
                  {document.badge && (
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClassName(document.badge)}`}>
                      {document.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{document.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section ref={articleListRef} className="rounded-[2rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Article List</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {activeCategory ? activeCategory.title : 'All guides'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {activeCategory
                ? activeCategory.description
                : 'Pick a category to narrow the list, or search directly from the search field.'}
            </p>
          </div>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-[var(--primary-deep)]"
            >
              View all topics
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4">
          {filteredDocuments.length > 0 ? filteredDocuments.map((document) => (
            <Link
              key={document.slug}
              href={`/knowledge-base/${document.slug}`}
              className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface-soft)] p-5 transition-colors hover:bg-white"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{document.title}</h3>
                    {document.badge && (
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClassName(document.badge)}`}>
                        {document.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{document.summary}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  <span>{document.readTime}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          )) : (
            <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No guides match the selected category or search keyword.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
