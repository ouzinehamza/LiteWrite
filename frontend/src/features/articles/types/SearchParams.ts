import ApiPaginatedRequestParams from 'types/ApiPaginatedRequestParams';

type FilterParam = {
  authorId?: number;
  tags?: string;
  status?: 'draft' | 'published';
};

interface SearchParams extends ApiPaginatedRequestParams {
  search?: string;
  filter?: FilterParam;
}

export default SearchParams;
