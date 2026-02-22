import { useState, useRef, useEffect } from "react";

const ESTADOS = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche",
  "Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima",
  "Durango","Estado de México","Guanajuato","Guerrero","Hidalgo",
  "Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca",
  "Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa",
  "Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"
];

const CATEGORIAS = [
  { id: "arrendamiento", label: "Arrendamiento / Vivienda", icon: "🏠" },
  { id: "familia", label: "Familia / Divorcio / Custodia", icon: "👨‍👩‍👧" },
  { id: "laboral", label: "Laboral / Despido", icon: "💼" },
  { id: "penal", label: "Penal / Delitos", icon: "⚖️" },
  { id: "mercantil", label: "Contratos / Deudas / Empresas", icon: "🏢" },
  { id: "civil", label: "Herencias / Sucesiones", icon: "📋" },
  { id: "consumidor", label: "Consumidor / PROFECO", icon: "🛒" },
  { id: "transito", label: "Accidentes / Tránsito", icon: "🚗" },
  { id: "otro", label: "Otro", icon: "❓" },
];

const TEMPLATES = [
  { id: "contrato_arrendamiento", categoria: "arrendamiento", label: "Contrato de Arrendamiento", icon: "🏠", campos: ["arrendador","arrendatario","inmueble","renta_mensual","deposito","duracion_meses","estado"] },
  { id: "carta_rescision", categoria: "arrendamiento", label: "Carta de Rescisión de Contrato", icon: "📄", campos: ["arrendador","arrendatario","inmueble","motivo","fecha_desocupacion","estado"] },
  { id: "demanda_laboral", categoria: "laboral", label: "Escrito Inicial Demanda Laboral", icon: "💼", campos: ["trabajador","empresa","puesto","salario_diario","fecha_ingreso","fecha_despido","estado"] },
  { id: "liquidacion_laboral", categoria: "laboral", label: "Carta de Liquidación por Despido", icon: "📋", campos: ["trabajador","empresa","salario_diario","antiguedad_anios","estado"] },
  { id: "contrato_servicios", categoria: "mercantil", label: "Contrato de Prestación de Servicios", icon: "🏢", campos: ["prestador","cliente","descripcion_servicio","honorarios","duracion","estado"] },
  { id: "convenio_pago", categoria: "mercantil", label: "Convenio de Pago / Reconocimiento de Deuda", icon: "💰", campos: ["deudor","acreedor","monto_total","pagos_mensuales","estado"] },
  { id: "pension_alimenticia", categoria: "familia", label: "Solicitud de Pensión Alimenticia", icon: "👨‍👩‍👧", campos: ["solicitante","demandado","menor_nombre","edad_menor","ingreso_demandado","estado"] },
  { id: "convenio_divorcio", categoria: "familia", label: "Convenio de Divorcio por Mutuo Acuerdo", icon: "📝", campos: ["conyuge1","conyuge2","fecha_matrimonio","hijos","bienes","estado"] },
  { id: "queja_profeco", categoria: "consumidor", label: "Escrito de Queja ante PROFECO", icon: "🛒", campos: ["consumidor","proveedor","producto_servicio","monto","descripcion_problema","estado"] },
  { id: "declaracion_hechos", categoria: "penal", label: "Declaración de Hechos ante Ministerio Público", icon: "⚖️", campos: ["declarante","fecha_hechos","lugar_hechos","descripcion_hechos","testigos","estado"] },
];

const CAMPOS_LABELS = {
  arrendador:"Nombre del Arrendador (dueño)", arrendatario:"Nombre del Arrendatario (inquilino)",
  inmueble:"Dirección completa del inmueble", renta_mensual:"Renta mensual (MXN)",
  deposito:"Depósito en garantía (MXN)", duracion_meses:"Duración del contrato (meses)",
  estado:"Estado de la República", motivo:"Motivo de rescisión", fecha_desocupacion:"Fecha de desocupación",
  trabajador:"Nombre del trabajador", empresa:"Nombre de la empresa", puesto:"Puesto / Cargo",
  salario_diario:"Salario diario (MXN)", fecha_ingreso:"Fecha de ingreso (dd/mm/aaaa)",
  fecha_despido:"Fecha de despido (dd/mm/aaaa)", antiguedad_anios:"Antigüedad (años)",
  prestador:"Nombre del prestador de servicios", cliente:"Nombre del cliente",
  descripcion_servicio:"Descripción del servicio", honorarios:"Honorarios totales (MXN)",
  duracion:"Duración del servicio", deudor:"Nombre del deudor", acreedor:"Nombre del acreedor",
  monto_total:"Monto total de la deuda (MXN)", pagos_mensuales:"Pagos mensuales acordados (MXN)",
  solicitante:"Nombre del solicitante", demandado:"Nombre del demandado",
  menor_nombre:"Nombre del menor", edad_menor:"Edad del menor",
  ingreso_demandado:"Ingreso mensual del demandado (MXN)", conyuge1:"Nombre del primer cónyuge",
  conyuge2:"Nombre del segundo cónyuge", fecha_matrimonio:"Fecha de matrimonio",
  hijos:"Nombres y edades de hijos (si aplica)", bienes:"Bienes a dividir",
  consumidor:"Nombre del consumidor", proveedor:"Nombre del proveedor/empresa",
  producto_servicio:"Producto o servicio en disputa", monto:"Monto en disputa (MXN)",
  descripcion_problema:"Descripción detallada del problema", declarante:"Nombre del declarante",
  fecha_hechos:"Fecha de los hechos", lugar_hechos:"Lugar de los hechos",
  descripcion_hechos:"Descripción detallada de los hechos", testigos:"Nombres de testigos (si aplica)",
};

