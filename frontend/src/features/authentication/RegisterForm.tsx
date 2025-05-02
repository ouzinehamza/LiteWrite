import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import React, { useState } from 'react';
import { registerFormSchema, RegisterFormSchema } from './types/form';
import { isAxiosError } from 'axios';
import useRegister from './server/useRegister';
import { notifications } from '@mantine/notifications';
import { useAuthFormContext } from './context/AuthFormContext';

const RegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { setIsOpen, setCurrentForm } = useAuthFormContext();

  const closeModal = () => {
    setIsOpen(false);
  };

  const form = useForm<RegisterFormSchema>({
    initialValues: {
      name: '',
      email: '',
      password: ''
    },
    validate: zodResolver(registerFormSchema)
  });

  const { mutate } = useRegister();

  const handleSubmit = async (values: RegisterFormSchema) => {
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
      <h1 className="mb-4 text-center text-lg font-bold">Register</h1>
      {errorMessage && (
        <p className="w-full text-center text-sm text-rose-500">
          {errorMessage}
        </p>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          {...form.getInputProps('name')}
          label="Name"
          mb="sm"
          placeholder="Enter your Name"
        />

        <TextInput
          {...form.getInputProps('email')}
          label="Email"
          mb="sm"
          placeholder="Enter your Email address"
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
            Have an account? Login{' '}
            <span
              className="cursor-pointer text-primary hover:underline"
              onClick={() => setCurrentForm('login')}
            >
              here
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
