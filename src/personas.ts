import personaData from "../personas/personas.json";

export type Persona = {
  userId: string;
  userName: string;
  avatarUrl: string;
  bio: string;
};

export const seedPersonas: Persona[] = personaData as Persona[];

const seedRegistry: Record<string, Persona> = Object.fromEntries(
  seedPersonas.map((persona) => [persona.userId, persona])
);

export function getSeedPersona(userId?: string): Persona {
  if (!userId) {
    return { userId: "unknown", userName: "Unknown User", avatarUrl: "", bio: "" };
  }
  return seedRegistry[userId] ?? { userId, userName: "Unknown User", avatarUrl: "", bio: "" };
}
