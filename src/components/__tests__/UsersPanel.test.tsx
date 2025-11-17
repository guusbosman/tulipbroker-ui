import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UsersPanel } from "../UsersPanel";
import type { Persona } from "../../personas";
import { PersonaContext } from "../../PersonaContext";

const seed: Persona[] = [
  {
    userId: "clusius",
    userName: "Carolus Clusius",
    avatarUrl: "/avatars/clusius.png",
    bio: "Botanist",
  },
  {
    userId: "oosterwijck",
    userName: "Maria van Oosterwijck",
    avatarUrl: "/avatars/oosterwijck.png",
    bio: "Painter",
  },
];

function renderWithContext(overrides: Partial<React.ContextType<typeof PersonaContext>> = {}) {
  const value = {
    personas: seed,
    activePersona: seed[0],
    status: "ready" as const,
    error: undefined,
    setActivePersona: vi.fn(),
    refreshPersonas: vi.fn(),
    createPersona: vi.fn().mockResolvedValue(seed[0]),
    updatePersona: vi.fn().mockResolvedValue(seed[0]),
    deletePersona: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  return render(
    <PersonaContext.Provider value={value}>
      <UsersPanel />
    </PersonaContext.Provider>
  );
}

describe("UsersPanel", () => {
  it("lists existing personas", () => {
    renderWithContext();
    expect(screen.getByAltText(/Carolus Clusius avatar/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Maria van Oosterwijck avatar/i)).toBeInTheDocument();
  });

  it("submits updated bio", async () => {
    const updatePersona = vi.fn().mockResolvedValue({ ...seed[0], bio: "Dutch botanist" });
    renderWithContext({ updatePersona });

    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    const bioField = screen.getByLabelText(/bio/i);
    await userEvent.clear(bioField);
    await userEvent.type(bioField, "Dutch botanist");
    await userEvent.click(screen.getByRole("button", { name: /update user/i }));

    await waitFor(() => expect(updatePersona).toHaveBeenCalledWith("clusius", expect.any(Object)));
  });

  it("validates avatar file type", async () => {
    renderWithContext();
    const fileInput = screen.getByLabelText(/avatar/i, { selector: "input" }) as HTMLInputElement;
    const badFile = new File(["xxxxx"], "avatar.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [badFile] } });
    await waitFor(() =>
      expect(screen.getByText(/avatar must be a png or jpeg image/i)).toBeInTheDocument()
    );
  });
});
