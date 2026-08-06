import assert from "node:assert/strict";
import test from "node:test";
import { evaluateHsts } from "../src/hsts-policy.js";

test("HSTS rozróżnia brak, wyłączenie, krótki i docelowy max-age", () => {
  const cases = [
    { value: "", status: "warning", recommendation: /Włącz HSTS/ },
    { value: "max-age=0", status: "fail", observation: /polityka jest wyłączona/, recommendation: /Włącz HSTS/ },
    { value: "max-age=15552000", status: "warning", observation: /HSTS jest aktywny/, recommendation: /wydłuż max-age do co najmniej 31536000/ },
    { value: "max-age=31536000; includeSubDomains", status: "pass", observation: /includeSubDomains/, recommendation: /^$/ },
  ];

  for (const expected of cases) {
    const result = evaluateHsts(expected.value, true);
    assert.equal(result.status, expected.status, expected.value || "brak HSTS");
    if (expected.observation) assert.match(result.observation, expected.observation);
    assert.match(result.recommendation, expected.recommendation);
  }
});

test("HSTS nie ma zastosowania do końcowego adresu HTTP", () => {
  const result = evaluateHsts("max-age=31536000", false);
  assert.equal(result.status, "not_applicable");
  assert.equal(result.recommendation, "");
});
