// ── TAB LOGIC ────────────────────────────────
function buildTabs() {
  const bar = document.getElementById('tab-bar');
  YEARS.forEach(y => {
    const b = document.createElement('button');
    b.className = 'tab-btn';
    b.dataset.id = y.id;
    b.textContent = `${y.label} · ${y.id}`;
    b.style.setProperty('--yc', y.color);
    b.onclick = () => switchTab(y.id);
    bar.appendChild(b);
  });
}

function switchTab(id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.id === id));
  const year = YEARS.find(y => y.id === id);
  renderYear(year);
  highlightYear(id);
}

function renderYear(year) {
  const panel = document.getElementById('year-panel');
  panel.style.setProperty('--yc', year.color);

  let html = `<div class="yp-head">
    <span class="yp-n" style="color:${year.color}">${year.id}</span>
    <div class="yp-sub">${year.label}</div>
  </div>
  <div class="yp-period">${year.period}</div>
  <div class="cards">`;

  year.stats.forEach(st => {
    if (st.t === 'sec') {
      html += `<div class="sec-div">${st.title}</div>`;
    } else if (st.t === 'm') {
      const fc = st.ft ? ' ft' : '';
      html += `<div class="cm${fc}" style="--yc:${year.color}">
        <div class="v">${st.v}</div>
        ${st.sub ? `<div class="v-sub">${st.sub}</div>` : ''}
        <div class="l">${st.l}</div>
        ${st.s ? `<div class="s">${st.s}</div>` : ''}
      </div>`;
    } else if (st.t === 's') {
      html += `<div class="cs-card"><p>${st.h}</p></div>`;
    }
  });

  html += `</div>`;
  panel.innerHTML = html;
}

// ── CHARTS ───────────────────────────────────
// Paleta Okabe-Ito — accesible para daltonismo
const CLRS = ['#E69F00','#56B4E9','#009E73','#F0E442','#0072B2','#D55E00','#CC79A7','#888888'];
const LBL  = ['2017','2018','2019','2020','2021','2022','2023','2024'];
const LBL9 = ['2017','2018','2019','2020','2021','2022','2023','2024','2025'];
const CLR9 = [...CLRS,'#CCC'];
const CI   = {}; // chart instances

function getBG()     { return getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); }
function getBorder() { return getComputedStyle(document.documentElement).getPropertyValue('--border').trim(); }
function getMuted()  { return getComputedStyle(document.documentElement).getPropertyValue('--muted').trim(); }

function applyChartTheme() {
  const isDark = !document.documentElement.classList.contains('light');
  const gridColor   = isDark ? '#1a1815' : '#e0dbd2';
  const tickColor   = isDark ? '#ccc' : '#a09080';
  const legendColor = isDark ? '#ccc' : '#a09080';
  const bgColor     = isDark ? '#0f0e0c' : '#ffffff';
  Chart.defaults.color       = tickColor;
  Chart.defaults.borderColor = gridColor;
  Object.values(CI).forEach(chart => {
    chart.data.datasets.forEach(ds => {
      if (ds.pointBorderColor) ds.pointBorderColor = bgColor;
    });
    if (chart.options.scales) {
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.grid) scale.grid.color = scale.grid.display === false ? undefined : gridColor;
        if (scale.ticks) scale.ticks.color = tickColor;
      });
    }
    if (chart.options.plugins?.legend?.labels)
      chart.options.plugins.legend.labels.color = legendColor;
    chart.update('none');
  });
}

Chart.defaults.font.family = 'system-ui,-apple-system,sans-serif';
Chart.defaults.font.size   = 11;

function grad(ctx, c) {
  const g = ctx.createLinearGradient(0,0,0,180);
  g.addColorStop(0, c+'44'); g.addColorStop(1, c+'00');
  return g;
}

function line(id, data, color, opts={}) {
  const ctx  = document.getElementById(id).getContext('2d');
  const lbl  = opts.lbl  || LBL;
  const clrs = opts.clrs || CLRS;
  CI[id] = new Chart(ctx, {
    type:'line',
    data:{ labels:lbl, datasets:[{
      data, borderColor:color, backgroundColor:grad(ctx,color), fill:true,
      pointBackgroundColor:clrs, pointBorderColor:getBG(), pointBorderWidth:2,
      pointRadius:5, pointHoverRadius:7, tension:0.35, spanGaps:true
    }]},
    options:{
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>opts.fmt?opts.fmt(c.parsed.y):' '+c.parsed.y}} },
      scales:{
        y:{ min:opts.min, max:opts.max, grid:{color:'#1a1815'},
            ticks:{callback:v=>opts.pct?v+'%':v>=1000?(v/1000).toFixed(0)+'k':v} },
        x:{ grid:{display:false} }
      }
    }
  });
}

