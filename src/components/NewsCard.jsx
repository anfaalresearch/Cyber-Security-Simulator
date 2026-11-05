import { motion } from "framer-motion";
import { ExternalLink, Calendar } from "lucide-react";

export const NewsCard = ({ article }) => {
  const { title, snippet, source, url, date, category } = article;

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-xl p-5 flex flex-col h-full group transition-shadow duration-300 hover:neon-border"
    >
      {/* Category and Date */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20">
          {category}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={13} />
          {formattedDate}
        </span>
      </div>

      {/* Article Title */}
      <h3 className="text-lg font-semibold text-white leading-snug mb-3 group-hover:text-neon-green transition-colors">
        {title}
      </h3>

      {/* Article Description */}
      <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-grow">
        {snippet}
      </p>

      {/* Source and External Link */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
        <span className="text-xs text-slate-500 font-mono">
          {source}
        </span>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-neon-green hover:text-neon-cyan transition-colors whitespace-nowrap"
          aria-label={`Read ${title} from ${source}`}
        >
          Read More
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.article>
  );
};