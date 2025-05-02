import { useQuery } from '@tanstack/react-query';
import { getTags } from 'utils/axios';

const useTags = () => {
  return useQuery({
    queryFn: () => getTags(),
    queryKey: ['tags']
  });
};

export default useTags;
