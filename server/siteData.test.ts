import { describe, expect, it } from "vitest";
import { programs, services } from "../client/src/lib/siteData";

describe("ICX site catalog", () => {
  it("exposes all ten first-level services with dedicated routes", () => {
    expect(services).toHaveLength(10);
    expect(new Set(services.map(service => service.slug)).size).toBe(10);
    expect(services.every(service => service.tabs.length >= 4)).toBe(true);
    expect(services.every(service => service.tabs.length >= 5)).toBe(true);
    expect(services.every(service => service.subservices.length === service.tabs.length)).toBe(true);
    expect(services.every(service => service.subservices.every(items => items.length >= 3))).toBe(true);
    expect(new Set(services.map(service => service.architecture)).size).toBe(10);
  });

  it("includes an admissions example for every requested country", () => {
    const requestedCountries = ["France", "Canada", "USA", "Chine", "Russie", "Roumanie", "Pologne"];
    expect(new Set(programs.map(program => program.country))).toEqual(new Set(requestedCountries));
    expect(programs.every(program => program.documents.length >= 4)).toBe(true);
    expect(programs.length).toBeGreaterThanOrEqual(16);
    expect(programs.some(program => program.university.includes("Babeș-Bolyai") && program.city === "Cluj-Napoca")).toBe(true);
  });
});
