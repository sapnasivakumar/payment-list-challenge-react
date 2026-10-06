import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { I18N } from "../constants/i18n";
import { API_URL, CURRENCIES } from "../constants";
import type { PaymentSearchResponse } from "../types/payment";
import {
  ClearButton,
  Container,
  ErrorBox,
  FilterRow,
  PaginationButton,
  PaginationRow,
  SearchButton,
  SearchInput,
  Select,
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

async function fetchPayments(
  search: string,
  currency: string,
  page: number,
): Promise<PaymentSearchResponse> {
  const params = new URLSearchParams({
    search,
    currency,
    page: page.toString(),
    pageSize: PAGE_SIZE.toString(),
  });

  const response = await fetch(
    new URL(`${API_URL}?${params}`, window.location.origin),
  );

  if (!response.ok) {
    throw new Error(String(response.status));
  }

  return response.json();
}

function messageFor(error: unknown) {
  const status = error instanceof Error ? error.message : "";
  if (status === "404") {
    return I18N.PAYMENT_NOT_FOUND;
  } else if (status === "500") {
    return I18N.INTERNAL_SERVER_ERROR;
  }
  return I18N.SOMETHING_WENT_WRONG;
}

export const PaymentsPage = () => {
  const [draftSearch, setDraftSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currency, setCurrency] = useState("");
  const [page, setPage] = useState(1);

  const hasActiveFilters = appliedSearch !== "";

  function clearFilters() {
    setDraftSearch("");
    setAppliedSearch("");
    setCurrency("");
    setPage(1);
  }

  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "payments",
      { search: appliedSearch, currency, page, pageSize: PAGE_SIZE },
    ],
    queryFn: () => fetchPayments(appliedSearch, currency, page),
  });

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      <FilterRow>
        <SearchInput
          type="search"
          aria-label={I18N.SEARCH_LABEL}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          value={draftSearch}
          onChange={(event) => setDraftSearch(event.target.value)}
        />
        <Select
          aria-label={I18N.CURRENCY_FILTER_LABEL}
          value={currency}
          onChange={(event) => {
            setCurrency(event.target.value);
            setPage(1);
          }}
        >
          <option value="">{I18N.CURRENCIES_OPTION}</option>
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
        <SearchButton
          type="button"
          onClick={() => {
            (setAppliedSearch(draftSearch), setPage(1));
          }}
        >
          {I18N.SEARCH_BUTTON}
        </SearchButton>
        {hasActiveFilters && (
          <ClearButton type="button" onClick={clearFilters}>
            {I18N.CLEAR_FILTERS}
          </ClearButton>
        )}
      </FilterRow>
      {isPending && <Spinner />}
      {isError && <ErrorBox>{messageFor(error)}</ErrorBox>}
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
          <PaginationRow>
            <PaginationButton
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={page === 1}
            >
              {I18N.PREVIOUS_BUTTON}
            </PaginationButton>
            <span>
              {I18N.PAGE_LABEL} {page}
            </span>
            <PaginationButton
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page * PAGE_SIZE >= data.total}
            >
              {I18N.NEXT_BUTTON}
            </PaginationButton>
          </PaginationRow>
        </TableWrapper>
      )}
    </Container>
  );
};
