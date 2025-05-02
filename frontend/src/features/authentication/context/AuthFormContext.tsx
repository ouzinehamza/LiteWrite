// define the context type

import { createContext, useContext, useState } from 'react';
import { CurrentFormType } from '../types/form';

type AuthFormContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentForm: CurrentFormType;
  setCurrentForm: (form: CurrentFormType) => void;
};

const AuthFormContext = createContext({} as AuthFormContextType);

export const useAuthFormContext = () => {
  const ctx = useContext(AuthFormContext);

  if (!ctx) {
    throw new Error('[useAuthFormContext] must be with the AuthFormProvider');
  }

  return ctx;
};

const AuthFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<CurrentFormType>('login');

  const value = {
    isOpen,
    setIsOpen,
    currentForm,
    setCurrentForm
  };

  return (
    <AuthFormContext.Provider value={value}>
      {children}
    </AuthFormContext.Provider>
  );
};

export default AuthFormProvider;
