import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { I18N } from "../constants/i18n";
import { API_URL } from "../constants";
import type { PaymentSearchResponse } from "../types/payment";
import {
  Container,
  Spinner,
  StatusBadge,
  Table,
  TableBodyWrapper,
  TableCell,
  TableHeader,
  TableHeaderRow,
  TableHeaderWrapper,
  TableRow,
  TableWrapper,
  Title,
} from "./components";

const PAGE_SIZE = 5;

async function fetchPayments(): Promise<PaymentSearchResponse> {
  const params = new URLSearchParams({
    page: "1",
    pageSize: PAGE_SIZE.toString(),
  });

  const response = await fetch(
    new URL(`${API_URL}?${params}`, window.location.origin),
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch payments: ${response.statusText}`);
  }

  return response.json();
}

export const PaymentsPage = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["payments", { page: 1, pageSize: PAGE_SIZE }],
    queryFn: fetchPayments,
  });

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      {isPending && <Spinner />}
      {isError && <p>{I18N.SOMETHING_WENT_WRONG}</p>}
      {data && (
        <TableWrapper>
          <Table>
            <TableHeaderWrapper>
              <TableHeaderRow>
                <TableHeader>{I18N.TABLE_HEADER_PAYMENT_ID}</TableHeader>
                <TableHeader>{I18N.TABLE_HEADER_DATE}</TableHeader>
                <TableHeader>{I18N.TABLE_HEADER_AMOUNT}</TableHeader>
                <TableHeader>{I18N.TABLE_HEADER_CUSTOMER}</TableHeader>
                <TableHeader>{I18N.TABLE_HEADER_CURRENCY}</TableHeader>
                <TableHeader>{I18N.TABLE_HEADER_STATUS}</TableHeader>
              </TableHeaderRow>
            </TableHeaderWrapper>
            <TableBodyWrapper>
              {data.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>
                    {format(new Date(payment.date), "dd/MM/yyyy, HH:mm:ss")}
                  </TableCell>
                  <TableCell>{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {payment.customerName || I18N.EMPTY_CUSTOMER}
                  </TableCell>
                  <TableCell>
                    {payment.currency || I18N.EMPTY_CURRENCY}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status}>
                      {payment.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBodyWrapper>
          </Table>
        </TableWrapper>
      )}
    </Container>
  );
};
