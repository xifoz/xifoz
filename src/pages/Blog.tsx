import { useState } from 'react';
import { useMeta } from '@/hooks/useMeta';
import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { BlogCard } from '@/components/BlogCard';
import { blogPosts } from '@/data/blog';
import { GridCoverage } from '@/components/GridCoverage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const categories = ['All', ...Array.from(new Set(blogPosts.map((post) => post.category)))];

export default function Blog() {
  useMeta({ title: 'Security Insights & Resources', description: "Cybersecurity articles, guides, and threat intelligence from the XIFOZ team.", canonical: '/blog' });
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <>
      {/* Hero */}
      <section ref={ref} className="relative pt-32 pb-12 md:pt-40 md:pb-16 bg-xifoz-base overflow-hidden">
        <GridCoverage className="absolute inset-0" opacity={0.25} />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block transition-all duration-700',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              Blog
            </span>
            <h1
              className={cn(
                'text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-text tracking-tight mb-6 transition-all duration-700 delay-100',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              Security insights & resources
            </h1>
            <p
              className={cn(
                'text-lg md:text-xl text-xifoz-text-secondary leading-relaxed transition-all duration-700 delay-200',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              Expert analysis, practical guides, and the latest trends in cybersecurity.
            </p>
          </div>
        </Container>
      </section>

      {/* Search & Filter */}
      <SectionWrapper background="dim" padding="normal">
        <Container>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-10">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-pill transition-all duration-300',
                    activeCategory === category
                      ? 'bg-xifoz-text text-white'
                      : 'bg-white text-xifoz-text-secondary hover:text-xifoz-text border border-xifoz-border'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xifoz-text-secondary"
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-xifoz-border rounded-pill text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/50 focus:outline-none focus:border-xifoz-border/30 transition-colors"
              />
            </div>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && activeCategory === 'All' && searchQuery === '' && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-xifoz-text mb-5">
                Featured
              </h2>
              <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                {featuredPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    category={post.category}
                    date={post.date}
                    readingTime={post.readingTime}
                    image={post.image}
                    featured
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-xifoz-text mb-5">
              {activeCategory === 'All' && searchQuery === '' ? 'All Articles' : 'Articles'}
            </h2>
            {regularPosts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {regularPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    category={post.category}
                    date={post.date}
                    readingTime={post.readingTime}
                    image={post.image}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xifoz-text-secondary">
                  No articles found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </Container>
      </SectionWrapper>
    </>
  );
}
