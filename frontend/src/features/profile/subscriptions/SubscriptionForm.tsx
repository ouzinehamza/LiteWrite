import { z } from 'zod';
import { creditCardSchema } from '../../../types/CreditCard';
import { useForm, zodResolver } from '@mantine/form';
import { ApiSubscriptionPlan } from 'types/ApiSubscriptionPlans';
import {
  Button,
  TextInput,
  NumberInput,
  Box,
  SegmentedControl,
  Text
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useUpdateSubscription from './server/useUpdateSubscription';
import ApiUser from 'types/ApiUser';

const subscriptionFormSchema = z.object({
  user_id: z.number(),
  plan: z.object({
    title: z.string(),
    code: z.string(),
    duration: z.number(),
    price: z.number()
  }),
  creditCard: creditCardSchema
});

type SubscriptionForm = z.infer<typeof subscriptionFormSchema>;

const SubscriptionForm = ({
  userId,
  subscriptionPlans
}: {
  userId: ApiUser['id'];
  subscriptionPlans: ApiSubscriptionPlan[];
}) => {
  const updateSubscription = useUpdateSubscription();

  const form = useForm<SubscriptionForm>({
    initialValues: {
      user_id: userId,
      plan: { ...subscriptionPlans[0] },
      creditCard: {
        card_number: '', // use 5555555555554444 to test
        cvv: '',
        expiry_date: {
          month: 1,
          year: new Date().getFullYear()
        },
        name: '',
        surname: '',
        address: ''
      }
    },
    validate: zodResolver(subscriptionFormSchema)
  });

  const handleSubmit = (data: SubscriptionForm) => {
    updateSubscription.mutate(data);

    setTimeout(() => {
      notifications.show({
        message: 'Subscription processed successfully',
        color: 'green'
      });
    }, 200);

    if (updateSubscription.isError) {
      setTimeout(() => {
        notifications.show({
          message: updateSubscription.error.message,
          color: 'red'
        });
      }, 200);
    }

    form.reset();
  };

  const handlePlanChange = (value: string) => {
    const selectedPlan = subscriptionPlans.find((plan) => plan.title === value);
    if (selectedPlan) {
      form.setFieldValue('plan', selectedPlan);
    }
  };

  function formatPrice(price: number) {
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    });

    return formatter.format(price);
  }

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className="m-auto mt-8 w-3/4 md:w-1/2"
    >
      <SegmentedControl
        data={subscriptionPlans.map((plan) => ({
          label: plan.title,
          value: plan.title
        }))}
        value={form.values.plan.title}
        onChange={handlePlanChange}
        fullWidth
        p={0}
        transitionDuration={0}
        classNames={{
          control: 'bg-white data-[active=true]:bg-primary p-2',
          label: 'text-black',
          innerLabel: 'text-black'
        }}
      />
      <Box className="my-6 flex justify-between">
        <p>
          <span className="font-bold text-primary">
            {formatPrice(
              form.getValues().plan.price / form.getValues().plan.duration
            )}
          </span>{' '}
          per month
        </p>
        <p>
          Total:{' '}
          <span className="font-bold text-primary">
            {formatPrice(form.getValues().plan.price)}
          </span>
        </p>
      </Box>
      <TextInput
        label="Card Number"
        {...form.getInputProps('creditCard.card_number')}
        mb="sm"
        styles={{
          input: {
            backgroundColor: 'white',
            color: 'black'
          }
        }}
        error={form.errors['creditCard.card_number']}
      />
      <Box className="mb-sm flex gap-4">
        <TextInput
          label="CVV"
          {...form.getInputProps('creditCard.cvv')}
          mb="sm"
          styles={{
            input: {
              backgroundColor: 'white',
              color: 'black'
            }
          }}
          error={form.errors['creditCard.cvv']}
        />
        <NumberInput
          label="Expiry Month"
          min={1}
          max={12}
          {...form.getInputProps('creditCard.expiry_date.month')}
          styles={{
            input: {
              backgroundColor: 'white',
              color: 'black'
            }
          }}
          error={form.errors['creditCard.expiry_date.month']}
        />
        <NumberInput
          label="Expiry Year"
          min={new Date().getFullYear()}
          {...form.getInputProps('creditCard.expiry_date.year')}
          styles={{
            input: {
              backgroundColor: 'white',
              color: 'black'
            }
          }}
          error={form.errors['creditCard.expiry_date.year']}
        />
      </Box>
      {form.errors['creditCard.expiry_date'] && (
        <Text color="red" size="sm" mb="sm">
          {form.errors['creditCard.expiry_date']}
        </Text>
      )}
      <TextInput
        label="Name"
        {...form.getInputProps('creditCard.name')}
        mb="sm"
        styles={{
          input: {
            backgroundColor: 'white',
            color: 'black'
          }
        }}
        error={form.errors['creditCard.name']}
      />
      <TextInput
        label="Surname"
        {...form.getInputProps('creditCard.surname')}
        mb="sm"
        styles={{
          input: {
            backgroundColor: 'white',
            color: 'black'
          }
        }}
        error={form.errors['creditCard.surname']}
      />
      <TextInput
        label="Address"
        {...form.getInputProps('creditCard.address')}
        mb="lg"
        styles={{
          input: {
            backgroundColor: 'white',
            color: 'black'
          }
        }}
        error={form.errors['creditCard.address']}
      />
      <Button
        loading={updateSubscription.isPending}
        type="submit"
        radius="lg"
        className="!w-full"
      >
        Subscribe
      </Button>
    </form>
  );
};

export default SubscriptionForm;
