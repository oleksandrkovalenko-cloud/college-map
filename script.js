/* ==========================================================================
   Rendering + interactivity for the campus scheme.
   Everything content-related is read from COLLEGE_DATA (data.js);
   this file only contains generic render functions and event wiring.
   ========================================================================== */

const MODE_COLOR = { tram: "var(--tram)", trolley: "var(--trolley)", bus: "var(--bus)" };

// Non-breaking space between the number and "м" so a line-wrap can never
// separate them.
function fmtDist(m){
  return "≈" + m + "\u00A0м";
}

/* ---------- navigation ---------- */
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

function showFloor(buildingId, idx){
  const root = document.getElementById("page-" + buildingId);
  root.querySelectorAll(".floor-tab").forEach((t,i) => t.classList.toggle("active", i===idx));
  root.querySelectorAll(".floor-panel").forEach((p,i) => p.classList.toggle("active", i===idx));
}

/* ---------- small helpers ---------- */
function el(tag, attrs, html){
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (html !== undefined) e.innerHTML = html;
  return e;
}
function svgEl(tag, attrs){
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function roomRow(r){
  if (r.merged) return `<tr><td colspan="2" class="merged-cell">${r.num}</td></tr>`;
  return `<tr><td>${r.num}</td><td>${r.desc}</td></tr>`;
}

/* Numbered rooms (№52, №43а, ...) sort ascending by their numeric part,
   with a same-number letter suffix immediately after the plain number.
   Named/merged rooms have no leading number, so they naturally end up
   last — exactly the "merged rows at the end" order that's wanted. */
function roomSortKey(room){
  const m = room.num.match(/^№(\d+)([а-яіїєґА-ЯІЇЄҐ]*)/);
  return m ? [parseInt(m[1], 10), m[2] || ""] : [Infinity, room.num];
}
function sortRooms(rooms){
  return [...rooms].sort((a, b) => {
    const ka = roomSortKey(a), kb = roomSortKey(b);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    return String(ka[1]).localeCompare(String(kb[1]), "uk");
  });
}

/* ---------- search across all rooms in all buildings ---------- */
let SEARCH_INDEX = [];

function buildSearchIndex(){
  const index = [];
  COLLEGE_DATA.buildings.forEach(b => {
    b.floors.forEach((f, floorIndex) => {
      const rooms = f.groups ? f.groups.flatMap(g => g.rooms) : f.rooms;
      rooms.forEach(r => {
        index.push({
          buildingId: b.id,
          buildingName: b.name,
          floorIndex,
          floorName: f.name,
          num: r.num,
          desc: r.merged ? "" : (r.desc || "")
        });
      });
    });
  });
  return index;
}

function performSearch(query){
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX
    .filter(item => item.num.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q))
    .slice(0, 8);
}

function renderSearchResults(results){
  const box = document.getElementById("search-results");
  if (results.length === 0){
    box.innerHTML = "";
    box.classList.remove("show");
    return;
  }
  box.innerHTML = results.map((r, i) => `
    <div class="search-result" data-idx="${i}" tabindex="0" role="button">
      <span class="sr-num">${r.num}</span>
      <span class="sr-desc">${r.desc || "—"}</span>
      <span class="sr-loc">${r.buildingName} · ${r.floorName}</span>
    </div>
  `).join("");
  box.classList.add("show");
  box.querySelectorAll(".search-result").forEach((el, i) => {
    const activate = () => goToSearchResult(results[i]);
    el.addEventListener("click", activate);
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); activate(); }
    });
  });
}

function goToSearchResult(result){
  showPage("page-" + result.buildingId);
  showFloor(result.buildingId, result.floorIndex);
  closeSearchResults();
  const input = document.getElementById("room-search");
  input.value = "";
  document.getElementById("search-clear").hidden = true;

  // Briefly highlight the matched row so it's easy to spot after the jump.
  requestAnimationFrame(() => {
    const page = document.getElementById("page-" + result.buildingId);
    const cells = page.querySelectorAll(".floor-panel.active td:first-child, .floor-panel.active td.merged-cell");
    for (const cell of cells){
      if (cell.textContent === result.num){
        const row = cell.closest("tr");
        row.classList.add("row-highlight");
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => row.classList.remove("row-highlight"), 2200);
        break;
      }
    }
  });
}

