import { DATASET } from "./data/orders.js";
import { calculateMetrics, createReport, getReleaseDecision } from "./evaluator.js";

const GITHUB_URL = "https://github.com/Dyy813/ai-order-evaluation-lab";
const VERSION_LABELS = { v1: "V1 基线版本", v2: "V2 优化版本" };
const STATUS_LABELS = { correct: "正确", missing: "缺失", incorrect: "错误", hallucination: "幻觉" };

let selectedVersion = "v2";
let selectedFilter = "all";

const elements = {
  version: document.querySelector("#version-select"),
  metrics: document.querySelector("#metrics-grid"),
  comparison: document.querySelector("#comparison-chart"),
  decision: document.querySelector("#decision-content"),
  decisionPanel: document.querySelector("#decision-panel"),
  errors: document.querySelector("#error-chart"),
  review: document.querySelector("#review-list"),
  samples: document.querySelector("#sample-table"),
  filters: document.querySelector("#filters"),
  drawer: document.querySelector("#detail-drawer"),
  drawerContent: document.querySelector("#drawer-content"),
  backdrop: document.querySelector("#drawer-backdrop"),
  close: document.querySelector("#drawer-close"),
  download: document.querySelector("#download-report")
};

document.querySelectorAll("[data-github-link]").forEach((link) => {
  link.href = GITHUB_URL;
  if (GITHUB_URL !== "#") {
    link.target = "_blank";
    link.rel = "noreferrer";
  }
});

const pct = (value) => `${value}%`;
const metricCard = (label, value, detail, tone = "default") => `
  <article class="metric-card ${tone}">
    <span>${label}</span>
    <strong>${value}</strong>
    <small>${detail}</small>
  </article>`;

function renderMetrics(metrics) {
  elements.metrics.innerHTML = [
    metricCard("字段准确率", pct(metrics.accuracy), `${metrics.fieldCount} 个字段`, "cyan"),
    metricCard("字段完整率", pct(metrics.completeness), "有值字段输出完整性"),
    metricCard("高风险准确率", pct(metrics.highRiskAccuracy), "产品 / 物料 / 数量 / 用纸 / 交期", "amber"),
    metricCard("整单通过率", pct(metrics.wholeOrderPassRate), `${metrics.sampleCount} 份模拟订单`),
    metricCard("重复一致率", pct(metrics.repeatConsistency), "每份样本模拟重复 5 次"),
    metricCard("平均耗时", `${(metrics.averageLatencyMs / 1000).toFixed(1)}s`, "端到端处理耗时")
  ].join("");
}

function comparisonRow(label, v1, v2) {
  return `
    <div class="comparison-row">
      <div class="comparison-label"><span>${label}</span><strong>V1 ${pct(v1)} → V2 ${pct(v2)}</strong></div>
      <div class="dual-bars">
        <div class="bar-track"><span class="bar-v1" style="width:${v1}%"></span></div>
        <div class="bar-track"><span class="bar-v2" style="width:${v2}%"></span></div>
      </div>
      <div class="delta ${v2 >= v1 ? "positive" : "negative"}">${v2 >= v1 ? "+" : ""}${(v2 - v1).toFixed(1)}pp</div>
    </div>`;
}

function renderComparison() {
  const v1 = calculateMetrics(DATASET, "v1");
  const v2 = calculateMetrics(DATASET, "v2");
  elements.comparison.innerHTML = `
    <div class="legend"><span><i class="v1"></i>V1 基线</span><span><i class="v2"></i>V2 优化</span></div>
    ${comparisonRow("字段准确率", v1.accuracy, v2.accuracy)}
    ${comparisonRow("字段完整率", v1.completeness, v2.completeness)}
    ${comparisonRow("高风险准确率", v1.highRiskAccuracy, v2.highRiskAccuracy)}
    ${comparisonRow("整单通过率", v1.wholeOrderPassRate, v2.wholeOrderPassRate)}
    ${comparisonRow("重复一致率", v1.repeatConsistency, v2.repeatConsistency)}
  `;
}

function renderDecision(metrics) {
  const decision = getReleaseDecision(metrics);
  elements.decisionPanel.dataset.decision = decision.code;
  elements.decision.innerHTML = `
    <div class="decision-badge"><span></span>${decision.label}</div>
    <p>${decision.summary}</p>
    <dl>
      <div><dt>高风险准确率</dt><dd>${pct(metrics.highRiskAccuracy)}</dd></div>
      <div><dt>幻觉错误</dt><dd>${metrics.errorCounts.hallucination}</dd></div>
      <div><dt>待人工复核</dt><dd>${metrics.reviewCount} 单</dd></div>
    </dl>
  `;
}

