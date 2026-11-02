// Table 2 of the paper. Each row: SSR L1-L4, SSR Avg, HSR L1-L4, HSR Avg.
const MODELS = [
  ["GPT-5.4-xhigh",            79.1, 81.0, 77.4, 75.9, 78.2, 50.8, 54.2, 43.4, 31.1, 45.9],
  ["Gemini-3.1-Pro-Preview",   82.4, 76.6, 73.2, 53.1, 70.9, 49.3, 39.2, 32.8,  8.9, 34.6],
  ["Doubao-Seed-2.0-Pro-high", 66.6, 62.8, 52.5, 34.7, 53.5, 30.6, 25.0, 16.4,  2.2, 20.0],
  ["GLM-5.1",                  65.2, 58.3, 48.6, 30.6, 50.0, 23.9, 10.8,  4.9,  0.0, 10.9],
  ["Gemini-3-Flash-Preview",   66.4, 56.8, 41.7, 23.8, 46.4, 17.9, 14.2,  5.7,  0.0, 10.3],
  ["Kimi-K2.5-Thinking",       60.4, 46.2, 40.4, 25.0, 42.5, 14.9, 10.0,  6.6,  0.0,  8.6],
  ["Qwen-3.6-Plus-Thinking",   57.4, 50.7, 41.7, 30.7, 44.7, 14.9, 11.7,  2.5,  0.0,  7.9],
  ["Grok-4.2",                 55.3, 45.6, 32.7, 16.1, 36.7, 11.2,  5.8,  1.6,  0.0,  5.2],
  ["DeepSeek-V3.2-Thinking",   48.0, 44.0, 36.5, 29.9, 39.2,  7.5,  3.3,  4.1,  0.0,  4.1],
  ["Xiaomi-MiMo-V2-Pro",       42.0, 38.4, 31.8, 19.6, 32.5,  6.0,  4.2,  2.5,  0.0,  3.4],
  ["Minimax-M2.7",             35.5, 29.7, 22.8, 12.6, 24.7,  3.7,  4.2,  0.0,  1.1,  2.4],
  ["Xiaomi-MiMo-V2-Omni",      39.1, 32.3, 27.1, 16.1, 28.3,  1.5,  0.8,  1.6,  0.0,  1.1],
];

// Column index in a MODELS row, header label, and rubric or sample count.
const COLUMNS = [
  { index: 1,  label: "L1",  count: "727",   name: "SSR L1" },
  { index: 2,  label: "L2",  count: "678",   name: "SSR L2" },
  { index: 3,  label: "L3",  count: "798",   name: "SSR L3" },
  { index: 4,  label: "L4",  count: "795",   name: "SSR L4" },
  { index: 5,  label: "Avg", count: "2,998", name: "SSR Avg", avg: true },
  { index: 6,  label: "L1",  count: "134",   name: "HSR L1", groupStart: true },
  { index: 7,  label: "L2",  count: "120",   name: "HSR L2" },
  { index: 8,  label: "L3",  count: "122",   name: "HSR L3" },
  { index: 9,  label: "L4",  count: "90",    name: "HSR L4" },
  { index: 10, label: "Avg", count: "466",   name: "HSR Avg", avg: true },
];

const HSR_AVG = 10;
const sortState = { index: HSR_AVG, descending: true };

const columnClass = (column) =>
  [column.avg && "avg", column.groupStart && "group-start"].filter(Boolean).join(" ");

const best = new Map(
  COLUMNS.map((column) => [column.index, Math.max(...MODELS.map((row) => row[column.index]))])
);

function renderHeader() {
  const headerRow = document.getElementById("leaderboard-columns");
  headerRow.innerHTML = COLUMNS.map((column) => `
    <th scope="col" class="${columnClass(column)}" data-index="${column.index}">
      <button type="button" class="sort" aria-label="Sort by ${column.name}">
        <span class="label">${column.label}</span><small>(${column.count})</small>
      </button>
    </th>`).join("");
  headerRow.addEventListener("click", (event) => {
    const button = event.target.closest(".sort");
    if (!button) return;
    const index = Number(button.parentElement.dataset.index);
    sortState.descending = sortState.index === index ? !sortState.descending : true;
    sortState.index = index;
    renderRows();
  });
}

function renderRows() {
  const { index, descending } = sortState;
  const rows = [...MODELS].sort((a, b) =>
    (descending ? b[index] - a[index] : a[index] - b[index]) || b[HSR_AVG] - a[HSR_AVG]
  );
  document.getElementById("leaderboard-rows").innerHTML = rows.map((row, position) => `
    <tr>
      <th scope="row" class="model"><span class="rank">${position + 1}</span>${row[0]}</th>
      ${COLUMNS.map((column) => {
        const value = row[column.index];
        const classes = [columnClass(column), value === best.get(column.index) && "best"]
          .filter(Boolean).join(" ");
        return `<td class="${classes}">${value.toFixed(1)}</td>`;
      }).join("")}
    </tr>`).join("");
  document.querySelectorAll("#leaderboard-columns th").forEach((th) => {
    if (Number(th.dataset.index) === index) {
      th.setAttribute("aria-sort", descending ? "descending" : "ascending");
    } else {
      th.removeAttribute("aria-sort");
    }
  });
}

renderHeader();
renderRows();

const copyButton = document.getElementById("copy-bibtex");
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById("bibtex-text").textContent);
    copyButton.textContent = "Copied";
  } catch {
    copyButton.textContent = "Select and copy";
  }
  setTimeout(() => { copyButton.textContent = "Copy"; }, 1800);
});
