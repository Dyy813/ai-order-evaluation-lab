export const FIELD_META = [
  { key: "customerName", label: "客户名称", risk: "medium" },
  { key: "productName", label: "产品名称", risk: "high" },
  { key: "materialCode", label: "物料编码", risk: "high" },
  { key: "quantity", label: "数量", risk: "high" },
  { key: "productSize", label: "产品规格", risk: "medium" },
  { key: "paperType", label: "用纸", risk: "high" },
  { key: "deliveryDate", label: "交期", risk: "high" },
  { key: "specialProcess", label: "特殊工艺", risk: "medium" }
];

const isEmpty = (value) => value === null || value === undefined || String(value).trim() === "";

export function normalizeValue(field, value) {
  if (isEmpty(value)) return null;
  const raw = String(value).trim();

  if (field === "quantity") {
    const numeric = Number(raw.replace(/[,，\s]/g, "").replace(/(件|张|pcs?)$/i, ""));
    return Number.isFinite(numeric) ? numeric : raw;
  }

  if (field === "deliveryDate") {
    return raw.replace(/[/.年]/g, "-").replace(/月/g, "-").replace(/日/g, "");
  }

  if (field === "materialCode") return raw.toUpperCase();
  return raw.replace(/\s+/g, " ").toLowerCase();
}

export function compareField(field, expected, predicted) {
  const normalizedExpected = normalizeValue(field, expected);
  const normalizedPredicted = normalizeValue(field, predicted);

  if (normalizedExpected === null && normalizedPredicted === null) return "correct";
  if (normalizedExpected !== null && normalizedPredicted === null) return "missing";
  if (normalizedExpected === null && normalizedPredicted !== null) return "hallucination";
  return normalizedExpected === normalizedPredicted ? "correct" : "incorrect";
}

export function evaluateOrder(order, version) {
  const prediction = order.predictions[version];
  const fieldResults = FIELD_META.map((field) => {
    const expected = order.groundTruth[field.key];
    const predicted = prediction.values[field.key];
    return {
      ...field,
      expected,
      predicted,
      status: compareField(field.key, expected, predicted)
    };
  });

  const errors = fieldResults.filter((field) => field.status !== "correct");
  const highRiskErrors = errors.filter((field) => field.risk === "high");

  return {
    id: order.id,
    fileName: order.fileName,
    format: order.format,
    pages: order.pages,
    scenario: order.scenario,
    sourceExcerpt: order.sourceExcerpt,
    version,
    latencyMs: prediction.latencyMs,
    repeatConsistency: prediction.repeatConsistency,
    fieldResults,
    errors,
    highRiskErrors,
    passed: errors.length === 0,
    needsReview: highRiskErrors.length > 0 || errors.some((field) => field.status === "hallucination")
  };
}

export function calculateMetrics(dataset, version) {
  const orders = dataset.map((order) => evaluateOrder(order, version));
  const fields = orders.flatMap((order) => order.fieldResults);
  const expectedFields = fields.filter((field) => !isEmpty(field.expected));
  const highRiskFields = fields.filter((field) => field.risk === "high");
  const correct = fields.filter((field) => field.status === "correct").length;
  const complete = expectedFields.filter((field) => field.status !== "missing").length;
  const highRiskCorrect = highRiskFields.filter((field) => field.status === "correct").length;
  const errors = fields.filter((field) => field.status !== "correct");
  const errorCounts = errors.reduce((result, field) => {
    result[field.status] += 1;
    return result;
  }, { missing: 0, incorrect: 0, hallucination: 0 });

  const percentage = (value, total) => total ? Number(((value / total) * 100).toFixed(1)) : 0;

  return {
    version,
    orders,
    sampleCount: orders.length,
    fieldCount: fields.length,
    accuracy: percentage(correct, fields.length),
    completeness: percentage(complete, expectedFields.length),
    highRiskAccuracy: percentage(highRiskCorrect, highRiskFields.length),
    wholeOrderPassRate: percentage(orders.filter((order) => order.passed).length, orders.length),
    repeatConsistency: Number((orders.reduce((sum, order) => sum + order.repeatConsistency, 0) / orders.length).toFixed(1)),
    averageLatencyMs: Math.round(orders.reduce((sum, order) => sum + order.latencyMs, 0) / orders.length),
    reviewCount: orders.filter((order) => order.needsReview).length,
    errorCounts,
    totalErrors: errors.length
  };
}

export function getReleaseDecision(metrics) {
  if (metrics.highRiskAccuracy >= 95 && metrics.errorCounts.hallucination === 0 && metrics.wholeOrderPassRate >= 70) {
    return {
      code: "release",
      label: "建议发布",
      summary: "核心质量门槛已满足，可进入发布流程。"
    };
  }

  if (metrics.highRiskAccuracy >= 90 && metrics.errorCounts.hallucination === 0) {
    return {
      code: "gray",
      label: "建议灰度",
      summary: "高风险质量基本达标，但整单质量仍需通过人工复核和小范围灰度验证。"
    };
  }

  return {
    code: "block",
    label: "阻断发布",
    summary: "存在高风险字段退化或幻觉，需修复并完成固定数据集回归。"
  };
}

export function createReport(dataset, version) {
  const metrics = calculateMetrics(dataset, version);
  const decision = getReleaseDecision(metrics);
  return {
    generatedAt: new Date().toISOString(),
    dataset: "synthetic-order-dataset-v1",
    dataNotice: "所有订单和字段均为模拟数据，仅用于作品集演示。",
    metrics: {
      sampleCount: metrics.sampleCount,
      fieldCount: metrics.fieldCount,
      accuracy: metrics.accuracy,
      completeness: metrics.completeness,
      highRiskAccuracy: metrics.highRiskAccuracy,
      wholeOrderPassRate: metrics.wholeOrderPassRate,
      repeatConsistency: metrics.repeatConsistency,
      averageLatencyMs: metrics.averageLatencyMs,
      reviewCount: metrics.reviewCount,
      errorCounts: metrics.errorCounts
    },
    decision,
    failedSamples: metrics.orders
      .filter((order) => !order.passed)
      .map((order) => ({
        id: order.id,
        fileName: order.fileName,
        errors: order.errors.map(({ key, label, risk, expected, predicted, status }) => ({ key, label, risk, expected, predicted, status }))
      }))
  };
}

