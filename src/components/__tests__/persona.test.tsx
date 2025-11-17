import { expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { PersonaDropdown } from "../PersonaDropdown";
import { OrderForm } from "../OrderForm";
import { OrdersList } from "../OrdersList";
import { renderWithPersona } from "../../test-utils";
import { seedPersonas } from "../../personas";

it("allows switching personas from the dropdown", async () => {
  renderWithPersona(<PersonaDropdown />);

  expect(screen.getByLabelText(/active user/i)).toHaveValue(seedPersonas[0].userId);
  await userEvent.selectOptions(screen.getByLabelText(/active user/i), seedPersonas[1].userId);
  await waitFor(() => {
    expect(screen.getByLabelText(/active user/i)).toHaveValue(seedPersonas[1].userId);
  });
});

it("propagates persona selection into the order form submission", async () => {
  const submitted: any[] = [];
  renderWithPersona(
    <>
      <PersonaDropdown />
      <OrderForm onSubmit={(order) => submitted.push(order)} />
    </>
  );

  await userEvent.selectOptions(screen.getByLabelText(/active user/i), seedPersonas[2].userId);
  await userEvent.click(screen.getByRole("button", { name: /submit order/i }));

  expect(submitted[0].userId).toBe(seedPersonas[2].userId);
});

it("shows the submitting persona in the orders list", () => {
  const items = [
    {
      orderId: "abc",
      userId: seedPersonas[0].userId,
      userName: seedPersonas[0].userName,
      avatarUrl: seedPersonas[0].avatarUrl,
      side: "BUY",
      price: 10,
      quantity: 2,
    },
  ];

  renderWithPersona(<OrdersList items={items} />);

  expect(screen.getByText(/submitted by/i)).toHaveTextContent(seedPersonas[0].userName);
  expect(screen.getByAltText(`${seedPersonas[0].userName} avatar`)).toBeInTheDocument();
});