function closeSearchResults(){
  const box = document.getElementById("search-results");
  box.classList.remove("show");
}

function initSearch(){
  SEARCH_INDEX = buildSearchIndex();
  const input = document.getElementById("room-search");
  const clearBtn = document.getElementById("search-clear");
  const resultsBox = document.getElementById("search-results");
  let activeIdx = -1;

  input.addEventListener("input", () => {
    clearBtn.hidden = input.value.length === 0;
    activeIdx = -1;
    renderSearchResults(performSearch(input.value));
  });

  input.addEventListener("keydown", e => {
    const items = resultsBox.querySelectorAll(".search-result");
    if (e.key === "ArrowDown" && items.length){
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIdx));
      items[activeIdx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp" && items.length){
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      items.forEach((el, i) => el.classList.toggle("active", i === activeIdx));
      items[activeIdx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && activeIdx >= 0 && items[activeIdx]){
      items[activeIdx].click();
    } else if (e.key === "Escape"){
      closeSearchResults();
      input.blur();
    }
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.hidden = true;
    closeSearchResults();
    input.focus();
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) closeSearchResults();
  });
}

/* ---------- map: building shapes (drawn from data, not hardcoded in HTML) ---------- */
function renderMapBuildings(){
  const layer = document.getElementById("buildings-layer");
  COLLEGE_DATA.buildings.forEach(b => {
    const label = b.name + " — переглянути аудиторії";
    const g = svgEl("g", {
      class: "bldg", "data-building": b.id,
      tabindex: "0", role: "button", "aria-label": label
    });
    g.appendChild(svgEl("title", {}));
    g.lastChild.textContent = label;
    g.appendChild(svgEl("polygon", { points: b.polygon, fill: b.color, stroke: "var(--map-campus)", "stroke-width": "2" }));
    const t = svgEl("text", {
      x: b.labelX, y: b.labelY, "font-size": "34", "font-weight": "bold",
      fill: "#FFFFFF", "text-anchor": "middle", "dominant-baseline": "central"
    });
    t.textContent = b.number;
    g.appendChild(t);
    const activate = () => showPage("page-" + b.id);
    g.addEventListener("click", activate);
    g.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); activate(); }
    });
    layer.appendChild(g);
  });
}

/* ---------- map: mode-dots + label at each transport stop ---------- */
function renderStopMarker(stop, dotsId, labelId, baseX){
  const g = document.getElementById(dotsId);
  let x = 0;
  stop.modes.forEach(m => {
    g.appendChild(svgEl("circle", { cx: x, cy: 0, r: "6.5", fill: MODE_COLOR[m.mode] }));
    x += 16;
  });
  const label = document.getElementById(labelId);
  label.textContent = "Зупинка громадського транспорту · " + fmtDist(stop.distance);
  label.setAttribute("x", baseX + x + 8);
}

/* ---------- tile: buildings list ---------- */
function renderBuildingsTile(){
  const box = document.getElementById("buildings-list");
  COLLEGE_DATA.buildings.forEach(b => {
    const item = el("div", { class: "b-item clickable" },
      `<div class="b-swatch" style="background:${b.color}">${b.number}</div>
       <div class="b-text">${b.name}<span class="sub">${b.address}</span></div>`);
    item.addEventListener("click", () => showPage("page-" + b.id));
    box.appendChild(item);
  });
}

/* ---------- tile: how to get there ---------- */
function easyWayLink(mode, route){
  const id = COLLEGE_DATA.easyWay.confirmedIds[mode + ":" + route];
  return id ? `${COLLEGE_DATA.easyWay.baseUrl}/routes/${id}` : COLLEGE_DATA.easyWay.routesListUrl;
}

