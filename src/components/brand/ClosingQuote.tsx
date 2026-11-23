// The founders' quote that closes each content page (prototype `.origin-footer-quote`).
export function ClosingQuote({ quote, author }: { quote: string; author: string }) {
  return (
    <figure className="mb-[60px] rounded-lg border border-line bg-card px-6 py-10 text-center sm:px-10">
      <blockquote className="mb-[15px] font-serif text-[21px] leading-[1.4] text-teal italic">{quote}</blockquote>
      <figcaption className="text-[13px] font-semibold tracking-[0.5px] text-terracotta">{author}</figcaption>
    </figure>
  );
}
