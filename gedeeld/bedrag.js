"use strict";

// Gedeeld door de snelcontrole en de invoer in A.1. Vereist roundToTwoDecimals
// (berekeningen/gedeeld/dashboard-berekeningen.js).

// Leest een bedrag zoals het op een formulier of in een systeem staat:
// "12.345,67", "12345,67", "€ 12.345", "12,345.67", "12345.67" of "-1.200".
// Leeg geeft null. Ongeldige invoer geeft een fout.
function parseDutchAmount(raw, { signed = false, label = "Bedrag" } = {}) {
  if (raw === undefined || raw === null) return null;
  let text = String(raw).trim().replace(/[€\s ]/g, "");
  if (text === "") return null;
  let negative = false;
  if (/^[-−–]/.test(text)) {
    negative = true;
    text = text.slice(1);
  }
  if (!/^[\d.,]+$/.test(text)) throw new Error(`${label}: "${raw}" is geen geldig bedrag.`);
  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  let normalized;
  if (lastComma >= 0 && lastDot >= 0) {
    // Het laatste scheidingsteken is het decimaalteken.
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    normalized = text.split(thousands).join("").replace(decimal, ".");
  } else if (lastComma >= 0) {
    // Eén komma is in Nederlandse notatie het decimaalteken ("1234,5").
    // Meerdere komma's zijn Engelse duizendtallen ("1,234,567").
    const parts = text.split(",");
    if (parts.length === 2) {
      normalized = text.replace(",", ".");
    } else if (parts.slice(1).every((part) => part.length === 3)) {
      normalized = parts.join("");
    } else {
      throw new Error(`${label}: "${raw}" is geen geldig bedrag.`);
    }
  } else if (lastDot >= 0) {
    const parts = text.split(".");
    // Eén punt met één of twee cijfers erachter is een decimaalpunt ("1234.5");
    // anders zijn het duizendtallen ("12.345" of "1.234.567").
    const isDecimal = parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2;
    if (!isDecimal && parts.slice(1).some((part) => part.length !== 3)) {
      throw new Error(`${label}: "${raw}" is geen geldig bedrag.`);
    }
    normalized = isDecimal ? text : parts.join("");
  } else {
    normalized = text;
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error(`${label}: "${raw}" is geen geldig bedrag.`);
  const value = Number(normalized) * (negative ? -1 : 1);
  if (!signed && value < 0) throw new Error(`${label} mag niet negatief zijn.`);
  return roundToTwoDecimals(value);
}