function directionsUrl(){
  return "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(COLLEGE_DATA.directions.destinationAddress);
}

// Coordinates give Google Maps the exact pin (no geocoding ambiguity),
// which is what "using their marker" means for the nearby POIs.
function directionsUrlByCoords(lat, lng){
  return "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng;
}

async function shareLocation(){
  const shareData = {
    title: COLLEGE_DATA.institution.name,
    text: COLLEGE_DATA.institution.address,
    url: COLLEGE_DATA.directions.placeUrl
  };
  if (navigator.share){
    try { await navigator.share(shareData); } catch (err) { /* user cancelled — do nothing */ }
    return;
  }
  // No Web Share API (most desktop browsers) — copy the link instead.
  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast("Посилання скопійовано");
  } catch (err) {
    showToast(shareData.url); // clipboard blocked too — at least show the link
  }
}

// Includes which page/building the visitor was on, so reports arrive
// with useful context instead of a blank "something's wrong somewhere".
function buildReportErrorUrl(){
  const activePage = document.querySelector(".page.active");
  let pageLabel = "Головна сторінка (мапа)";
  if (activePage && activePage.id !== "page-map"){
    const h1 = activePage.querySelector(".bpage-header h1");
    pageLabel = h1 ? h1.textContent : activePage.id;
  }
  const subject = "Помилка на сайті схеми коледжу";
  const body = `Опишіть, будь ласка, що саме не так:\n\n\n---\nСторінка: ${pageLabel}`;
  return "mailto:oleksandr.kovalenko@krkm.dnu.edu.ua"
    + `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function reportError(){
  window.location.href = buildReportErrorUrl();
}

let toastTimer = null;
function showToast(text){
  let toast = document.getElementById("toast");
  if (!toast){
    toast = el("div", { id: "toast", class: "toast" });
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderTransportTile(){
  const box = document.getElementById("transport-list");

  box.insertAdjacentHTML("beforeend", `
    <a class="route-btn" href="${directionsUrl()}" target="_blank" rel="noopener">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      Побудувати маршрут до коледжу
    </a>
  `);

  COLLEGE_DATA.transportStops.forEach(stop => {
    const modesHtml = stop.modes.map(m => `
      <div class="mode-row">
        <span class="mode-label">${m.label}</span>
        <span class="badges">${m.routes.map(r =>
          `<a class="badge ${m.mode}" href="${easyWayLink(m.mode, r)}" target="_blank" rel="noopener" title="${m.label} ${r} на EasyWay">${r}</a>`
        ).join("")}</span>
      </div>`).join("");
    box.insertAdjacentHTML("beforeend", `
      <div class="stop-block">
        <p class="stop-title">Зупинка «${stop.street}»</p>
        <p class="stop-dist">${fmtDist(stop.distance)} ${stop.direction} від коледжу</p>
        ${modesHtml}
      </div>
    `);
  });
  box.insertAdjacentHTML("beforeend", `<p class="footnote">Номери маршрутів ведуть на EasyWay: де конкретний маршрут підтверджено — пряме посилання на нього, інакше — на загальний список маршрутів Дніпра.</p>`);
}

/* ---------- tile: nearby amenities ---------- */
function renderPoiTile(){
  const box = document.getElementById("poi-list");
  const sorted = [...COLLEGE_DATA.poi].sort((a, b) => a.distance - b.distance);
  sorted.forEach(p => {
    box.appendChild(el("div", { class: "b-item" }, `
      <div class="poi-dot"></div>
      <div class="b-text">${p.name} <span class="poi-distance">${fmtDist(p.distance)}</span><span class="sub">${p.category} · ${p.address}</span></div>
      <a class="poi-route-link" href="${directionsUrlByCoords(p.lat, p.lng)}" target="_blank" rel="noopener" title="Побудувати маршрут до ${p.name}" aria-label="Побудувати маршрут до ${p.name}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      </a>
    `));
  });
}

/* ---------- home page: Google Maps embed + college photo ---------- */
function renderMapsEmbed(){
  const container = document.getElementById("maps-embed-frame");
  // Querying by name+address (rather than bare lat,lng) makes the embed
  // resolve to the actual place listing — a named, clickable marker with
  // its rating/photos/reviews attached — instead of an anonymous pin
  // that only carries coordinates.
  const query = `${COLLEGE_DATA.institution.name}, ${COLLEGE_DATA.directions.destinationAddress}`;
  container.innerHTML = `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Google Maps: розташування коледжу"></iframe>`;
}

