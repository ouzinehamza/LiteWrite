import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import useGetMe from 'features/authentication/server/useGetMe';
import useUpdateProfile from 'features/authentication/server/useUpdateProfile';
import React, { useEffect, useState } from 'react';

import { z } from 'zod';

const editProfileSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().optional(),
    repeatPassword: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.password || data.repeatPassword) {
        return data.password === data.repeatPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['repeatPassword']
    }
  );

type EditProfileForm = z.infer<typeof editProfileSchema>;

const UpdateProfileForm = () => {
  const { data: user } = useGetMe();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: updateProfile } = useUpdateProfile();

  const form = useForm<EditProfileForm>({
    initialValues: {
      email: '',
      name: '',
      password: '',
      repeatPassword: ''
    },
    validate: zodResolver(editProfileSchema)
  });

  const handleSubmit = (data: EditProfileForm) => {
    if (!user) return;
    setIsSubmitting(true);

    updateProfile(
      { userId: user.id, data },
      {
        onSettled: () => {
          notifications.show({
            message: 'Profile updated successfully',
            color: 'green'
          });
          setIsSubmitting(false);
        }
      }
    );
  };

  useEffect(() => {
    form.setValues({ email: user?.email, name: user?.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <form className="w-2/4" onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        {...form.getInputProps('email')}
        label="Email"
        mb="sm"
        styles={{ input: { color: 'black', backgroundColor: 'white' } }}
      />
      <TextInput
        {...form.getInputProps('name')}
        label="Name"
        mb="lg"
        styles={{ input: { color: 'black', backgroundColor: 'white' } }}
      />
      <PasswordInput
        {...form.getInputProps('password')}
        label="Password"
        mb="lg"
        styles={{ input: { color: 'black', backgroundColor: 'white' } }}
      />
      <PasswordInput
        {...form.getInputProps('repeatPassword')}
        label="Repeat password"
        mb="lg"
        styles={{ input: { color: 'black', backgroundColor: 'white' } }}
      />
      <Button
        loading={isSubmitting}
        type="submit"
        radius={'lg'}
        className="!w-full"
      >
        Update
      </Button>
    </form>
  );
};

export default UpdateProfileForm;
