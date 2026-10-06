# Solution notes

The page is a payment list. It loads five payments at a time from `/api/payments` and shows them in a table.

## What the user can do

- Search by payment id. Typing only fills the box. The search runs when they click Search or press Enter. Extra spaces are removed first.
- Filter by currency from a dropdown. That applies straight away, without another click.
- Use both together. A currency change keeps the last search, and a search keeps the chosen currency.
- Clear both, and go back to the first page of the full list. The Clear button shows when a search or a currency is in use.
- Move between pages with Previous and Next. Previous is off on page 1. Next is off on the last page.

## How the list stays in sync

- The request sends the submitted search, the currency, the page, and a page size of 5.
- The text in the box and the search that was actually sent are stored separately, so typing does not refresh the table.
- While a new page or filter is loading, the current rows stay on screen. The spinner shows only for the first load.

## When the request fails

- A missing payment shows "Payment not found."
- A server failure shows "Internal server error. Please try again later."
- Any other failure shows "Something went wrong!"
- Those messages come from the shared text constants, not from the wording in the error response.