// Reuses the exact same carousel markup/behaviour as building photos
// (carouselGoTo/carouselNav are generic by id), just for the college's
// own main-building photo instead of a specific corpus.
function renderCollegePhotoFrame(){
  const container = document.getElementById("college-photo-frame");
  const photos = COLLEGE_DATA.institution.photos || [];
  if (photos.length === 0){
    container.innerHTML = `
      <div class="photo-placeholder small-placeholder">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M4 8h3l2-2h6l2 2h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/>
          <circle cx="12" cy="14" r="3.6"/>
        </svg>
        <span>Фото коледжу</span>
        <span class="small">додайте зображення (college-1.jpg) у photos/</span>
      </div>
    `;
    return;
  }
  const slides = photos.map((src,i) =>
    `<img src="${src}" class="carousel-slide${i===0?" active":""}" alt="Фото коледжу ${i+1} з ${photos.length}">`
  ).join("");
  const controls = photos.length > 1 ? `
    <button class="carousel-arrow prev" onclick="carouselNav('college',-1)" aria-label="Попереднє фото">‹</button>
    <button class="carousel-arrow next" onclick="carouselNav('college',1)" aria-label="Наступне фото">›</button>
    <div class="carousel-dots">${photos.map((_,i) => `<button class="carousel-dot${i===0?" active":""}" onclick="carouselGoTo('college',${i})" aria-label="Фото ${i+1}"></button>`).join("")}</div>
  ` : "";
  container.innerHTML = `<div class="carousel" id="carousel-college" data-index="0" data-count="${photos.length}">${slides}${controls}</div>`;
}

/* ---------- building detail pages ---------- */
function renderLocationMap(building){
  const others = COLLEGE_DATA.buildings.filter(b => b.id !== building.id);
  const glowId = "locGlow-" + building.id;
  let shapes = others.map(b => `
    <g class="mini-bldg" tabindex="0" role="button" aria-label="${b.name} — перейти на сторінку цього корпусу"
       onclick="showPage('page-${b.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showPage('page-${b.id}')}">
      <title>${b.name} — перейти на сторінку цього корпусу</title>
      <polygon points="${b.polygon}" fill="var(--map-muted-building)" stroke="var(--map-campus)" stroke-width="2"/>
      <text x="${b.labelX}" y="${b.labelY}" font-size="30" font-weight="bold" fill="var(--map-muted-text)" text-anchor="middle" dominant-baseline="central">${b.number}</text>
    </g>
  `).join("");
  shapes += `
    <polygon points="${building.polygon}" fill="none" stroke="${building.color}" stroke-width="14" opacity="0.35" filter="url(#${glowId})"/>
    <polygon points="${building.polygon}" fill="${building.color}" stroke="var(--map-campus)" stroke-width="3"/>
    <text x="${building.labelX}" y="${building.labelY}" font-size="34" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${building.number}</text>
  `;
  return `
    <div class="location-map">
      <p class="location-map-title">Розташування на території коледжу</p>
      <svg viewBox="125 155 440 660" xmlns="http://www.w3.org/2000/svg" role="img">
        <title>Розташування корпусу на території коледжу. Інші корпуси клікабельні — перемикають на їхню сторінку.</title>
        <defs>
          <filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5"/>
          </filter>
        </defs>
        <rect x="140" y="168" width="410" height="746" rx="10" fill="var(--map-campus)" stroke="var(--map-campus-stroke)" stroke-width="1"/>
        ${shapes}
      </svg>
    </div>
  `;
}

