import { Tag } from './ApiTag';
import ApiUser from './ApiUser';

type ArticleTagPivot = { article_id: number; tag_id: number };
type ArticleTag = Tag & { pivot: ArticleTagPivot };

interface ApiArticle {
  id: number;
  title: string;
  content: string;
  cover_url?: string | null;
  is_premium: boolean;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;

  author: ApiUser;
  tags?: ArticleTag[];
}

export interface ApiArticleVersion {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  draftable_type: string;
  draftable_id: string;
}

export interface ApiCommentVersion extends ApiArticleComment {
  histories: ApiArticleVersion[];
}

export interface ApiArticleComment {
  id: number;
  created_at: string;
  updated_at: string;
  content: string;
  status: 'draft' | 'published';
  article_id: string;
  author_id: string;
  author: ApiUser;
}

export default ApiArticle;
