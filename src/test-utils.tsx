import { type ReactElement } from "react";
import { render } from "@testing-library/react";
import { PersonaProvider } from "./PersonaContext";

export function renderWithPersona(ui: ReactElement) {
  return render(<PersonaProvider>{ui}</PersonaProvider>);
}