/* Photo column: real carousel once b.photos has entries; a calm single
   placeholder until then, so dropping image paths into data.js is all
   that's needed later — no markup changes. */
function renderPhotoArea(b){
  if (!b.photos || b.photos.length === 0){
    return ""; // no photo yet -> render nothing; the info column expands to fill the row
  }
  const slides = b.photos.map((src,i) =>
    `<img src="${src}" class="carousel-slide${i===0?" active":""}" alt="${b.name}, фото ${i+1} з ${b.photos.length}">`
  ).join("");
  const controls = b.photos.length > 1 ? `
    <button class="carousel-arrow prev" onclick="carouselNav('${b.id}',-1)" aria-label="Попереднє фото">‹</button>
    <button class="carousel-arrow next" onclick="carouselNav('${b.id}',1)" aria-label="Наступне фото">›</button>
    <div class="carousel-dots">${b.photos.map((_,i) => `<button class="carousel-dot${i===0?" active":""}" onclick="carouselGoTo('${b.id}',${i})" aria-label="Фото ${i+1}"></button>`).join("")}</div>
  ` : "";
  return `
    <div class="bpage-photo">
      <div class="carousel" id="carousel-${b.id}" data-index="0" data-count="${b.photos.length}">
        ${slides}
        ${controls}
      </div>
    </div>
  `;
}
function carouselGoTo(bid, idx){
  const car = document.getElementById("carousel-" + bid);
  car.querySelectorAll(".carousel-slide").forEach((s,i) => s.classList.toggle("active", i===idx));
  car.querySelectorAll(".carousel-dot").forEach((d,i) => d.classList.toggle("active", i===idx));
  car.dataset.index = idx;
}
function carouselNav(bid, dir){
  const car = document.getElementById("carousel-" + bid);
  const count = parseInt(car.dataset.count, 10);
  const idx = (parseInt(car.dataset.index, 10) + dir + count) % count;
  carouselGoTo(bid, idx);
}

function renderBuildingPage(b){
  const page = document.getElementById("page-" + b.id);
  page.style.setProperty("--bcolor", b.color);
  const root = page.querySelector(".bpage-content");

  const tabs = b.floors.map((f,i) =>
    `<button class="floor-tab${i===0?" active":""}" onclick="showFloor('${b.id}',${i})">${f.name}</button>`
  ).join("");

  const panels = b.floors.map((f,i) => {
    let inner;
    if (f.groups){
      inner = f.groups.map(gr => `
        <p class="group-label">${gr.label}</p>
        <table class="room-table">${sortRooms(gr.rooms).map(roomRow).join("")}</table>
      `).join("");
    } else {
      inner = `<table class="room-table">${sortRooms(f.rooms).map(roomRow).join("")}</table>`;
    }
    return `<div class="floor-panel${i===0?" active":""}">${inner}</div>`;
  }).join("");

  root.innerHTML = `
    <div class="bpage-header">
      <div class="bpage-num" style="background:${b.color}">${b.number}</div>
      <div>
        <h1>${b.name}</h1>
        <p>${COLLEGE_DATA.institution.address.split(",")[0]}${b.address.includes("27/1") ? " (27/1)" : ""}, м. Дніпро</p>
      </div>
    </div>
    <div class="bpage-layout photo-${b.photoSide || "left"}">
      ${renderPhotoArea(b)}
      <div class="bpage-info">
        ${renderLocationMap(b)}
        <div class="floor-section">
          <div class="floor-tabs">${tabs}</div>
          <div class="floor-panels">${panels}</div>
        </div>
      </div>
    </div>
  `;
}

