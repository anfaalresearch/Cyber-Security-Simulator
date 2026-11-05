import { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { sortNewest, sortOldest, filterByCategory } from "../utils/news";
import { news, categories } from "../data/news";
import { NewsCard } from "../components/NewsCard";
import { SectionTitle } from "../components/SectionTitle";

export const CyberNews = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const filteredNews = useMemo(() => {
    const filtered = filterByCategory(news, activeCategory);

    return sortOrder === "latest"
        ? sortNewest(filtered)
        : sortOldest(filtered);

    }, [activeCategory, sortOrder]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">

        {/* Page heading */}
        <SectionTitle
          title="Cybersecurity News"
          subtitle="Latest updates and insights from the world of cybersecurity."
        />

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 my-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === category
                  ? "bg-neon-green text-cyber-black border-neon-green"
                  : "bg-transparent text-slate-400 border-cyber-border hover:border-neon-green hover:text-neon-green"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* News count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Newspaper size={16} />
                <span>{filteredNews.length} articles found</span>
            </div>

            <div className="flex items-center gap-3">
                <label
                htmlFor="news-sort"
                className="text-sm text-slate-400"
                >
                Sort by:
                </label>

                <select
                id="news-sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-cyber-card border border-cyber-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-neon-green"
                >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                </select>
            </div>

            </div>

        {/* News cards */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredNews.map((article) => (
               <NewsCard key={article.id} article={article} />
             ))}   </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            No news articles found in this category.
          </div>
        )}

      </div>
    </div>
  );
};