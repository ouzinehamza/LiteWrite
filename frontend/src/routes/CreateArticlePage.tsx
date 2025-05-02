import {
  Avatar,
  Button,
  InputLabel,
  Switch,
  Textarea,
  TextInput
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import useGetMe from 'features/authentication/server/useGetMe';
import { DatePickerInput } from '@mantine/dates';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { url } from 'utils';
import { z } from 'zod';
import useArticle from 'features/articles/server/useArticle';
import { useEffect, useRef, useState } from 'react';
import ArticleTagInput from 'features/articles/ArticleTagInput';
import { Tag } from 'types/ApiTag';
import useCreateArticle from 'features/articles/server/useCreateArticle';
import { notifications } from '@mantine/notifications';
import useUpdateArticle from 'features/articles/server/useUpdateArticle';
import DeleteArticleModal from 'features/articles/DeleteArticleModal';
import { useDisclosure } from '@mantine/hooks';

const articleSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  content: z.string(),
  is_premium: z.boolean().default(false),
  created_at: z.date().optional()
});

type ArticleSchema = z.infer<typeof articleSchema>;

const CreateArticle = () => {
  const { data: user } = useGetMe();
  const searchParams = useSearchParams();
  const navigate = useNavigate();
  const [opened, { close, open }] = useDisclosure();

  const articleId = searchParams[0].get('id');

  const { mutate: createArticle } = useCreateArticle();
  const { mutate: updateArticle } = useUpdateArticle(
    parseInt(articleId ?? '', 10) ?? 0
  );

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<File | undefined>();

  const inputFileRef = useRef<HTMLInputElement>(null);

  const { data: existingArticle } = useArticle(
    parseInt(articleId ?? '', 10) ?? 0
  );

  const form = useForm<ArticleSchema>({
    validate: zodResolver(articleSchema)
  });

  const handleSubmit = (data: ArticleSchema) => {
    if (articleId) {
      if (!existingArticle?.tags) return;
      // update article

      // tags that didn't exist in the original article tag list
      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const addedTags = selectedTagIds.filter(
        (id) => !existingArticle.tags?.map((tag) => tag.id).includes(id)
      );

      // tags that exists in the original article tag list but don't exist anymore
      const removedTags = existingArticle.tags
        .map((tag) => tag.id)
        .filter((id) => !selectedTagIds.includes(id));

      updateArticle(
        {
          ...data,
          added_tags: addedTags,
          removed_tags: removedTags,
          cover: image
        },
        {
          onSettled: (data) => {
            if (!data) return;
            notifications.show({
              message: 'Article updated successfully'
            });
            if (data) {
              navigate(`/article/${data.id}`);
            }
          }
        }
      );
    } else {
      createArticle(
        {
          ...data,
          tags: selectedTags.map((tag) => tag.id),
          cover: image,
          status: 'published'
        },
        {
          onSettled: (data) => {
            if (!data) return;
            notifications.show({
              message: 'Article created successfully'
            });
            if (data) {
              navigate(`/article/${data.id}`);
            }
          }
        }
      );
    }
  };

  useEffect(() => {
    if (existingArticle) {
      form.setValues({
        title: existingArticle.title,
        content: existingArticle.content,
        created_at: new Date(existingArticle.created_at),
        is_premium: existingArticle.is_premium
      });

      existingArticle.tags &&
        setSelectedTags(
          existingArticle.tags.map((tag) => ({ id: tag.id, name: tag.name }))
        );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingArticle]);

  return (
    <main>
      {existingArticle && (
        <DeleteArticleModal
          isOpen={opened}
          closeModal={close}
          articleId={existingArticle.id}
        />
      )}
      <section className="profileHero">
        <div className="container--profileHero">
          <div className="profileHero__left">
            <h1>Create / Edit article</h1>
            <ul>
              <li>
                <Link to="/profile/">&lt;- Back to profile</Link>
              </li>
              {articleId && (
                <li>
                  <Link to={`/article/${articleId}`}>View article</Link>
                </li>
              )}
            </ul>
          </div>
          <div className="profileHeroImage">
            <Avatar
              className="profileHeroImage__image"
              src={url(user?.avatar || '')}
              name={user?.name}
              alt={`profile_image_${user?.name}`}
            />
          </div>
        </div>
      </section>

      <section className="container !my-8 flex w-full flex-col gap-4">
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex w-full flex-col gap-4"
        >
          <div className="mx-10 flex flex-wrap justify-between">
            <div className="flex w-[45%] flex-col gap-2">
              <TextInput
                {...form.getInputProps('title')}
                label="Title"
                styles={{
                  input: {
                    backgroundColor: 'white',
                    color: 'black'
                  }
                }}
                mb="sm"
              />
              <TextInput
                {...form.getInputProps('slug')}
                label="Slug"
                mb="lg"
                styles={{
                  input: {
                    backgroundColor: 'white',
                    color: 'black'
                  }
                }}
              />
              <Textarea
                {...form.getInputProps('content')}
                label="Content"
                mb="lg"
                rows={10}
                styles={{
                  input: {
                    backgroundColor: 'white',
                    color: 'black'
                  }
                }}
              />

              <div>
                <InputLabel htmlFor="featured-image">Featured image</InputLabel>

                <div
                  className="h-12 bg-white p-3 text-sm text-black"
                  onClick={() => inputFileRef.current?.click()}
                >
                  {image ? image.name : 'Select image'}
                </div>

                <TextInput
                  ref={inputFileRef}
                  name="featured-image"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      setImage(file);
                    } else {
                      // Handle invalid file type
                      alert('Please select an image file');
                      // Clear the input
                      e.target.value = '';
                    }
                  }}
                  type="file"
                  accept="image/*"
                  label="Featured image"
                  mb="lg"
                  className="hidden"
                />
              </div>
            </div>
            <div className="flex w-[45%] flex-col gap-2">
              {user?.has_active_subscription && (
                <div>
                  <Switch
                    className="py-6"
                    checked={form.getValues().is_premium}
                    labelPosition="left"
                    label="Is this a premium article?"
                    {...form.getInputProps('is_premium')}
                  />
                </div>
              )}

              <DatePickerInput
                label="Pick date"
                placeholder="Pick date"
                className="w-full"
                styles={{
                  input: {
                    backgroundColor: 'white',
                    color: 'black'
                  }
                }}
                // value={value}
                // onChange={setValue}
              />

              <div>
                <InputLabel>Tags</InputLabel>
                <ArticleTagInput
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                />
              </div>
            </div>
          </div>

          <Button variant={'primary'} className="mx-auto !w-1/2" type="submit">
            {articleId ? 'Update' : 'Create'}
          </Button>
        </form>

        {existingArticle && (
          <Button
            variant={'subtle'}
            color="red"
            className="mx-auto !w-2/4"
            onClick={() => open()}
          >
            Delete article
          </Button>
        )}
      </section>
    </main>
  );
};

export default CreateArticle;
