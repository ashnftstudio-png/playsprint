export interface SeoContent {
  article: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  relatedGames: string[];
}

export const SEO_CONTENT: Record<string, SeoContent> = {};
