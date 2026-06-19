import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { BlogCard } from '@/components/BlogCard';
import { blogPosts } from '@/data/blog';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function SecureVault() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured).slice(0, 3);

  return (
    <SectionWrapper background="dim" id="blog">
      <Container>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left - Editorial text */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block">
              Insights
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-xifoz-text leading-tight mb-6">
              Why over 1,000 companies chose not to take security seriously, and what you can learn from their mistakes
            </h2>
            <p className="text-base text-xifoz-text-secondary leading-relaxed mb-8">
              Stay informed with expert analysis, practical guides, and the latest trends in cybersecurity.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-xifoz-blue hover:gap-3 transition-all duration-300"
            >
              Explore All Articles
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right - Blog cards */}
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
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
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