function bar(id, datasets, opts={}) {
  const ctx = document.getElementById(id).getContext('2d');
  const lbl = opts.lbl || LBL;
  CI[id] = new Chart(ctx, {
    type:'bar',
    data:{ labels:lbl, datasets },
    options:{
      plugins:{ legend:{display:datasets.length>1, labels:{color:'#5a5040',boxWidth:10,padding:12}} },
      scales:{
        y:{ grid:{color:'#1a1815'}, ticks:{callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v} },
        x:{ grid:{display:false} }
      }
    }
  });
}

function initCharts() {
  // Orden de datos: [2017,2018,2019,2020,2021,2022,2023,2024]
  // 2022 y 2023 = Años 6 y 7 desglosados (null = pendiente de recuperar)

  // 1 Suscriptores activos al cierre de cada año — 2025: 13741
  line('c-subs',[1992,4957,9670,14032,14866,14521,14485,14360,13741],'#e8956d',{lbl:LBL9,clrs:CLR9,fmt:v=>' '+v.toLocaleString('es')+' suscriptores'});

  // 2 Tasa de apertura — 2025: pendiente
  line('c-open',[61.09,59.18,55.98,53.13,53.17,57.4,54.37,55.59,52],'#9a5fd1',{lbl:LBL9,clrs:CLR9,min:48,max:66,pct:true,fmt:v=>' '+v.toFixed(2)+'%'});

  // 3 Temas sugeridos por año (diferencia año a año del total acumulado)
  // 2017:172 · 2018:263 · 2019:218 · 2020:153 · 2021:95 · 2022:41 · 2023:48 · 2024:57 · 2025:53
  bar('c-sugg',[{data:[172,263,218,153,95,41,48,57,53],backgroundColor:CLR9.map(c=>c+'bb'),borderColor:CLR9,borderWidth:1,borderRadius:2}],{lbl:LBL9});

  // 4 Nuevas suscripciones vs desuscripciones
  // Altas 2018: ~4468 (Δ 2966 + 458 desus + 1044 removidos) · 2019: ~5698 (Δ 4714 + 984 desus)
  // Altas 2022: ~443 · 2023: ~799 (calculadas: Δsuscriptores + bajas, sin limpiezas desde 2022)
  // Desuscripciones 2022: 788 · 2023: 835 · 2025: 1186
  bar('c-delta',[
    {label:'Nuevas suscripciones',data:[1992,4468,5698,10501,4870,443,799,1202,1039],backgroundColor:CLR9.map(c=>c+'99'),borderColor:CLR9,borderWidth:1,borderRadius:2},
    {label:'Desuscripciones',     data:[82,458,984,2236,1422,788,835,907,1199],    backgroundColor:'#D55E0044',borderColor:'#D55E00',borderWidth:1,borderRadius:2}
  ],{lbl:LBL9});

  // 5 Respuestas recibidas — totales por año
  // 2017:347 · 2018:732 · 2019:1254 · 2020:1363 · 2021:1618 · 2022:698 · 2023:407 · 2024:632 · 2025:613
  bar('c-replies',[{data:[347,732,1254,1363,1618,698,407,632,613],backgroundColor:CLR9.map(c=>c+'bb'),borderColor:CLR9,borderWidth:1,borderRadius:2}],{lbl:LBL9});

  // 6 Correos enviados — CFLC vs. Club (vip=Club, non_vip=CFLC)
  bar('c-sent',[
    {label:'CFLC', data:[36,42,47,40,34,18,15,21,33],backgroundColor:'#e8956d99',borderColor:'#e8956d',borderWidth:1,borderRadius:2},
    {label:'Club', data:[0, 0, 9,136,78,26,14,12,17],backgroundColor:'#4a8fd199',borderColor:'#4a8fd1',borderWidth:1,borderRadius:2}
  ],{lbl:LBL9});

  // 7 Horas de investigación y escritura — desde 2019
  // 2019:265 · 2020:223 · 2021:338 · 2022:166 · 2023:247 · 2024:303 · 2025:282
  {const l=['2019','2020','2021','2022','2023','2024','2025'],c=['#e8694a','#c44d89','#9a5fd1','#4a8fd1','#3fb8cc','#4abf8a','#f5c842'];
  bar('c-hours',[{data:[265,223,338,166,247,303,282],backgroundColor:c.map(x=>x+'bb'),borderColor:c,borderWidth:1,borderRadius:2}],{lbl:l});}

  // 8 Libros y artículos consultados — desde 2020
  // Libros: 2020:111 · 2021:125 · 2023:98 · 2024:134 · 2025:63 · Artículos: 2021:74 · 2023:70 · 2024:45 · 2025:29
  {const l=['2020','2021','2022','2023','2024','2025'],c=['#c44d89','#9a5fd1','#4a8fd1','#3fb8cc','#4abf8a','#f5c842'];
  bar('c-books',[
    {label:'Libros',   data:[111,125,null,98,134,63], backgroundColor:'#4a8fd199',borderColor:'#4a8fd1',borderWidth:1,borderRadius:2},
    {label:'Artículos',data:[null,74, null,70,45, 29], backgroundColor:'#4abf8a99',borderColor:'#4abf8a',borderWidth:1,borderRadius:2}
  ],{lbl:l});}

  // 9 Costos operativos (USD) — line chart con eje acumulado a la derecha
  // 2017: $108.12 · 2018: $491.57 · 2019: $993.97 · 2020: $1400.09 · 2021: $2054.17 · 2022: $2491.91 · 2023: $3780.61 · 2024: $2108.97 · 2025: $1960.88
  // Acumulado: 108.12 · 599.69 · 1593.66 · 2993.75 · 5047.92 · 7539.83 · 11320.44 · 13429.41 · 15390.29
  const invLBL  = ['2017','2018','2019','2020','2021','2022','2023','2024','2025'];
  const invData = [108.12,491.57,993.97,1400.09,2054.17,2491.91,3780.61,2108.97,1960.88];
  const invCum  = [108.12,599.69,1593.66,2993.75,5047.92,7539.83,11320.44,13429.41,15390.29];
  const invCtx  = document.getElementById('c-inv').getContext('2d');
  const gInv    = invCtx.createLinearGradient(0,0,0,200); gInv.addColorStop(0,'#e8956d44'); gInv.addColorStop(1,'#e8956d00');
  const gInvCum = invCtx.createLinearGradient(0,0,0,200); gInvCum.addColorStop(0,'#4abf8a22'); gInvCum.addColorStop(1,'#4abf8a00');
  CI['c-inv'] = new Chart(invCtx, {
    type:'line',
    data:{ labels:invLBL, datasets:[
      {
        label:'USD por año', data:invData, yAxisID:'y',
        borderColor:'#e8956d', backgroundColor:gInv, fill:true,
        pointBackgroundColor:'#e8956d', pointBorderColor:getBG(), pointBorderWidth:2,
        pointRadius:5, pointHoverRadius:7, tension:0.35
      },
      {
        label:'Acumulado', data:invCum, yAxisID:'y2',
        borderColor:'#4abf8a', backgroundColor:gInvCum, fill:true,
        borderDash:[4,3],
        pointBackgroundColor:'#4abf8a', pointBorderColor:getBG(), pointBorderWidth:2,
        pointRadius:4, pointHoverRadius:6, tension:0.35
      }
    ]},
    options:{
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label:c=>' USD '+c.parsed.y.toLocaleString('es',{minimumFractionDigits:2}) }}
      },
      scales:{
        y:{  grid:{color:'#1a1815'}, ticks:{color:'#e8956d99', callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v} },
        y2:{ position:'right', grid:{display:false}, ticks:{color:'#4abf8a99', callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v} },
        x:{  grid:{display:false} }
      }
    }
  });

  // 10 Máximo de días sin enviar
  // 2017:20 · 2018:21 · 2019:35 · 2020:28 · 2021:56 · 2022:84 · 2023:83 · 2024:49 · 2025:21
  bar('c-gaps',[{data:[20,21,35,28,56,84,83,49,21],backgroundColor:CLR9.map(c=>c+'bb'),borderColor:CLR9,borderWidth:1,borderRadius:2}],{lbl:LBL9});

  // 11 Respuestas promedio por correo — calculado: respuestas totales / correos enviados
  // 2017:9.6 · 2018:17.4 · 2019:22.4 · 2020:7.7 · 2021:14.4 · 2022:15.9 · 2023:14.0 · 2024:19.2 · 2025:12.3
  bar('c-avgrep',[{data:[9.6,17.4,22.4,7.7,14.4,15.9,14.0,19.2,12.3],backgroundColor:CLR9.map(c=>c+'bb'),borderColor:CLR9,borderWidth:1,borderRadius:2}],{lbl:LBL9});

  // 12 Horas respondiendo correos
  // 2022: 62 · 2023: 48 · 2025: 46
  // c-rephrs desde 2020
  {const l=['2020','2021','2022','2023','2024','2025'],c=['#c44d89','#9a5fd1','#4a8fd1','#3fb8cc','#4abf8a','#f5c842'];
  bar('c-rephrs',[{data:[35.97,58.28,62,48,72.42,46],backgroundColor:c.map(x=>x+'bb'),borderColor:c,borderWidth:1,borderRadius:2}],{lbl:l});}

  // 13 Correos pendientes de responder
  // 2023: 636 · 2025: 667 · 2022: ~525 (interpolación entre 414 y 636)
  // c-pending desde 2020
  {const l=['2020','2021','2022','2023','2024','2025'],c=['#c44d89','#9a5fd1','#4a8fd1','#3fb8cc','#4abf8a','#f5c842'];
  bar('c-pending',[{data:[356,414,525,636,640,667],backgroundColor:c.map(x=>x+'bb'),borderColor:c,borderWidth:1,borderRadius:2}],{lbl:l});}

  // 14 Mensajes de recomendación acumulados — desde 2020
  {const l=['2020','2021','2022','2023','2024','2025'],c=['#c44d89','#9a5fd1','#4a8fd1','#3fb8cc','#4abf8a','#f5c842'];
  bar('c-testim',[{data:[341,449,498,528,574,609],backgroundColor:c.map(x=>x+'bb'),borderColor:c,borderWidth:1,borderRadius:2}],{lbl:l});}

  // 15b Videollamadas con personas del Club
  // 2022: 65hs/52p · 2023: 102hs/55p · 2024: 87hs/56p · 2025: 43hs/32p
  const callsLBL  = ['2022','2023','2024','2025'];
  const callsCLRS = ['#4a8fd1','#3fb8cc','#4abf8a','#9a5fd1'];
  CI['c-calls'] = new Chart(document.getElementById('c-calls').getContext('2d'), {
    type:'bar',
    data:{ labels:callsLBL, datasets:[
      {label:'Horas',      data:[65,102,87,43], backgroundColor:callsCLRS.map(c=>c+'bb'), borderColor:callsCLRS, borderWidth:1, borderRadius:2, yAxisID:'y'},
      {label:'Personas',   data:[52,55,56,32],  backgroundColor:callsCLRS.map(c=>c+'44'), borderColor:callsCLRS, borderWidth:1, borderRadius:2, type:'line',
       pointBackgroundColor:callsCLRS, pointBorderColor:getBG(), pointBorderWidth:2, pointRadius:5, tension:0.35, yAxisID:'y2'}
    ]},
    options:{
      plugins:{ legend:{display:true, labels:{color:'#5a5040',boxWidth:10,padding:10}},
        tooltip:{callbacks:{label:c=>c.datasetIndex===0?' '+c.parsed.y+' hs':' '+c.parsed.y+' personas'}} },
      scales:{
        y:{  grid:{color:'#1a1815'}, ticks:{callback:v=>v+' hs'} },
        y2:{ position:'right', grid:{drawOnChartArea:false}, ticks:{color:'#5a504099', callback:v=>v+' p'} },
        x:{  grid:{display:false} }
      }
    }
  });

  // 15c Encuentros de lectura — apilado: encuentros + preparación
  // Encuentros totales: 2023:187 · 2024:215 · 2025:66
  // Preparación:        2023:101 · 2024:62  · 2025:22
  // En encuentros:      2023:86  · 2024:153 · 2025:44
  const readLBL  = ['2023','2024','2025'];
  const readCLRS = ['#3fb8cc','#4abf8a','#9a5fd1'];
  CI['c-reading'] = new Chart(document.getElementById('c-reading').getContext('2d'), {
    type:'bar',
    data:{ labels:readLBL, datasets:[
      {label:'En encuentros', data:[86,153,44],  backgroundColor:readCLRS.map(c=>c+'bb'), borderColor:readCLRS, borderWidth:1, borderRadius:[2,2,0,0]},
      {label:'Preparación',   data:[101,62,22],  backgroundColor:readCLRS.map(c=>c+'44'), borderColor:readCLRS, borderWidth:1, borderRadius:[0,0,0,0]}
    ]},
    options:{
      plugins:{ legend:{display:true, labels:{color:'#5a5040',boxWidth:10,padding:10}},
        tooltip:{ mode:'index', callbacks:{
          afterBody: items => [' Total: '+(items.reduce((s,i)=>s+i.parsed.y,0))+' hs']
        }}
      },
      scales:{
        y:{ stacked:true, grid:{color:'#1a1815'}, ticks:{callback:v=>v+' hs'} },
        x:{ stacked:true, grid:{display:false} }
      }
    }
  });

  // 15d Horas — proyectos del Club de la curiosidad
  // 2019:35 · 2020:355 · 2021:230 · 2022:82 · 2023:62 · 2024:97 · 2025:185
  const clubhrsLBL  = ['2019','2020','2021','2022','2023','2024','2025'];
  const clubhrsCLRS = ['#e8694a','#c44d89','#9a5fd1','#4a8fd1','#3fb8cc','#4abf8a','#f5c842'];
  CI['c-clubhrs'] = new Chart(document.getElementById('c-clubhrs').getContext('2d'), {
    type:'bar',
    data:{ labels:clubhrsLBL, datasets:[{
      data:[35,355,230,82,62,97,185],
      backgroundColor:clubhrsCLRS.map(c=>c+'bb'), borderColor:clubhrsCLRS, borderWidth:1, borderRadius:2
    }]},
    options:{
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>' '+c.parsed.y+' hs'}} },
      scales:{
        y:{ grid:{color:'#1a1815'}, ticks:{callback:v=>v+' hs'} },
        x:{ grid:{display:false} }
      }
    }
  });

  // 16 Conversaciones por año (abr–mar) — Threads y Messages, total vs Club
  const convLBL = ['2017','2018','2019','2020','2021','2022','2023','2024','2025'];
  // Totales precalculados (abr Y – mar Y+1; 2026* = ene–mar 2026)
  const thrData = [
    {t:299,  c:0  }, // 2017
    {t:736,  c:38 }, // 2018
    {t:894,  c:102}, // 2019
    {t:1183, c:384}, // 2020
    {t:1330, c:915}, // 2021
    {t:536,  c:332}, // 2022
    {t:277,  c:206}, // 2023
    {t:532,  c:382}, // 2024
    {t:545,  c:389}, // 2025
  ];
  const msgData = [
    {t:446,  c:0   }, // 2017
    {t:1046, c:85  }, // 2018
    {t:1186, c:209 }, // 2019
    {t:1529, c:567 }, // 2020
    {t:1720, c:1204}, // 2021
    {t:778,  c:482 }, // 2022
    {t:421,  c:321 }, // 2023
    {t:733,  c:530 }, // 2024
    {t:816,  c:583 }, // 2025
  ];
  const convColors = [...CLRS, '#3fb8cc', '#aad4f5'];

  function buildConvChart(mode) {
    const src = mode==='threads' ? thrData : msgData;
    const labelTotal = mode==='threads' ? 'Conversaciones totales' : 'Mensajes totales';
    const labelClub  = mode==='threads' ? 'Conversaciones — Club' : 'Mensajes — Club';
    const totalVals = src.map(d=>d.t);
    const clubVals  = src.map(d=>d.c);
    if (CI['c-conv']) { CI['c-conv'].destroy(); delete CI['c-conv']; }
    const convCtx = document.getElementById('c-conv').getContext('2d');
    CI['c-conv'] = new Chart(convCtx, {
      type:'bar',
      data:{ labels:convLBL, datasets:[
        { label:labelTotal, data:totalVals,
          backgroundColor:convColors.map(c=>c+'99'), borderColor:convColors, borderWidth:1, borderRadius:2 },
        { label:labelClub,  data:clubVals,
          backgroundColor:'#4a8fd166', borderColor:'#4a8fd1', borderWidth:1, borderRadius:2 }
      ]},
      options:{
        plugins:{
          legend:{ display:true, labels:{ color:'#a09080', boxWidth:10, padding:12 } },
          tooltip:{ callbacks:{ label:c=>' '+c.parsed.y+' '+c.dataset.label.toLowerCase() }}
        },
        scales:{
          y:{ grid:{color:'#1a1815'}, ticks:{callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v} },
          x:{ grid:{display:false} },
        }
      }
    });
  }

  window.convToggle = function(mode) {
    buildConvChart(mode);
    document.getElementById('conv-toggle-threads').style.background = mode==='threads' ? 'var(--bg-card2)' : 'var(--bg)';
    document.getElementById('conv-toggle-threads').style.color      = mode==='threads' ? 'var(--text)' : 'var(--muted)';
    document.getElementById('conv-toggle-messages').style.background= mode==='messages'? 'var(--bg-card2)' : 'var(--bg)';
    document.getElementById('conv-toggle-messages').style.color     = mode==='messages'? 'var(--text)' : 'var(--muted)';
  };
  buildConvChart('threads');

  // 15 Donaciones — por año y acumulado (USD, años calendario 2019–2025)
  // Por año: 387.56 · 971.26 · 636.37 · 643.40 · 387.27 · 410.68 · 1051.76
  // Acumulado hasta 2025: 4488.30 · Total incl. 2026 parcial: 4709.05
  const donCtx = document.getElementById('c-donations').getContext('2d');
  const donLBL    = ['2019','2020','2021','2022','2023','2024','2025'];
  const donByYear = [387.56,971.26,636.37,643.40,387.27,410.68,1051.76];
  const donCum    = [387.56,1358.82,1995.19,2638.59,3025.86,3436.54,4488.30];
  const gDon  = donCtx.createLinearGradient(0,0,0,200); gDon.addColorStop(0,'#e8956d44');  gDon.addColorStop(1,'#e8956d00');
  const gDonC = donCtx.createLinearGradient(0,0,0,200); gDonC.addColorStop(0,'#4abf8a22'); gDonC.addColorStop(1,'#4abf8a00');
  CI['c-donations'] = new Chart(donCtx, {
    type:'line',
    data:{ labels:donLBL, datasets:[
      { label:'USD por año', data:donByYear, yAxisID:'y',
        borderColor:'#e8956d', backgroundColor:gDon, fill:true,
        pointBackgroundColor:'#e8956d', pointBorderColor:getBG(), pointBorderWidth:2,
        pointRadius:5, pointHoverRadius:7, tension:0.35 },
      { label:'Acumulado', data:donCum, yAxisID:'y2',
        borderColor:'#4abf8a', backgroundColor:gDonC, fill:true,
        borderDash:[4,3],
        pointBackgroundColor:'#4abf8a', pointBorderColor:getBG(), pointBorderWidth:2,
        pointRadius:4, pointHoverRadius:6, tension:0.35 }
    ]},
    options:{
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label:c=>' USD '+c.parsed.y.toLocaleString('es',{minimumFractionDigits:2}) }}
      },
      scales:{
        y:{  position:'left',  grid:{color:'#1a1815'}, ticks:{color:'#e8956d99', callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v} },
        y2:{ position:'right', grid:{display:false},   ticks:{color:'#4abf8a99', callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v} },
        x:{  grid:{display:false} }
      }
    }
  });
}

