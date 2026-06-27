import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { blogPosts } from '@/data/blog';
import { Badge } from '@/components/Badge';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import { useEffect } from 'react';
import { useMeta } from '@/hooks/useMeta';

function renderMarkdown(content: string): string {
  let html = content
    // Headers
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl md:text-3xl font-normal text-xifoz-dark-text tracking-tight mt-12 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-xifoz-dark-text mt-8 mb-3">$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-xifoz-dark-dim rounded text-sm font-mono text-xifoz-blue">$1</code>')
    // Bullet lists
    .replace(/^- (.*$)/gim, '<li class="flex items-start gap-3 mb-2"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-xifoz-blue flex-shrink-0"></span><span class="text-xifoz-dark-text-muted leading-relaxed">$1</span></li>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="flex items-start gap-3 mb-2"><span class="text-xifoz-blue font-medium flex-shrink-0 mt-0.5">$&</span></li>')
    // Paragraphs (must be last)
    .replace(/^(?!<[hl]|<li|<div|<p|<code)(.*$)/gim, '<p class="text-base text-xifoz-dark-text-muted leading-relaxed mb-4">$1</p>');

  // Wrap consecutive li elements in ul
  html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, '<ul class="mb-6">$&</ul>');
  
  return html;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useMeta({
    title: post?.title || 'Article Not Found',
    description: post?.excerpt || 'Article not found.',
    canonical: post ? `/blog/${post.slug}` : undefined,
    ogImage: post?.image ? `https://xifoz.com${post.image}` : undefined,
  });

  if (!post) {
    return (
      <Container className="pt-32 pb-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-xifoz-dark-text mb-4">Article not found</h1>
          <Link to="/blog" className="text-xifoz-blue hover:underline">
            Back to Blog
          </Link>
        </div>
      </Container>
    );
  }

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      {/* Article Structured Data */}
      {post && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "image": [
              `https://xifoz.com${post.image}`
            ],
            "datePublished": new Date(post.date).toISOString(),
            "author": [{
                "@type": "Person",
                "name": post.author
            }],
            "publisher": {
              "@type": "Organization",
              "name": "XIFOZ",
              "logo": {
                "@type": "ImageObject",
                "url": "https://xifoz.com/android-chrome-512x512.png"
              }
            }
          })
        }} />
      )}

      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-xifoz-dark-base via-xifoz-dark-base/20 to-transparent" />
        <div className="absolute inset-0 bg-xifoz-dark-surface/30" />
      </div>

      {/* Article Content */}
      <Container className="relative z-10 -mt-32 md:-mt-40 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 text-sm text-xifoz-dark-text-muted hover:text-xifoz-dark-text transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </button>

          {/* Article Header */}
          <div className="bg-xifoz-dark-surface rounded-card p-6 md:p-10 border border-xifoz-dark-border mb-8">
            <Badge variant="cyan" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-xifoz-dark-text tracking-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-xifoz-dark-text-muted">
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{post.readingTime}</span>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center gap-1.5 hover:text-xifoz-blue transition-colors ml-auto"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Article Body */}
          <article
            className="prose-xifoz"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-xifoz-dark-border">
              <h2 className="text-xl font-semibold text-xifoz-dark-text mb-6">
                Related Articles
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    to={`/blog/${related.slug}`}
                    className="group"
                  >
                    <div className="aspect-video rounded-lg overflow-hidden mb-3">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-xifoz-dark-text group-hover:text-xifoz-blue transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
