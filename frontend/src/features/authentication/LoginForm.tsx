import React from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useState } from 'react';
import useLogin from './server/useLogin';
import { isAxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { loginFormSchema, LoginFormSchema } from './types/form';
import { useAuthFormContext } from './context/AuthFormContext';

const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { setIsOpen, setCurrentForm } = useAuthFormContext();

  const closeModal = () => {
    setIsOpen(false);
  };

  const form = useForm<LoginFormSchema>({
    initialValues: {
      email: '',
      password: ''
    },
    validate: zodResolver(loginFormSchema)
  });

  const { mutate } = useLogin();

  const handleSubmit = async (values: LoginFormSchema) => {
    setIsSubmitting(true);

    mutate(values, {
      onError: (err) => {
        if (isAxiosError(err)) {
          setErrorMessage(err.response?.data.message);
          notifications.show({
            message: err.response?.data.message,
            color: 'red',
            position: 'top-center'
          });
        }
      },
      onSuccess: () => {
        closeModal();
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div>
      <h1 className="mb-4 text-center text-lg font-bold">Login</h1>
      {errorMessage && (
        <p className="w-full text-center text-sm text-rose-500">
          {errorMessage}
        </p>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          {...form.getInputProps('email')}
          label="Email"
          mb="sm"
          placeholder="Enter your email address"
          required
        />
        <PasswordInput
          {...form.getInputProps('password')}
          label="Password"
          mb="lg"
          placeholder="Enter your password"
          required
        />
        <div className="flex flex-row items-center justify-between">
          <Button loading={isSubmitting} type="submit">
            Submit
          </Button>

          <p>
            No account? Register{' '}
            <span
              className="cursor-pointer text-primary hover:underline"
              onClick={() => setCurrentForm('register')}
            >
              here
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