const SYSTEM_PROMPT = `Eres "LexGPT México", un asistente legal experto en el marco jurídico mexicano. Tu objetivo es proporcionar orientación legal precisa, actualizada y accionable para ciudadanos y empresas en México.

Considera la Constitución Política de los Estados Unidos Mexicanos, Códigos Civiles, Penales, Mercantiles y de Procedimientos tanto Federales como de las 32 entidades federativas. Utiliza información de leyes vigentes al 2026, incluyendo el Código Nacional de Procedimientos Civiles y Familiares.

Para cada consulta, estructura tu respuesta EXACTAMENTE en este formato JSON (responde SOLO con JSON válido, sin texto adicional):
{
  "analisis": "Explicación breve de qué ley aplica y por qué (2-3 párrafos)",
  "fundamento": "Cita los artículos específicos de los Códigos o Reglamentos locales/federales",
  "pasos": ["Paso 1...", "Paso 2...", "Paso 3..."],
  "requiereAbogado": "Sí / No / Opcional",
  "costoMin": 0,
  "costoMax": 0,
  "costoDescripcion": "Descripción del rango de costos en MXN",
  "alternativaGratuita": "Menciona Defensoría Pública, PROFECO, CONDUSEF u otras instituciones si aplica",
  "hazloTuMismo": "Si es posible, describe el proceso para que el usuario lo inicie solo. Si no aplica, escribe null",
  "ambitoFederal": true
}`;

const TEMPLATE_SYSTEM = `Eres un experto en derecho mexicano. Genera documentos legales formales en texto plano (sin markdown, sin asteriscos, sin símbolos especiales de formato). El documento debe ser completo, con cláusulas legales apropiadas según la legislación mexicana vigente 2026, específico para el estado indicado, con la fecha proporcionada, espacios para firma y rubrica. Usa formato de documento legal mexicano con encabezado centrado, numeración de cláusulas y sección de firmas al final.`;

function callGroq(messages, maxTokens = 1500) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: maxTokens, messages })
  });
}

/* ── StepIndicator ── */
function StepIndicator({ current, total }) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:"2rem" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", flex: i < total-1 ? 1 : "none" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background: i<current?"#C8A96E":i===current?"#1a1a2e":"#1e1e35", border: i===current?"2px solid #C8A96E":"2px solid transparent", color: i<current?"#0f0f1e":i===current?"#C8A96E":"#555", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0, transition:"all 0.3s" }}>
            {i < current ? "✓" : i+1}
          </div>
          {i < total-1 && <div style={{ flex:1, height:2, background: i<current?"#C8A96E":"#1e1e35", transition:"background 0.3s" }} />}
        </div>
      ))}
    </div>
  );
}

