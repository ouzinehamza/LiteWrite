import { Title, TextInput, Button, FileInput, FileButton } from '@mantine/core';
import { useForm } from '@mantine/form';
import CreateArticleFormData from 'types/CreateArticvleFormData';
import useCreateArticle from './server/useCreateArticle';

const CreateArticle = () => {
  const form = useForm<CreateArticleFormData>({
    initialValues: {
      title: '',
      content: ''
    }
  });

  const mutation = useCreateArticle();

  const handleSubmit = (values: CreateArticleFormData) => {
    mutation.mutate(values);
  };

  const handleButtonChange = (payload: File | null) => {
    if (payload) {
      form.setFieldValue('cover', payload);
    }
  };

  return (
    <>
      <Title order={3}>Create Article</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput {...form.getInputProps('title')} label="Title" mb="sm" />
        <TextInput {...form.getInputProps('content')} label="Content" mb="lg" />
        <FileInput
          accept="image/png,image/jpeg"
          label="Cover image"
          mb="md"
          {...form.getInputProps('cover')}
        />
        {/*         <FileButton onChange={handleButtonChange}>
          {(props) => (
            <div
              {...props}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-400"
            >
              Upload
            </div>
          )}
        </FileButton> */}
        <Button type="submit" loading={mutation.isPending}>
          Submit
        </Button>
      </form>
    </>
  );
};

export default CreateArticle;
