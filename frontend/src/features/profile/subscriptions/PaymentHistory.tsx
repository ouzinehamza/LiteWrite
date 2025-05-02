import { useMemo, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { ApiPaymentHistory } from 'types/ApiSubscriptionPlans';
import usePaymentHistory from './server/usePaymentHistory';
import ApiPaginatedResponse from 'types/ApiPaginatedResponse';
import ApiPaginatedRequestParams from 'types/ApiPaginatedRequestParams';
import { Loader, Text } from '@mantine/core';

import 'mantine-datatable/styles.layer.css';

const PAGE_SIZES = [2, 5, 10, 15, 20];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatus = (record: ApiPaymentHistory) => {
  const today = new Date();
  const startDate = new Date(record.starts_at);
  const endDate = new Date(record.ends_at);

  if (record.cancelled_at) return 'Cancelled';
  if (endDate < today) return 'Ended';
  if (startDate > today) return 'Pending';
  if (today >= startDate && today <= endDate) return 'Active';
  return 'Unknown';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Ended':
      return 'bg-gray-100 text-gray-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const PaymentHistory = ({
  initialPaymentHistory
}: {
  initialPaymentHistory: ApiPaginatedResponse<ApiPaymentHistory>;
}) => {
  // sorting should be local only to reduce api calls
  // and maintain logical table behavior
  const [searchParams, setSearchParams] = useState<ApiPaginatedRequestParams>({
    page: initialPaymentHistory.current_page,
    perPage: initialPaymentHistory.per_page
  });

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'created_at',
    direction: 'desc'
  });

  const {
    data: paymentHistory,
    isLoading,
    error
  } = usePaymentHistory(searchParams);

  const sortedRecords = useMemo(() => {
    if (!paymentHistory?.data) return [];

    return [...paymentHistory.data]
      .map((record) => ({
        ...record,
        status: getStatus(record)
      }))
      .sort((a, b) => {
        const { columnAccessor, direction } = sortStatus;
        const aValue =
          a[columnAccessor as keyof (ApiPaymentHistory & { status: string })];
        const bValue =
          b[columnAccessor as keyof (ApiPaymentHistory & { status: string })];

        if (aValue! < bValue!) return direction === 'asc' ? -1 : 1;
        if (aValue! > bValue!) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [paymentHistory?.data, sortStatus]);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handlePerPageChange = (newPerPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: 1, perPage: newPerPage }));
  };

  const handleSortStatusChange = (newSortStatus: DataTableSortStatus) => {
    setSortStatus(newSortStatus);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Text className="py-4 text-center text-red-600">
        Error loading payment history. Please try again later.
      </Text>
    );
  }

  return (
    <section className="m-auto my-4 w-3/4 rounded-lg bg-white md:w-1/2">
      <h2 className="p-4 text-2xl font-bold text-primary">Purchase History</h2>

      {paymentHistory && paymentHistory?.total > 0 ? (
        <DataTable
          styles={{
            table: {
              backgroundColor: 'white',
              color: 'black'
            },
            pagination: {
              backgroundColor: 'white',
              color: 'black'
            }
          }}
          withTableBorder
          records={sortedRecords}
          columns={[
            {
              accessor: 'id',
              title: 'Transaction id',
              sortable: true
            },
            // {
            //   accessor: 'created_at',
            //   title: 'Date',
            //   render: ({ created_at }) => formatDate(created_at as string),
            //   sortable: true
            // },
            // { accessor: 'plan', title: 'Plan', sortable: true },
            {
              accessor: 'starts_at',
              title: 'Start Date',
              render: ({ starts_at }) => formatDate(starts_at as string),
              sortable: true
            },
            {
              accessor: 'ends_at',
              title: 'End Date',
              render: ({ ends_at }) => formatDate(ends_at as string),
              sortable: true
            },
            {
              accessor: 'status',
              title: 'Status',
              render: ({ status }) => (
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                    status as string
                  )}`}
                >
                  {status as string}
                </span>
              )
            }
          ]}
          totalRecords={paymentHistory.total!}
          recordsPerPage={searchParams.perPage!}
          page={searchParams.page!}
          onPageChange={handlePageChange}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={handlePerPageChange}
          sortStatus={sortStatus}
          onSortStatusChange={handleSortStatusChange}
        />
      ) : (
        <p className="p-4 text-black">No payment history available.</p>
      )}
    </section>
  );
};

export default PaymentHistory;
