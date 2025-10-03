// Config
const POR_PAGINA = 10;

let productos = [];
let filtrados = [];
let paginaActual = 1;

// Init
document.addEventListener("DOMContentLoaded", async () => {
  await cargarDatos();
  iniciarIntro();
  conectarBuscador();
  render();
});

async function cargarDatos(){
  try{
    const res = await fetch("data.json", { cache: "no-store" });
    productos = await res.json();
  }catch(e){
    productos = [];
    console.warn("No se pudo cargar data.json", e);
  }
  filtrados = productos.slice();
}

function iniciarIntro(){
  const intro = document.getElementById("intro");
  setTimeout(() => {
    intro.classList.add("fade-out");
    // quitar del flujo para performance
    setTimeout(()=> intro.remove(), 900);
  }, 1400);
}

function conectarBuscador(){
  const input = document.getElementById("buscador");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    paginaActual = 1;
    filtrados = productos.filter(p => {
      const desc = (p.descripcion || "").toLowerCase();
      const tags = (p.tags || []).join(" ").toLowerCase();
      return desc.includes(q) || tags.includes(q);
    });
    render();
  });
}

function render(){
  renderProductos();
  renderPaginacion();
}

function renderProductos(){
  const cont = document.getElementById("productos");
  cont.innerHTML = "";

  const inicio = (paginaActual - 1) * POR_PAGINA;
  const fin = inicio + POR_PAGINA;
  const pagina = filtrados.slice(inicio, fin);

  pagina.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";

    const media = document.createElement("div");
    media.className = "card-media";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = p.imagen;
    img.alt = p.descripcion || "Producto";

    media.appendChild(img);

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("p");
    title.className = "card-title";
    title.textContent = p.descripcion || "Sin descripción";

    const tags = document.createElement("div");
    tags.className = "card-tags";
    (p.tags || extraerTags(p.descripcion)).forEach(t => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = t;
      tags.appendChild(tag);
    });

    body.appendChild(title);
    body.appendChild(tags);

    card.appendChild(media);
    card.appendChild(body);
    cont.appendChild(card);

    // animación de entrada
    requestAnimationFrame(() => card.classList.add("reveal"));
  });
}

function renderPaginacion(){
  const nav = document.getElementById("paginacion");
  nav.innerHTML = "";

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));

  // limitar a 5 visibles (1..5, con desplazamiento)
  const maxVisibles = 5;
  let inicio = Math.max(1, paginaActual - Math.floor(maxVisibles/2));
  let fin = Math.min(totalPaginas, inicio + maxVisibles - 1);
  if (fin - inicio + 1 < maxVisibles) inicio = Math.max(1, fin - maxVisibles + 1);

  // Prev
  const prev = crearBoton("«", () => {
    if (paginaActual > 1) { paginaActual--; render(); }
  });
  nav.appendChild(prev);

  for(let i=inicio;i<=fin;i++){
    const btn = crearBoton(String(i), () => {
      paginaActual = i; render();
    });
    if(i === paginaActual) btn.classList.add("active");
    nav.appendChild(btn);
  }

  // Next
  const next = crearBoton("»", () => {
    if (paginaActual < totalPaginas) { paginaActual++; render(); }
  });
  nav.appendChild(next);
}

function crearBoton(texto, onClick){
  const btn = document.createElement("button");
  btn.className = "page-btn ripple";
  btn.textContent = texto;
  btn.addEventListener("click", onClick);
  return btn;
}

// Si no hay tags, genera algunas a partir de la descripción
function extraerTags(desc){
  if(!desc) return [];
  const base = desc.toLowerCase().split(/[\s,.-]+/).filter(Boolean);
  // dedup y filtrar palabras muy cortas
  const set = new Set(base.filter(w => w.length >= 4));
  return Array.from(set).slice(0, 4);
}