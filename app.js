const API="https://api.worldbank.org/v2/country/";
const INDICATORS={
  gdp:{id:"NY.GDP.MKTP.KD.ZG",label:"Crescimento do PIB",color:"#83ad4b"},
  inflation:{id:"FP.CPI.TOTL.ZG",label:"Inflação",color:"#7198ef"},
  unemployment:{id:"SL.UEM.TOTL.ZS",label:"Desemprego",color:"#ad8be8"},
  population:{id:"SP.POP.TOTL",label:"População",color:"#e7a06c"}
};
const COUNTRIES=[{id:"BRA",name:"Brasil"},{id:"ARG",name:"Argentina"},{id:"CHL",name:"Chile"},{id:"COL",name:"Colômbia"},{id:"MEX",name:"México"}];
const state={series:{},comparison:{},charts:{},start:2000,end:2024};
const fmt=(v,d=1)=>v==null||!Number.isFinite(v)?"—":new Intl.NumberFormat("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
const compact=v=>v==null||!Number.isFinite(v)?"—":new Intl.NumberFormat("pt-BR",{notation:"compact",maximumFractionDigits:2}).format(v);
const text=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
async function fetchIndicator(country,indicator,start=1990,end=2025){
 const url=`${API}${country}/indicator/${indicator}?format=json&per_page=100&date=${start}:${end}`;
 const response=await fetch(url);if(!response.ok)throw new Error("API indisponível");
 const json=await response.json();if(!Array.isArray(json)||!Array.isArray(json[1]))throw new Error("Formato inesperado da API");
 return json[1].filter(d=>d&&d.date&&d.value!==null).map(d=>({year:Number(d.date),value:Number(d.value)})).sort((a,b)=>a.year-b.year);
}
function inRange(rows){return(rows||[]).filter(d=>d.year>=state.start&&d.year<=state.end);}
function latest(rows){const r=inRange(rows);return r.length?r[r.length-1]:null;}
function baseOptions(){
 return{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:"#171b2a",padding:11,callbacks:{label:c=>` ${fmt(c.parsed.y,1)}${c.dataset.unit||""}`}}},scales:{x:{grid:{display:false},ticks:{color:"#9298a6",maxTicksLimit:9},border:{display:false}},y:{grid:{color:"#f0f1f4"},ticks:{color:"#9298a6",maxTicksLimit:5},border:{display:false}}}};
}
function lineChart(id,rows,color,population=false){
 if(state.charts[id])state.charts[id].destroy();
 const opts=baseOptions();if(population)opts.scales.y.ticks.callback=v=>fmt(v,0);
 state.charts[id]=new Chart(document.getElementById(id),{type:"line",data:{labels:rows.map(d=>d.year),datasets:[{data:rows.map(d=>population?d.value/1e6:d.value),unit:population?" mi":"%",borderColor:color,backgroundColor:color+"19",borderWidth:2.5,pointRadius:rows.length>22?0:2.5,pointHoverRadius:5,fill:true,tension:.28,spanGaps:false}]},options:opts});
}
function barChart(year){
 const labels=[],values=[];
 for(const c of COUNTRIES){const p=(state.comparison[c.id]||[]).find(d=>d.year===year);if(p){labels.push(c.name);values.push(p.value);}}
 if(state.charts.countryChart)state.charts.countryChart.destroy();
 const opts=baseOptions();opts.indexAxis="y";opts.scales.x.ticks.callback=v=>fmt(v,0)+"%";
 opts.plugins.tooltip.callbacks={label:c=>` ${fmt(c.parsed.x,2)}%`};
 state.charts.countryChart=new Chart(document.getElementById("countryChart"),{type:"bar",data:{labels,datasets:[{data:values,backgroundColor:labels.map(n=>n==="Brasil"?"#83ad4b":"#c8ced8"),borderRadius:5,borderSkipped:false,maxBarThickness:38}]},options:opts});
}
function setKpi(valueId,yearId,rows,population=false){const p=latest(rows);text(valueId,p?(population?compact(p.value):fmt(p.value,1)+"%"):"—");text(yearId,p?"Ano "+p.year:"Sem dado no período");}
function trend(rows,name,unit="%"){
 const r=inRange(rows);if(r.length<2)return"Não há observações suficientes no período selecionado.";
 const a=r[0],b=r[r.length-1],delta=b.value-a.value,verb=delta>0?"aumentou":delta<0?"diminuiu":"permaneceu estável";
 return `${name} ${verb} ${fmt(Math.abs(delta),1)} ${unit==="%"?"p.p.":"milhões"} entre ${a.year} e ${b.year}.`;
}
function updateInsights(){
 const g=inRange(state.series.gdp||[]),inf=inRange(state.series.inflation||[]),un=state.series.unemployment||[],pop=inRange(state.series.population||[]);
 if(g.length){const max=g.reduce((a,b)=>b.value>a.value?b:a),min=g.reduce((a,b)=>b.value<a.value?b:a);text("gdpInsight",`Maior taxa: ${fmt(max.value)}% (${max.year}). Menor: ${fmt(min.value)}% (${min.year}).`);}else text("gdpInsight","Sem observações neste período.");
 if(inf.length){const max=inf.reduce((a,b)=>b.value>a.value?b:a);text("inflationInsight",`Maior inflação observada: ${fmt(max.value)}% (${max.year}).`);}else text("inflationInsight","Sem observações neste período.");
 text("unemploymentInsight",trend(un,"A taxa de desemprego"));
 if(pop.length>1){const growth=(pop[pop.length-1].value/pop[0].value-1)*100;text("populationInsight",`Variação de ${fmt(growth)}% entre ${pop[0].year} e ${pop[pop.length-1].year}.`);}else text("populationInsight","Sem observações suficientes neste período.");
 if(g.length>1){const mean=g.reduce((s,d)=>s+d.value,0)/g.length;text("autoInsightGdp",`O crescimento médio anual do PIB foi de ${fmt(mean,2)}%. A média não revela, sozinha, a volatilidade entre anos.`);}else text("autoInsightGdp","Selecione pelo menos dois anos com dados.");
 if(inf.length>1){const a=inf[0],b=inf[inf.length-1];text("autoInsightInflation",`A taxa anual passou de ${fmt(a.value)}% em ${a.year} para ${fmt(b.value)}% em ${b.year}. Isso compara taxas, não o nível acumulado de preços.`);}else text("autoInsightInflation","Selecione pelo menos dois anos com dados.");
 text("autoInsightQuestion","Em quais anos o crescimento do PIB e a inflação se moveram na mesma direção? Investigue possíveis fatores sem presumir causalidade.");
}
function render(){
 for(const [key,meta] of Object.entries(INDICATORS))lineChart(key+"Chart",inRange(state.series[key]||[]),meta.color,key==="population");
 setKpi("gdpValue","gdpYear",state.series.gdp);setKpi("inflationValue","inflationYear",state.series.inflation);setKpi("unemploymentValue","unemploymentYear",state.series.unemployment);setKpi("populationValue","populationYear",state.series.population,true);
 const select=document.getElementById("compareYear"),years=(state.comparison.BRA||[]).map(d=>d.year).filter(y=>y>=state.start&&y<=state.end);
 select.innerHTML="";years.forEach(y=>{const o=document.createElement("option");o.value=String(y);o.textContent=String(y);select.appendChild(o);});
 if(years.length){select.value=String(years.includes(state.end)?state.end:years[years.length-1]);barChart(Number(select.value));}
 updateInsights();text("updatedAt","Dados consultados em "+new Date().toLocaleDateString("pt-BR"));
}
function populateYears(){
 const start=document.getElementById("startYear"),end=document.getElementById("endYear");
 for(let y=1990;y<=2025;y++){for(const sel of[start,end]){const o=document.createElement("option");o.value=String(y);o.textContent=String(y);sel.appendChild(o);}}
 start.value="2000";end.value="2024";
}
async function loadData(){
 document.getElementById("loading").hidden=false;document.getElementById("error").hidden=true;document.getElementById("dashboard").hidden=true;text("connectionLabel","Conectando à fonte");
 try{
  const jobs=[];for(const[key,meta]of Object.entries(INDICATORS))jobs.push(fetchIndicator("BRA",meta.id).then(rows=>({type:"series",key,rows})));
  for(const c of COUNTRIES)jobs.push(fetchIndicator(c.id,INDICATORS.gdp.id).then(rows=>({type:"comparison",key:c.id,rows})));
  for(const result of await Promise.all(jobs)){if(result.type==="series")state.series[result.key]=result.rows;else state.comparison[result.key]=result.rows;}
  document.getElementById("loading").hidden=true;document.getElementById("dashboard").hidden=false;text("connectionLabel","Fonte conectada");render();
 }catch(err){console.error(err);document.getElementById("loading").hidden=true;document.getElementById("error").hidden=false;text("connectionLabel","Fonte indisponível");}
}
function applyFilters(){
 const a=Number(document.getElementById("startYear").value),b=Number(document.getElementById("endYear").value);
 if(a>b){document.getElementById("startYear").value=String(b);state.start=b;state.end=b;}else{state.start=a;state.end=b;}
 if(Object.keys(state.series).length)render();
}
document.addEventListener("DOMContentLoaded",()=>{
 populateYears();document.getElementById("startYear").addEventListener("change",applyFilters);document.getElementById("endYear").addEventListener("change",applyFilters);
 document.getElementById("compareYear").addEventListener("change",e=>barChart(Number(e.target.value)));
 document.getElementById("resetFilters").addEventListener("click",()=>{document.getElementById("startYear").value="2000";document.getElementById("endYear").value="2024";state.start=2000;state.end=2024;if(Object.keys(state.series).length)render();});
 document.getElementById("retryButton").addEventListener("click",loadData);loadData();
});