import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8)
});

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;

export type CurrentFormType = 'login' | 'register';

export type AuthFormProps = {
  closeModal: () => void;
  switchForm: (form: CurrentFormType) => void;
};
