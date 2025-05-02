import { Modal } from '@mantine/core';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuthFormContext } from './context/AuthFormContext';

const AuthFormModal = () => {
  const { isOpen, setIsOpen, currentForm } = useAuthFormContext();

  return (
    <Modal opened={isOpen} onClose={() => setIsOpen(false)}>
      {currentForm === 'login' ? <LoginForm /> : <RegisterForm />}
    </Modal>
  );
};

export default AuthFormModal;
