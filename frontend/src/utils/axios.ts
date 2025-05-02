import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import SearchParams from 'features/articles/types/SearchParams';
import ApiArticle, {
  ApiArticleComment,
  ApiArticleVersion,
  ApiCommentVersion
} from 'types/ApiArticle';
import ApiPaginatedResponse from 'types/ApiPaginatedResponse';
import ApiUser from 'types/ApiUser';
import { PAGE_SIZE } from './constants';
import { Tag } from 'types/ApiTag';
import {
  CreateArticlePayload,
  UpdateArticlePayload
} from 'types/ArticleFormData';
import {
  LoginFormSchema,
  RegisterFormSchema
} from 'features/authentication/types/form';
import {
  ApiRegisterResponse,
  ApiLoginResponse
} from 'features/authentication/types/ApiResponse';
import {
  ApiPaymentHistory,
  ApiSubscriptionPlan
} from 'types/ApiSubscriptionPlans';
import { CreditCard } from 'types/CreditCard';
import { appendFormData } from 'utils';
import ApiPaginatedRequestParams from 'types/ApiPaginatedRequestParams';

export const axiosBaseConfig = {
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
};

export const axiosInstance = axios.create(axiosBaseConfig);

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debugging log for requests (only in development mode)
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data
      });
    }

    return config;
  },
  (error: AxiosError) => {
    // Debugging log for request errors (only in development mode)
    if (process.env.NODE_ENV === 'development') {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debugging log for responses (only in development mode)
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Debugging log for response errors (only in development mode)
    if (process.env.NODE_ENV === 'development') {
      console.error('Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

export const login = async (data: LoginFormSchema) => {
  const response = await axiosInstance<ApiLoginResponse>({
    method: 'POST',
    url: '/api/login',
    data
  });

  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance({
    method: 'POST',
    url: '/api/logout'
  });

  return response.data;
};

export const register = async (data: RegisterFormSchema) => {
  const response = await axiosInstance<ApiRegisterResponse>({
    method: 'POST',
    url: '/api/users',
    data
  });

  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance<ApiUser>({
    method: 'GET',
    url: '/api/me'
  });

  return response.data;
};
type UpdateProfile = {
  userId: number;
  data: { email?: string; name?: string; password?: string; avatar?: File };
};

export const updateProfile = async (data: UpdateProfile) => {
  const formData = new FormData();

  Object.keys(data.data).forEach((key) => {
    if (data.data[key as keyof typeof data.data] !== undefined) {
      formData.append(key, data.data[key as keyof typeof data.data] as string);
    }
  });

  formData.append('_method', 'PUT');

  const response = await axiosInstance<ApiUser>({
    method: 'POST',
    url: `/api/users/${data.userId}`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const deleteUser = async (userId: number) => {
  const response = await axiosInstance({
    method: 'DELETE',
    url: `/api/users/${userId}`
  });

  return response.data;
};

export const getArticles = async (searchParams: SearchParams) => {
  const response = await axiosInstance<ApiPaginatedResponse<ApiArticle>>({
    method: 'GET',
    url: '/api/articles',
    params: {
      ...searchParams,
      perPage: searchParams.perPage ?? PAGE_SIZE
    }
  });

  return response.data;
};

export const createArticle = async (data: CreateArticlePayload) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (data[key as keyof typeof data] !== undefined) {
      formData.append(key, data[key as keyof typeof data] as string);
    }
  });

  const response = await axiosInstance<ApiArticle>({
    method: 'POST',
    url: '/api/articles',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const fetchArticle = async (id: number) => {
  const response = await axiosInstance<ApiArticle>({
    method: 'GET',
    url: `/api/articles/${id}`
  });

  return response.data;
};

export const fetchArticleHistory = async (
  searchParams: ApiPaginatedRequestParams & { id: number }
) => {
  const response = await axiosInstance<ApiPaginatedResponse<ApiArticleVersion>>(
    {
      method: 'GET',
      url: `/api/articles/${searchParams.id}/drafts`,
      params: { ...searchParams }
    }
  );

  return response.data;
};

export const updateArticle = async (
  articleId: number,
  data: UpdateArticlePayload
) => {
  const formData = new FormData();
  type Key = keyof typeof data;

  Object.keys(data).forEach((key) => {
    if (data[key as Key] !== undefined) {
      const value = data[key as Key];
      if (Array.isArray(value)) {
        value.forEach((val, idx) => {
          formData.append(`${key}[${idx}]`, String(val));
        });
      } else {
        formData.append(key, data[key as Key] as string);
      }
    }
  });

  formData.append('_method', 'PUT');

  const response = await axiosInstance<ApiUser>({
    method: 'POST',
    url: `/api/articles/${articleId}`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const removeCoverPhoto = async (articleId: number) => {
  const response = await axiosInstance({
    method: 'POST',
    url: `/api/articles/${articleId}/remove-cover`
  });

  return response.data;
};

export const deleteArticle = async (articleId: number) => {
  const response = await axiosInstance({
    method: 'DELETE',
    url: `/api/articles/${articleId}`
  });

  return response.data;
};

export const fetchArticleComments = async (
  id: number,
  searchParams?: ApiPaginatedRequestParams
) => {
  const response = await axiosInstance<ApiPaginatedResponse<ApiArticleComment>>(
    {
      method: 'GET',
      url: `/api/articles/${id}/comments?sort[created_at]=desc&filter[status]=published`,
      params: {
        ...searchParams
      }
    }
  );

  return response.data;
};

export const fetchUsersCommentDrafts = async (
  articleId: number,
  userId: number
) => {
  const response = await axiosInstance<ApiPaginatedResponse<ApiCommentVersion>>(
    {
      method: 'GET',
      url: `/api/articles/${articleId}/comments?sort[created_at]=desc&filter[status]=draft&filter[authorId]=${userId}`
    }
  );

  return response.data.data;
};

export const createArticleComment = async (
  articleId: number,
  data: { content: string; status: 'draft' | 'published' }
) => {
  const response = await axiosInstance({
    method: 'POST',
    url: `/api/articles/${articleId}/comments`,
    data
  });

  return response.data;
};

export const updateArticleComment = async (
  commentId: number,
  data: { content: string; status: 'draft' | 'published' }
) => {
  const response = await axiosInstance({
    method: 'PUT',
    url: `/api/comments/${commentId}`,
    data
  });

  return response.data;
};

export const fetchCommentDrafts = async (commentId: number) => {
  const response = await axiosInstance<
    ApiPaginatedResponse<ApiCommentVersion>[]
  >({
    method: 'GET',
    url: `/api/comments/${commentId}/drafts`
  });

  return response.data;
};

export const getTags = async () => {
  const response = await axiosInstance<Tag[]>({
    method: 'GET',
    url: '/api/tags'
  });

  return response.data;
};

export const fetchSubscriptionPlans = async () => {
  const response = await axiosInstance<ApiSubscriptionPlan[]>({
    method: 'GET',
    url: '/api/subscription-plans'
  });

  return response.data;
};

export const fetchPaymentHistory = async (
  searchParams: ApiPaginatedRequestParams
) => {
  const response = await axiosInstance<ApiPaginatedResponse<ApiPaymentHistory>>(
    {
      method: 'GET',
      url: '/api/subscriptions',
      params: {
        ...searchParams,
        perPage: searchParams.perPage ?? PAGE_SIZE
      }
    }
  );

  return response.data;
};

export const updateSubscription = async (data: {
  plan: ApiSubscriptionPlan;
  creditCard: CreditCard;
}) => {
  const formData = new FormData();
  appendFormData(formData, data);
  formData.append('_method', 'POST');

  const response = await axiosInstance<{ message: string }>({
    method: 'POST',
    url: `/api/subscriptions`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const cancelSubscriptionPlans = async () => {
  const response = await axiosInstance.delete('/api/subscriptions');

  return response.data;
};
