import { useState } from 'react';
import { Button, Modal, Text, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import useCancelSubscriptionPlan from './server/useCancelSubscription';
import { notifications } from '@mantine/notifications';

const CancelSubscription = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const cancel = useCancelSubscriptionPlan();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync();
      close();

      notifications.show({
        message: 'Subscription cancelled'
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    }
  };

  return (
    <div className="mx-auto my-4 w-1/2">
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setError(null);
        }}
        centered
        title="Cancel subscription"
      >
        <Text className="mx-auto">This action cannot be undone</Text>

        {error && (
          <Alert title="Error" color="red" className="my-4">
            {error}
          </Alert>
        )}

        <div className="my-4 flex gap-4">
          <Button
            onClick={handleCancel}
            loading={cancel.isPending}
            variant="outline"
            color="#ff2cb5"
            fullWidth
            radius={'xl'}
          >
            Cancel Subscription
          </Button>
          <Button
            onClick={() => {
              close();
              setError(null);
            }}
            type="submit"
            radius="lg"
            className="!w-full"
          >
            No, Keep My Subscription
          </Button>
        </div>
      </Modal>

      <Button
        onClick={open}
        variant="outline"
        color="#ff2cb5"
        fullWidth
        radius={'xl'}
      >
        Cancel Subscription
      </Button>
    </div>
  );
};

export default CancelSubscription;
