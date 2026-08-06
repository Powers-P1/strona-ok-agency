import assert from "node:assert/strict";
import test from "node:test";
import { formatPolishCount } from "../src/polish-copy.js";

const signalForms = {
  one: "czytelny sygnał",
  few: "czytelne sygnały",
  many: "czytelnych sygnałów",
};

test("polska odmiana liczebników obsługuje formy one, few i many", () => {
  assert.equal(formatPolishCount(0, signalForms), "0 czytelnych sygnałów");
  assert.equal(formatPolishCount(1, signalForms), "1 czytelny sygnał");
  assert.equal(formatPolishCount(2, signalForms), "2 czytelne sygnały");
  assert.equal(formatPolishCount(5, signalForms), "5 czytelnych sygnałów");
  assert.equal(formatPolishCount(12, signalForms), "12 czytelnych sygnałów");
  assert.equal(formatPolishCount(22, signalForms), "22 czytelne sygnały");
});
