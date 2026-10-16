import test from "node:test";
import assert from "node:assert/strict";
import { DATASET } from "../dist/data/orders.js";
import { calculateMetrics, compareField, createReport, getReleaseDecision } from "../dist/evaluator.js";

test("normalizes common quantity and date formats", () => {
  assert.equal(compareField("quantity", 36000, "36,000"), "correct");
  assert.equal(compareField("deliveryDate", "2026-11-18", "2026年11月18日"), "correct");
});

test("distinguishes missing and hallucinated values", () => {
  assert.equal(compareField("materialCode", "M-2401", null), "missing");
  assert.equal(compareField("specialProcess", null, "烫金"), "hallucination");
});

test("V2 improves the fixed dataset without hiding remaining risk", () => {
  const v1 = calculateMetrics(DATASET, "v1");
  const v2 = calculateMetrics(DATASET, "v2");

  assert.equal(v1.accuracy, 70.8);
  assert.equal(v2.accuracy, 95.8);
  assert.equal(v2.highRiskAccuracy, 93.3);
  assert.equal(v2.reviewCount, 2);
  assert.ok(v2.accuracy > v1.accuracy);
});

test("release gate blocks V1 and recommends gray release for V2", () => {
  assert.equal(getReleaseDecision(calculateMetrics(DATASET, "v1")).code, "block");
  assert.equal(getReleaseDecision(calculateMetrics(DATASET, "v2")).code, "gray");
});

test("downloadable report keeps evidence for failed samples", () => {
  const report = createReport(DATASET, "v2");
  assert.equal(report.dataset, "synthetic-order-dataset-v1");
  assert.equal(report.failedSamples.length, 2);
  assert.equal(report.decision.code, "gray");
});