function renderErrors(metrics) {
  const configs = [
    ["missing", "字段缺失", "amber"],
    ["incorrect", "值不一致", "red"],
    ["hallucination", "无依据生成", "purple"]
  ];
  const max = Math.max(...Object.values(metrics.errorCounts), 1);
  elements.errors.innerHTML = configs.map(([key, label, tone]) => `
    <div class="error-row">
      <div><span class="error-dot ${tone}"></span><strong>${label}</strong></div>
      <div class="error-bar"><span class="${tone}" style="width:${(metrics.errorCounts[key] / max) * 100}%"></span></div>
      <b>${metrics.errorCounts[key]}</b>
    </div>`).join("");
}

function renderReview(metrics) {
  const queue = metrics.orders.filter((order) => order.needsReview);
  if (!queue.length) {
    elements.review.innerHTML = `<div class="empty-state">当前版本没有高风险待复核样本。</div>`;
    return;
  }
  elements.review.innerHTML = queue.slice(0, 4).map((order, index) => `
    <button class="review-item" data-order-id="${order.id}" type="button">
      <span class="queue-number">${String(index + 1).padStart(2, "0")}</span>
      <span><strong>${order.id}</strong><small>${order.fileName}</small></span>
      <em>${order.highRiskErrors.length} 个高风险错误</em>
    </button>`).join("");
}

function getFilteredOrders(metrics) {
  if (selectedFilter === "failed") return metrics.orders.filter((order) => !order.passed);
  if (selectedFilter === "review") return metrics.orders.filter((order) => order.needsReview);
  if (selectedFilter === "passed") return metrics.orders.filter((order) => order.passed);
  return metrics.orders;
}

function renderSamples(metrics) {
  const orders = getFilteredOrders(metrics);
  elements.samples.innerHTML = orders.length ? orders.map((order) => `
    <tr data-order-id="${order.id}" tabindex="0">
      <td><strong>${order.id}</strong><small>${order.fileName}</small></td>
      <td>${order.scenario}</td>
      <td><span class="format-tag">${order.format}</span> ${order.pages} 页</td>
      <td>${order.errors.length}</td>
      <td>${order.highRiskErrors.length}</td>
      <td><span class="status-pill ${order.passed ? "passed" : order.needsReview ? "review" : "failed"}">${order.passed ? "通过" : order.needsReview ? "需复核" : "未通过"}</span></td>
    </tr>`).join("") : `<tr><td colspan="6" class="empty-row">当前筛选条件下没有样本。</td></tr>`;
}

function openDrawer(orderId) {
  const metrics = calculateMetrics(DATASET, selectedVersion);
  const order = metrics.orders.find((item) => item.id === orderId);
  if (!order) return;

  elements.drawerContent.innerHTML = `
    <p class="drawer-eyebrow">${VERSION_LABELS[selectedVersion]} · ${order.id}</p>
    <h2 id="detail-title">${order.fileName}</h2>
    <div class="drawer-meta"><span>${order.scenario}</span><span>${order.format} · ${order.pages} 页</span><span>${(order.latencyMs / 1000).toFixed(1)}s</span></div>
    <div class="source-card"><span>模拟原文摘要</span><p>${order.sourceExcerpt}</p></div>
    <div class="field-list">
      ${order.fieldResults.map((field) => `
        <article class="field-result ${field.status}">
          <div class="field-head"><strong>${field.label}</strong><span class="risk ${field.risk}">${field.risk === "high" ? "高风险" : "中风险"}</span><em>${STATUS_LABELS[field.status]}</em></div>
          <dl><div><dt>Ground Truth</dt><dd>${field.expected ?? "—"}</dd></div><div><dt>模型输出</dt><dd>${field.predicted ?? "—"}</dd></div></dl>
        </article>`).join("")}
    </div>
  `;
  elements.drawer.classList.add("open");
  elements.backdrop.classList.add("open");
  elements.drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  elements.drawer.classList.remove("open");
  elements.backdrop.classList.remove("open");
  elements.drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function render() {
  const metrics = calculateMetrics(DATASET, selectedVersion);
  renderMetrics(metrics);
  renderComparison();
  renderDecision(metrics);
  renderErrors(metrics);
  renderReview(metrics);
  renderSamples(metrics);
}

elements.version.addEventListener("change", (event) => {
  selectedVersion = event.target.value;
  closeDrawer();
  render();
});

elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  selectedFilter = button.dataset.filter;
  elements.filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  renderSamples(calculateMetrics(DATASET, selectedVersion));
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-order-id]");
  if (target) openDrawer(target.dataset.orderId);
});

elements.samples.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("tr[data-order-id]")) {
    event.preventDefault();
    openDrawer(event.target.dataset.orderId);
  }
});

elements.close.addEventListener("click", closeDrawer);
elements.backdrop.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (event) => event.key === "Escape" && closeDrawer());

elements.download.addEventListener("click", () => {
  const report = createReport(DATASET, selectedVersion);
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ai-order-evaluation-${selectedVersion}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

render();

