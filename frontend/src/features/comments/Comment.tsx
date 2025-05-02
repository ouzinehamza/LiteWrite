import { Avatar } from '@mantine/core';
import { format, formatDistanceToNow } from 'date-fns';
import { ApiArticleComment } from 'types/ApiArticle';

const Comment = ({ comment }: { comment: ApiArticleComment }) => {
  return (
    <div className="comment">
      <Avatar
        src={comment.author.avatar}
        name={comment.author.name}
        alt="author avatar"
      />

      <div className="comment__content">
        <h5 className="mb-0 text-[#2CBCFF]">{comment.author.name}</h5>
        <time dateTime={comment.created_at}>
          {format(new Date(comment.created_at), 'dd.MM.yyyy')} -{' '}
          {formatDistanceToNow(new Date(comment.created_at), {
            addSuffix: true
          })}
        </time>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

export default Comment;
