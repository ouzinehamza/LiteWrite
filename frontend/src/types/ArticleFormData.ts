import ApiArticle from './ApiArticle';

type CreateArticleFormData = Omit<ApiArticle, 'id' | 'author'>;

export interface CreateArticlePayload
  extends Omit<
    ApiArticle,
    | 'id'
    | 'author'
    | 'tags'
    | 'updated_at'
    | 'updated_at'
    | 'cover_url'
    | 'created_at'
    | 'is_premium'
  > {
  tags?: number[];
  cover?: File;
  created_at?: Date;
  is_premium?: boolean;
}

export interface UpdateArticlePayload
  extends Omit<CreateArticlePayload, 'tags' | 'status' | 'title' | 'content'> {
  added_tags?: number[];
  removed_tags?: number[];
  status?: ApiArticle['status'];
  title?: string;
  content?: string;
}

export default CreateArticleFormData;