function highlightYear(id) {
  // Mapeo de tab → índices en los gráficos (8 puntos: 2017-2024, con 2022 y 2023 separados)
  const tabIdx = YEARS.findIndex(y => y.id === id);
  const indices = tabIdx === 5 ? [5, 6]                    // 'Años 6 y 7' resalta ambos
                : tabIdx < 5   ? [tabIdx]                  // 2017–2021: mapeo directo
                :                [tabIdx + 1];             // 2024 (tabIdx 6) → chart idx 7
  const n = CLRS.length; // 8
  Object.entries(CI).forEach(([key, chart]) => {
    if (key === 'c-donations') return; // eje calendario independiente, no aplica
    chart.data.datasets.forEach(ds => {
      if (ds.pointBackgroundColor) {
        ds.pointRadius      = Array.from({length:n}, (_,i) => indices.includes(i) ? 9 : 5);
        ds.pointBorderWidth = Array.from({length:n}, (_,i) => indices.includes(i) ? 3 : 2);
      }
    });
    chart.update('none');
  });
}

// ── THEME TOGGLE ─────────────────────────────
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  document.getElementById('theme-icon').textContent  = isLight ? '🌙' : '☀️';
  document.getElementById('theme-label').textContent = isLight ? 'Modo oscuro' : 'Modo claro';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  applyChartTheme();
}

function toggleMobileMenu() {
  const links = document.getElementById('top-bar-links');
  const btn   = document.querySelector('.top-bar-hamburger');
  const open  = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const preferLight = saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches);
  if (preferLight) {
    document.documentElement.classList.add('light');
    document.getElementById('theme-icon').textContent  = '🌙';
    document.getElementById('theme-label').textContent = 'Modo oscuro';
  }
})();

// ── INIT ─────────────────────────────────────
buildTabs();
initCharts();
applyChartTheme();
switchTab('2025');
