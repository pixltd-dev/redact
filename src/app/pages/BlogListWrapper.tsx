import { useParams } from 'react-router-dom';
import BlogList from './BlogList';

export const BlogListWrapper = () => {
  const { category } = useParams();
  return <BlogList key={category || 'all'} />;
};