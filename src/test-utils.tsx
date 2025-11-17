import { type ReactElement } from "react";
import { render } from "@testing-library/react";
import { PersonaProvider } from "./PersonaContext";
import { seedPersonas, type Persona } from "./personas";

type PersonaTestOptions = {
  personas?: Persona[];
};

export function renderWithPersona(ui: ReactElement, options: PersonaTestOptions = {}) {
  const testPersonas = options.personas ?? seedPersonas;
  return render(
    <PersonaProvider
      initialPersonas={testPersonas}
      fetcher={async () => testPersonas}
      autoLoad={false}
    >
      {ui}
    </PersonaProvider>
  );
}