/* ---------- dynamic photo discovery ----------
   No server-side code anywhere — two client-side tiers, each used only
   if the one before it finds nothing:

   1. photos-manifest.json — if present and current (kept fresh by the
      GitHub Actions workflow on every push, on hosts like GitHub Pages
      that use it). Fast, exact, one small fetch.
   2. Pure-JS probing — tries fetching photos/<prefix>-1.jpg, -2.jpg,
      etc. by the documented naming convention and keeps whatever
      responds. Needs no build step, no CI, no server-side language —
      this is what makes automatic detection work on the college's own
      server too, not just on GitHub Pages. Trade-off: it can only find
      sequentially-numbered files, not arbitrary names, and costs a
      bounded number of small HEAD requests instead of one listing.

   If neither finds anything, the manually-set `photos` arrays already
   in data.js stand as-is — nothing ever breaks, it just stops being
   automatic. */

function applyFoundPhotos(found){
  COLLEGE_DATA.buildings.forEach(b => {
    if (Array.isArray(found[b.id]) && found[b.id].length > 0){
      b.photos = found[b.id];
    }
  });
  if (Array.isArray(found.college) && found.college.length > 0){
    COLLEGE_DATA.institution.photos = found.college;
  }
}

// Tries photos/<prefix>-1.<ext>, -2.<ext>, ... in the order JPG/JPEG/PNG/
// WebP, stopping after two consecutive misses (tolerates one gap, e.g.
// photo 2 deleted but 3 still there, without scanning forever).
async function probeCategoryPhotos(prefix, maxCount = 10){
  const extensions = ["jpg", "jpeg", "png", "webp"];
  const found = [];
  let consecutiveMisses = 0;
  for (let i = 1; i <= maxCount && consecutiveMisses < 2; i++){
    let hit = null;
    for (const ext of extensions){
      const path = `photos/${prefix}-${i}.${ext}`;
      try {
        const res = await fetch(path, { method: "HEAD", cache: "no-store" });
        if (res.ok){ hit = path; break; }
      } catch (err) { /* treat as a miss and try the next extension */ }
    }
    if (hit){ found.push(hit); consecutiveMisses = 0; }
    else { consecutiveMisses++; }
  }
  return found;
}

async function loadDynamicPhotos(){
  try {
    // cache: "no-store" bypasses the browser's own HTTP cache (a layer
    // below the service worker) — without it, a static server's default
    // caching headers can make this fetch return a stale response even
    // though the SW's own strategy for this file is network-first.
    const res = await fetch("photos-manifest.json", { cache: "no-store" });
    if (res.ok){
      const found = await res.json();
      applyFoundPhotos(found);
      return;
    }
  } catch (err) {
    // manifest missing or invalid — fall through to probing
  }

  const categories = [...COLLEGE_DATA.buildings.map(b => b.id), "college"];
  const probed = {};
  await Promise.all(categories.map(async prefix => {
    probed[prefix] = await probeCategoryPhotos(prefix);
  }));
  applyFoundPhotos(probed);
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadDynamicPhotos();

  renderMapBuildings();
  renderStopMarker(COLLEGE_DATA.transportStops[0], "stop-top-dots", "stop-top-label", 55);
  renderStopMarker(COLLEGE_DATA.transportStops[1], "stop-bottom-dots", "stop-bottom-label", 55);

  renderBuildingsTile();
  renderTransportTile();
  renderPoiTile();
  renderMapsEmbed();
  renderCollegePhotoFrame();

  COLLEGE_DATA.buildings.forEach(renderBuildingPage);

  document.getElementById("inst-name").textContent = COLLEGE_DATA.institution.name;
  document.getElementById("inst-address").textContent = COLLEGE_DATA.institution.address;
  document.getElementById("inst-fullname").textContent = COLLEGE_DATA.institution.fullName;
  document.getElementById("share-btn").addEventListener("click", shareLocation);
  document.getElementById("maps-place-link").href = COLLEGE_DATA.directions.placeUrl;
  document.getElementById("report-error-link").addEventListener("click", e => { e.preventDefault(); reportError(); });
  initSearch();
});
