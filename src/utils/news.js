
export const filterByCategory = (articles, category) => {
  if (category === "All") return articles;

  return articles.filter(
    (article) => article.category === category
  );
};

export const validateNews = (article) => {
  const requiredFields = [
    "id",
    "title",
    "snippet",
    "source",
    "url",
    "date",
    "category",
  ];

  return requiredFields.every(
    (field) =>
      article[field] !== undefined &&
      article[field] !== null &&
      article[field] !== ""
  );
};

export const sortNewest = (articles) => {
  return [...articles].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
};

export const sortOldest = (articles) => {
  return [...articles].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};