/* ── InstallBanner ── */
function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{ position:"fixed", bottom:"1rem", left:"1rem", right:"1rem", background:"#1a1a2e", border:"1px solid #C8A96E", borderRadius:14, padding:"1rem 1.25rem", zIndex:200, display:"flex", alignItems:"center", gap:"1rem", boxShadow:"0 8px 32px rgba(0,0,0,0.6)", animation:"fadeUp 0.4s ease" }}>
      <span style={{ fontSize:28 }}>⚖️</span>
      <div style={{ flex:1 }}>
        <div style={{ color:"#C8A96E", fontWeight:700, fontSize:14, marginBottom:2 }}>Instalar LexGPT México</div>
        <div style={{ color:"#888", fontSize:12 }}>Agrégala a tu pantalla de inicio</div>
      </div>
      <div style={{ display:"flex", gap:"0.5rem" }}>
        <button onClick={onDismiss} style={{ background:"none", border:"1px solid #3a3a5a", color:"#888", padding:"0.4rem 0.8rem", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Ahora no</button>
        <button onClick={onInstall} style={{ background:"#C8A96E", border:"none", color:"#0f0f1e", padding:"0.4rem 0.9rem", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>Instalar</button>
      </div>
    </div>
  );
}

/* ── HistoryPanel ── */
function HistoryPanel({ history, onSelect, onClose, onClear }) {
  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:Math.min(340,window.innerWidth), background:"#0f0f1e", borderLeft:"1px solid #2a2a4a", zIndex:100, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid #2a2a4a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ color:"#C8A96E", fontFamily:"'Playfair Display', serif", margin:0, fontSize:18 }}>Historial</h3>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          {history.length > 0 && <button onClick={onClear} style={{ background:"none", border:"1px solid #3a3a5a", color:"#888", padding:"0.3rem 0.6rem", borderRadius:6, cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>Limpiar</button>}
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#999", cursor:"pointer", fontSize:22 }}>×</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
        {history.length === 0
          ? <div style={{ textAlign:"center", marginTop:"3rem" }}><div style={{ fontSize:40, marginBottom:"0.75rem" }}>📋</div><p style={{ color:"#555", fontSize:13 }}>No hay consultas previas</p></div>
          : history.map((item,i) => (
            <div key={i} onClick={() => onSelect(item)} style={{ padding:"0.85rem 1rem", marginBottom:"0.6rem", background:"#1a1a2e", borderRadius:10, cursor:"pointer", border:"1px solid #2a2a4a", transition:"border-color 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.borderColor="#C8A96E"}
              onMouseOut={e=>e.currentTarget.style.borderColor="#2a2a4a"}>
              <div style={{ color:"#C8A96E", fontSize:11, marginBottom:4 }}>{item.categoria} · {item.estado}</div>
              <div style={{ color:"#ccc", fontSize:13, lineHeight:1.5, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{item.consulta}</div>
              <div style={{ color:"#444", fontSize:11, marginTop:5 }}>{item.fecha}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

/* ── InfoAdicional ── */
function InfoAdicionalPanel({ onSubmit, loading }) {
  const [texto, setTexto] = useState("");
  return (
    <div style={{ marginTop:"1.25rem", background:"#13132a", border:"1px solid #C8A96E33", borderRadius:12, padding:"1.25rem", animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.6rem" }}>
        <span style={{ fontSize:18 }}>💬</span>
        <h4 style={{ color:"#C8A96E", fontFamily:"'Playfair Display', serif", margin:0, fontSize:15 }}>¿Olvidaste algún detalle?</h4>
      </div>
      <p style={{ color:"#777", fontSize:13, marginBottom:"0.75rem", lineHeight:1.6 }}>Agrega información adicional para refinar el análisis sin empezar de nuevo.</p>
      <textarea value={texto} onChange={e=>setTexto(e.target.value)}
        placeholder="Ej: También tengo contrato firmado, hay daños previos registrados, el arrendador me debe servicios..."
        rows={4}
        style={{ width:"100%", padding:"0.85rem", borderRadius:10, border:"1px solid #2a2a4a", background:"#0f0f1e", color:"#e8e8f0", fontSize:13, fontFamily:"inherit", lineHeight:1.65, resize:"vertical", marginBottom:"0.75rem", transition:"border-color 0.2s" }}
        onFocus={e=>e.target.style.borderColor="#C8A96E"}
        onBlur={e=>e.target.style.borderColor="#2a2a4a"}
      />
      <button onClick={() => texto.trim() && onSubmit(texto)} disabled={!texto.trim()||loading}
        style={{ width:"100%", padding:"0.75rem", borderRadius:10, border:"none", background: texto.trim()&&!loading?"#C8A96E":"#1e1e35", color: texto.trim()&&!loading?"#0f0f1e":"#444", cursor: texto.trim()&&!loading?"pointer":"not-allowed", fontFamily:"'Playfair Display', serif", fontSize:14, fontWeight:700, transition:"all 0.2s" }}>
        {loading ? <span style={{ animation:"pulse 1s infinite", display:"inline-block" }}>⏳ Actualizando análisis...</span> : "🔄 Actualizar Análisis"}
      </button>
    </div>
  );
}

/* ── ResultCard ── */
function ResultCard({ result, onReset, onInfoAdicional, loadingAdicional }) {
  const [tab, setTab] = useState("analisis");
  const tabs = [
    {id:"analisis",label:"Análisis"},{id:"fundamento",label:"Fundamento"},
    {id:"pasos",label:"Ruta"},{id:"costos",label:"Costos"},{id:"hazlo",label:"Pro Se"},
  ];
  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"1.25rem", overflowX:"auto", paddingBottom:"0.25rem" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"0.4rem 0.9rem", borderRadius:20, border:"1px solid", borderColor: tab===t.id?"#C8A96E":"#2a2a4a", background: tab===t.id?"#C8A96E":"transparent", color: tab===t.id?"#0f0f1e":"#888", cursor:"pointer", fontSize:13, fontWeight: tab===t.id?700:400, transition:"all 0.2s", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>{t.label}</button>
        ))}
      </div>
      <div style={{ background:"#1a1a2e", borderRadius:14, padding:"1.5rem", border:"1px solid #2a2a4a", minHeight:200 }}>
        {tab==="analisis" && <div>
          <span style={{ background: result.ambitoFederal?"#1e3a5f":"#2d1b4e", color: result.ambitoFederal?"#5ba3f5":"#b07fff", padding:"0.25rem 0.75rem", borderRadius:12, fontSize:12, display:"inline-block", marginBottom:"1rem" }}>
            {result.ambitoFederal?"⚖️ Federal":"🏛️ Estatal"}
          </span>
          <p style={{ color:"#d4d4e8", lineHeight:1.85, fontSize:14, whiteSpace:"pre-wrap", margin:0 }}>{result.analisis}</p>
        </div>}
        {tab==="fundamento" && <div>
          <h4 style={{ color:"#C8A96E", fontFamily:"'Playfair Display', serif", marginTop:0, marginBottom:"0.75rem" }}>Artículos Aplicables</h4>
          <p style={{ color:"#d4d4e8", lineHeight:1.85, fontSize:14, whiteSpace:"pre-wrap", margin:0 }}>{result.fundamento}</p>
        </div>}
        {tab==="pasos" && <div>
          <h4 style={{ color:"#C8A96E", fontFamily:"'Playfair Display', serif", marginTop:0, marginBottom:"1rem" }}>Siguientes Pasos</h4>
          {result.pasos.map((paso,i) => (
            <div key={i} style={{ display:"flex", gap:"0.75rem", marginBottom:"0.85rem", alignItems:"flex-start" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:"#C8A96E", color:"#0f0f1e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
              <p style={{ color:"#d4d4e8", fontSize:14, lineHeight:1.7, margin:0 }}>{paso}</p>
            </div>
          ))}
        </div>}
        {tab==="costos" && <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
            <div style={{ background:"#0f0f1e", borderRadius:10, padding:"0.9rem", border:"1px solid #2a2a4a" }}>
              <div style={{ color:"#666", fontSize:11, marginBottom:4, textTransform:"uppercase", letterSpacing:1 }}>Requiere Abogado</div>
              <div style={{ color: result.requiereAbogado==="Sí"?"#f87171":result.requiereAbogado==="No"?"#4ade80":"#fbbf24", fontWeight:700, fontSize:15 }}>{result.requiereAbogado}</div>
            </div>
            <div style={{ background:"#0f0f1e", borderRadius:10, padding:"0.9rem", border:"1px solid #2a2a4a" }}>
              <div style={{ color:"#666", fontSize:11, marginBottom:4, textTransform:"uppercase", letterSpacing:1 }}>Rango Estimado</div>
              <div style={{ color:"#C8A96E", fontWeight:700, fontSize:14 }}>{result.costoMin===0&&result.costoMax===0?"Gratuito":`$${result.costoMin.toLocaleString()} – $${result.costoMax.toLocaleString()} MXN`}</div>
            </div>
          </div>
          <p style={{ color:"#d4d4e8", fontSize:14, lineHeight:1.7, marginBottom:"0.75rem" }}>{result.costoDescripcion}</p>
          {result.alternativaGratuita && <div style={{ background:"#0d2d1a", border:"1px solid #1a6b3a", borderRadius:10, padding:"1rem" }}>
            <div style={{ color:"#4ade80", fontSize:13, fontWeight:600, marginBottom:4 }}>💚 Alternativa Gratuita</div>
            <p style={{ color:"#a7f3d0", fontSize:13, margin:0, lineHeight:1.65 }}>{result.alternativaGratuita}</p>
          </div>}
        </div>}
        {tab==="hazlo" && <div>
          <h4 style={{ color:"#C8A96E", fontFamily:"'Playfair Display', serif", marginTop:0, marginBottom:"0.75rem" }}>Guía Pro Se (Sin Abogado)</h4>
          {result.hazloTuMismo
            ? <p style={{ color:"#d4d4e8", lineHeight:1.85, fontSize:14, whiteSpace:"pre-wrap", margin:0 }}>{result.hazloTuMismo}</p>
            : <p style={{ color:"#666", fontSize:14, margin:0 }}>Para este caso se recomienda representación profesional. Revisa la pestaña Costos para alternativas gratuitas.</p>
          }
        </div>}
      </div>

      <InfoAdicionalPanel onSubmit={onInfoAdicional} loading={loadingAdicional} />

      <div style={{ marginTop:"1rem", padding:"0.75rem 1rem", background:"#1a1209", border:"1px solid #4a3510", borderRadius:10 }}>
        <p style={{ color:"#9a7340", fontSize:12, margin:0, lineHeight:1.6 }}>⚠️ <strong>Aviso de Deslinde:</strong> Esta es una orientación basada en IA y no sustituye la asesoría de un profesional con cédula vigente.</p>
      </div>
      <button onClick={onReset} style={{ marginTop:"1.5rem", width:"100%", padding:"0.9rem", background:"transparent", border:"1px solid #C8A96E", color:"#C8A96E", borderRadius:12, cursor:"pointer", fontFamily:"'Playfair Display', serif", fontSize:15, transition:"all 0.2s" }}
        onMouseOver={e=>{e.currentTarget.style.background="#C8A96E";e.currentTarget.style.color="#0f0f1e";}}
        onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#C8A96E";}}>
        + Nueva Consulta
      </button>
    </div>
  );
}

/* ── Templates ── */
function TemplatesSection({ estadoDefault }) {
  const [filtro, setFiltro] = useState("todos");
  const [seleccionado, setSeleccionado] = useState(null);
  const [campos, setCampos] = useState({});
  const [generando, setGenerando] = useState(false);
  const [documento, setDocumento] = useState("");
  const [error, setError] = useState("");

  const filtros = [
    {id:"todos",label:"Todos"},{id:"arrendamiento",label:"🏠 Arrendamiento"},
    {id:"laboral",label:"💼 Laboral"},{id:"mercantil",label:"🏢 Mercantil"},
    {id:"familia",label:"👨‍👩‍👧 Familia"},{id:"consumidor",label:"🛒 Consumidor"},{id:"penal",label:"⚖️ Penal"},
  ];

  const lista = TEMPLATES.filter(t => filtro==="todos" || t.categoria===filtro);

  const iniciar = (t) => {
    const init = {};
    t.campos.forEach(c => { init[c] = c==="estado" ? (estadoDefault||"") : ""; });
    setCampos(init); setSeleccionado(t); setDocumento(""); setError("");
  };

  const generar = async () => {
    setGenerando(true); setError("");
    const fecha = new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
    const datos = Object.entries(campos).map(([k,v]) => `${CAMPOS_LABELS[k]||k}: ${v||"___________"}`).join("\n");
    const prompt = `Genera el siguiente documento legal: "${seleccionado.label}"\nEstado: ${campos.estado||"México"}\nFecha: ${fecha}\n\nDatos:\n${datos}\n\nGenera el documento legal completo y formal.`;
    try {
      const res = await callGroq([{role:"system",content:TEMPLATE_SYSTEM},{role:"user",content:prompt}], 2500);
      const data = await res.json();
      setDocumento(data.choices?.[0]?.message?.content || "");
    } catch(_) { setError("Error al generar el documento. Intenta de nuevo."); }
    finally { setGenerando(false); }
  };

  const descargar = () => {
    const blob = new Blob([documento], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${seleccionado.label.replace(/ /g,"_")}_${campos.estado||"Mexico"}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (documento) return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.25rem" }}>
        <button onClick={()=>setDocumento("")} style={{ background:"none", border:"1px solid #2a2a4a", color:"#888", padding:"0.4rem 0.75rem", borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>← Volver</button>
        <h3 style={{ color:"#C8A96E", fontFamily:"'Playfair Display', serif", margin:0, fontSize:15 }}>{seleccionado.icon} {seleccionado.label}</h3>
      </div>
      <div style={{ background:"#1a1a2e", border:"1px solid #2a2a4a", borderRadius:12, padding:"1.5rem", marginBottom:"1rem", maxHeight:500, overflowY:"auto" }}>
        <pre style={{ color:"#d4d4e8", fontSize:13, lineHeight:1.85, whiteSpace:"pre-wrap", fontFamily:"Georgia, serif", margin:0 }}>{documento}</pre>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
        <button onClick={descargar} style={{ padding:"0.85rem", borderRadius:10, border:"none", background:"#C8A96E", color:"#0f0f1e", cursor:"pointer", fontFamily:"'Playfair Display', serif", fontSize:14, fontWeight:700 }}>⬇️ Descargar .txt</button>
        <button onClick={()=>{setSeleccionado(null);setDocumento("");}} style={{ padding:"0.85rem", borderRadius:10, border:"1px solid #2a2a4a", background:"transparent", color:"#C8A96E", cursor:"pointer", fontFamily:"'Playfair Display', serif", fontSize:14 }}>📄 Otro Documento</button>
      </div>
      <div style={{ marginTop:"1rem", padding:"0.75rem 1rem", background:"#1a1209", border:"1px solid #4a3510", borderRadius:10 }}>
        <p style={{ color:"#9a7340", fontSize:12, margin:0 }}>⚠️ Documento generado por IA. Revísalo con un abogado antes de presentarlo oficialmente.</p>
      </div>
    </div>
  );

  if (seleccionado) return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.25rem" }}>
        <button onClick={()=>setSeleccionado(null)} style={{ background:"none", border:"1px solid #2a2a4a", color:"#888", padding:"0.4rem 0.75rem", borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>← Volver</button>
        <div>
          <div style={{ color:"#C8A96E", fontFamily:"'Playfair Display', serif", fontSize:16 }}>{seleccionado.icon} {seleccionado.label}</div>
          <div style={{ color:"#666", fontSize:12 }}>Completa los campos para generar el documento</div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem", marginBottom:"1.25rem" }}>
        {seleccionado.campos.map(campo => (
          <div key={campo}>
            <label style={{ display:"block", color:"#aaa", fontSize:12, marginBottom:"0.3rem", textTransform:"uppercase", letterSpacing:0.5 }}>{CAMPOS_LABELS[campo]||campo}</label>
            {campo==="estado"
              ? <select value={campos[campo]||""} onChange={e=>setCampos(p=>({...p,[campo]:e.target.value}))} style={{ width:"100%", padding:"0.7rem 0.85rem", borderRadius:8, border:"1px solid #2a2a4a", background:"#1a1a2e", color: campos[campo]?"#e8e8f0":"#555", fontSize:14, fontFamily:"inherit", WebkitAppearance:"none" }}>
                  <option value="">Selecciona un estado...</option>
                  {ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}
                </select>
              : <input type="text" value={campos[campo]||""} onChange={e=>setCampos(p=>({...p,[campo]:e.target.value}))} placeholder={`Ingresa ${(CAMPOS_LABELS[campo]||campo).toLowerCase()}...`}
                  style={{ width:"100%", padding:"0.7rem 0.85rem", borderRadius:8, border:"1px solid #2a2a4a", background:"#1a1a2e", color:"#e8e8f0", fontSize:14, fontFamily:"inherit", transition:"border-color 0.2s" }}
                  onFocus={e=>e.target.style.borderColor="#C8A96E"}
                  onBlur={e=>e.target.style.borderColor="#2a2a4a"} />
            }
          </div>
        ))}
      </div>
      {error && <p style={{ color:"#f87171", fontSize:13, marginBottom:"0.75rem" }}>⚠️ {error}</p>}
      <button onClick={generar} disabled={generando} style={{ width:"100%", padding:"0.9rem", borderRadius:12, border:"none", background: !generando?"#C8A96E":"#1e1e35", color: !generando?"#0f0f1e":"#444", cursor: !generando?"pointer":"not-allowed", fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, transition:"all 0.2s" }}>
        {generando ? <span style={{ animation:"pulse 1s infinite", display:"inline-block" }}>⏳ Generando documento...</span> : "📄 Generar Documento"}
      </button>
    </div>
  );

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ textAlign:"center", marginBottom:"2rem" }}>
        <div style={{ fontSize:40, marginBottom:"0.5rem" }}>📄</div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:24, color:"#fff", fontWeight:400, marginBottom:"0.4rem" }}>Templates <em style={{ color:"#C8A96E" }}>Legales</em></h2>
        <p style={{ color:"#666", fontSize:14 }}>Genera documentos personalizados para tu estado y descárgalos</p>
      </div>
      <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
        {filtros.map(f => (
          <button key={f.id} onClick={()=>setFiltro(f.id)} style={{ padding:"0.35rem 0.85rem", borderRadius:20, border:"1px solid", borderColor: filtro===f.id?"#C8A96E":"#2a2a4a", background: filtro===f.id?"#C8A96E":"transparent", color: filtro===f.id?"#0f0f1e":"#888", cursor:"pointer", fontSize:12, fontFamily:"inherit", transition:"all 0.2s", whiteSpace:"nowrap" }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.65rem" }}>
        {lista.map(t => (
          <button key={t.id} onClick={()=>iniciar(t)} style={{ padding:"1rem 1.1rem", borderRadius:12, border:"1px solid #2a2a4a", background:"#1a1a2e", color:"#d4d4e8", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem" }}
            onMouseOver={e=>{e.currentTarget.style.borderColor="#C8A96E";e.currentTarget.style.background="#1e1e38";}}
            onMouseOut={e=>{e.currentTarget.style.borderColor="#2a2a4a";e.currentTarget.style.background="#1a1a2e";}}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize:14, fontWeight:500, color:"#e8e8f0" }}>{t.label}</div>
                <div style={{ fontSize:11, color:"#666", marginTop:2 }}>{t.campos.length} campos · Descarga en .txt</div>
              </div>
            </div>
            <span style={{ color:"#C8A96E", fontSize:18, flexShrink:0 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── App Principal ── */
export default function App() {
  const [vista, setVista] = useState("consulta");
  const [step, setStep] = useState(0);
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [consulta, setConsulta] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAdicional, setLoadingAdicional] = useState(false);
  const [result, setResult] = useState(null);
  const [contexto, setContexto] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    try { const s = localStorage.getItem("lexgpt_history"); if(s) setHistory(JSON.parse(s)); } catch(_) {}
    const h = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const handleInstall = async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice;
    setDeferredPrompt(null); setShowInstall(false);
  };

  const saveHistory = (item) => {
    const u = [item,...history].slice(0,20);
    setHistory(u);
    try { localStorage.setItem("lexgpt_history", JSON.stringify(u)); } catch(_) {}
  };

  const handleSubmit = async () => {
    if(!consulta.trim()) return;
    setLoading(true); setError("");
    const msg = `Estado: ${estado||"No especificado"}\nCategoría: ${categoria||"General"}\n\nConsulta: ${consulta}`;
    setContexto(msg);
    try {
      const res = await callGroq([{role:"system",content:SYSTEM_PROMPT},{role:"user",content:msg}]);
      const data = await res.json();
      const parsed = JSON.parse((data.choices?.[0]?.message?.content||"").replace(/```json|```/g,"").trim());
      setResult(parsed); setStep(4);
      saveHistory({ categoria: CATEGORIAS.find(c=>c.id===categoria)?.label||categoria, estado, consulta, result:parsed, fecha: new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) });
    } catch(_) { setError("Ocurrió un error al procesar tu consulta. Por favor intenta de nuevo."); }
    finally { setLoading(false); }
  };

  const handleInfoAdicional = async (extra) => {
    setLoadingAdicional(true);
    const msgActualizado = `${contexto}\n\nInformación adicional: ${extra}\n\nActualiza tu análisis considerando esta información adicional.`;
    try {
      const res = await callGroq([{role:"system",content:SYSTEM_PROMPT},{role:"user",content:msgActualizado}]);
      const data = await res.json();
      const parsed = JSON.parse((data.choices?.[0]?.message?.content||"").replace(/```json|```/g,"").trim());
      setResult(parsed); setContexto(msgActualizado);
    } catch(_) {} finally { setLoadingAdicional(false); }
  };

  const resetForm = () => { setStep(0); setCategoria(""); setEstado(""); setConsulta(""); setResult(null); setError(""); setContexto(""); };
  const loadFromHistory = (item) => { setCategoria(CATEGORIAS.find(c=>c.label===item.categoria)?.id||""); setEstado(item.estado); setConsulta(item.consulta); setResult(item.result); setStep(4); setShowHistory(false); };
  const catObj = CATEGORIAS.find(c=>c.id===categoria);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Crimson+Pro:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%}
        body{background:#080814;-webkit-font-smoothing:antialiased}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        textarea,input{-webkit-appearance:none}
        textarea:focus,select:focus,input:focus,button:focus{outline:none}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0f0f1e}::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:3px}
        select option{background:#1a1a2e;color:#e8e8f0}
      `}</style>
      <div style={{ minHeight:"100dvh", background:"#080814", fontFamily:"'Crimson Pro', Georgia, serif", color:"#e8e8f0" }}>

        {/* Header */}
        <header style={{ borderBottom:"1px solid #1a1a30", padding:"0.9rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(8,8,20,0.96)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:50, paddingTop:"calc(0.9rem + env(safe-area-inset-top))" }}>
          <div>
            <div style={{ display:"flex", alignItems:"baseline", gap:"0.4rem" }}>
              <span style={{ fontFamily:"'Playfair Display', serif", fontSize:20, color:"#C8A96E", fontWeight:700 }}>LexGPT</span>
              <span style={{ fontFamily:"'Playfair Display', serif", fontSize:20, color:"#fff" }}>México</span>
            </div>
            <div style={{ fontSize:10, color:"#555", letterSpacing:2, textTransform:"uppercase" }}>Orientación Legal · IA</div>
          </div>
          <button onClick={()=>setShowHistory(true)} style={{ background:"none", border:"1px solid #2a2a4a", color:"#888", padding:"0.45rem 0.7rem", borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:"inherit", display:"flex", alignItems:"center", gap:"0.35rem", transition:"all 0.2s" }}
            onMouseOver={e=>{e.currentTarget.style.borderColor="#C8A96E";e.currentTarget.style.color="#C8A96E";}}
            onMouseOut={e=>{e.currentTarget.style.borderColor="#2a2a4a";e.currentTarget.style.color="#888";}}>
            📋 {history.length>0 && <span style={{ background:"#C8A96E", color:"#0f0f1e", borderRadius:10, padding:"0 5px", fontSize:10, fontWeight:700 }}>{history.length}</span>}
          </button>
        </header>

        {/* Nav */}
        <div style={{ display:"flex", borderBottom:"1px solid #1a1a30", background:"rgba(8,8,20,0.96)", position:"sticky", top:57, zIndex:49 }}>
          {[{id:"consulta",label:"⚖️ Consulta Legal"},{id:"templates",label:"📄 Templates"}].map(tab => (
            <button key={tab.id} onClick={()=>setVista(tab.id)} style={{ flex:1, padding:"0.75rem", border:"none", borderBottom:`2px solid ${vista===tab.id?"#C8A96E":"transparent"}`, background:"transparent", color: vista===tab.id?"#C8A96E":"#666", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight: vista===tab.id?600:400, transition:"all 0.2s" }}>{tab.label}</button>
          ))}
        </div>

        <main style={{ maxWidth:680, margin:"0 auto", padding:"2rem 1.25rem", paddingBottom:"6rem" }}>

          {vista==="consulta" && (
            <>
              {step<4 && (<>
                {step===0 && <div style={{ textAlign:"center", marginBottom:"2.5rem", animation:"fadeUp 0.6s ease" }}>
                  <div style={{ fontSize:44, marginBottom:"0.5rem" }}>⚖️</div>
                  <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:400, color:"#fff", marginBottom:"0.4rem" }}>¿Cómo podemos <em style={{ color:"#C8A96E" }}>ayudarte</em>?</h1>
                  <p style={{ color:"#666", fontSize:15 }}>Orientación legal gratuita para México</p>
                </div>}
                <StepIndicator current={step} total={3} />
              </>)}

              {step===0 && <div style={{ animation:"fadeUp 0.4s ease" }}>
                <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:18, color:"#C8A96E", marginBottom:"1.1rem", fontWeight:400 }}>1. ¿Sobre qué tema es tu consulta?</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
                  {CATEGORIAS.map(cat => (
                    <button key={cat.id} onClick={()=>{setCategoria(cat.id);setStep(1);}} style={{ padding:"0.85rem 0.9rem", borderRadius:10, border:"1px solid #2a2a4a", background:"#1a1a2e", color:"#d4d4e8", cursor:"pointer", textAlign:"left", fontSize:13, fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", gap:"0.55rem", lineHeight:1.3 }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor="#C8A96E";e.currentTarget.style.background="#1e1e38";}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor="#2a2a4a";e.currentTarget.style.background="#1a1a2e";}}>
                      <span style={{ fontSize:18, flexShrink:0 }}>{cat.icon}</span><span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>}

              {step===1 && <div style={{ animation:"fadeUp 0.4s ease" }}>
                <div style={{ marginBottom:"1rem", display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.4rem 0.85rem", background:"#1a1a2e", border:"1px solid #2a2a4a", borderRadius:20, fontSize:13 }}>
                  <span>{catObj?.icon}</span><span style={{ color:"#C8A96E" }}>{catObj?.label}</span>
                </div>
                <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:18, color:"#C8A96E", marginBottom:"1.1rem", fontWeight:400 }}>2. ¿En qué estado ocurrió?</h2>
                <select value={estado} onChange={e=>setEstado(e.target.value)} style={{ width:"100%", padding:"0.9rem 1rem", borderRadius:10, border:"1px solid #2a2a4a", background:"#1a1a2e", color: estado?"#e8e8f0":"#555", fontSize:15, fontFamily:"inherit", marginBottom:"1.25rem", cursor:"pointer", WebkitAppearance:"none" }}>
                  <option value="">Selecciona un estado...</option>
                  <option value="Federal">🇲🇽 Asunto Federal</option>
                  {ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}
                </select>
                <div style={{ display:"flex", gap:"0.65rem" }}>
                  <button onClick={()=>setStep(0)} style={{ padding:"0.8rem 1.25rem", borderRadius:10, border:"1px solid #2a2a4a", background:"transparent", color:"#777", cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>← Atrás</button>
                  <button onClick={()=>setStep(2)} disabled={!estado} style={{ flex:1, padding:"0.8rem", borderRadius:10, border:"none", background: estado?"#C8A96E":"#1e1e35", color: estado?"#0f0f1e":"#444", cursor: estado?"pointer":"not-allowed", fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, transition:"all 0.2s" }}>Continuar →</button>
                </div>
              </div>}

              {step===2 && <div style={{ animation:"fadeUp 0.4s ease" }}>
                <div style={{ marginBottom:"1rem", display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                  <span style={{ padding:"0.3rem 0.8rem", background:"#1a1a2e", border:"1px solid #2a2a4a", borderRadius:20, fontSize:12, color:"#C8A96E" }}>{catObj?.icon} {catObj?.label}</span>
                  <span style={{ padding:"0.3rem 0.8rem", background:"#1a1a2e", border:"1px solid #2a2a4a", borderRadius:20, fontSize:12, color:"#888" }}>📍 {estado}</span>
                </div>
                <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:18, color:"#C8A96E", marginBottom:"0.4rem", fontWeight:400 }}>3. Describe tu situación</h2>
                <p style={{ color:"#666", fontSize:13, marginBottom:"0.9rem" }}>Más detalle = orientación más precisa</p>
                <textarea ref={textRef} value={consulta} onChange={e=>setConsulta(e.target.value)} placeholder="Ej: Mi arrendador no me regresa el depósito de dos meses de renta aunque entregué el inmueble en buen estado hace 30 días..." rows={6}
                  style={{ width:"100%", padding:"1rem", borderRadius:12, border:"1px solid #2a2a4a", background:"#1a1a2e", color:"#e8e8f0", fontSize:14, fontFamily:"inherit", lineHeight:1.7, resize:"vertical", marginBottom:"1rem", transition:"border-color 0.2s" }}
                  onFocus={e=>e.target.style.borderColor="#C8A96E"}
                  onBlur={e=>e.target.style.borderColor="#2a2a4a"} />
                {error && <p style={{ color:"#f87171", fontSize:13, marginBottom:"0.75rem" }}>⚠️ {error}</p>}
                <div style={{ display:"flex", gap:"0.65rem" }}>
                  <button onClick={()=>setStep(1)} style={{ padding:"0.8rem 1.25rem", borderRadius:10, border:"1px solid #2a2a4a", background:"transparent", color:"#777", cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>← Atrás</button>
                  <button onClick={handleSubmit} disabled={!consulta.trim()||loading} style={{ flex:1, padding:"0.85rem", borderRadius:10, border:"none", background: consulta.trim()&&!loading?"#C8A96E":"#1e1e35", color: consulta.trim()&&!loading?"#0f0f1e":"#444", cursor: consulta.trim()&&!loading?"pointer":"not-allowed", fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, transition:"all 0.2s" }}>
                    {loading ? <span style={{ animation:"pulse 1s infinite", display:"inline-block" }}>⏳ Analizando...</span> : "🔍 Obtener Orientación Legal"}
                  </button>
                </div>
              </div>}

              {step===4 && result && <ResultCard result={result} onReset={resetForm} onInfoAdicional={handleInfoAdicional} loadingAdicional={loadingAdicional} />}
            </>
          )}

          {vista==="templates" && <TemplatesSection estadoDefault={estado} />}
        </main>

        {showHistory && (<>
          <div onClick={()=>setShowHistory(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:99 }} />
          <HistoryPanel history={history} onSelect={loadFromHistory} onClose={()=>setShowHistory(false)} onClear={()=>{setHistory([]);try{localStorage.removeItem("lexgpt_history")}catch(_){}}} />
        </>)}
        {showInstall && <InstallBanner onInstall={handleInstall} onDismiss={()=>setShowInstall(false)} />}
      </div>
    </>
  );
}
