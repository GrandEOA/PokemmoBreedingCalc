const STATS = ["HP","ATK","DEF","SPA","SPD","SPE"];
const NATURES = ["Hardy","Lonely","Brave","Adamant","Naughty","Bold","Docile","Relaxed","Impish","Lax","Timid","Hasty","Serious","Jolly","Naive","Modest","Mild","Quiet","Bashful","Rash","Calm","Gentle","Sassy","Careful","Quirky"];
const SPECIES = [
  ["Bulbasaur","Grass,Poison"],["Ivysaur","Grass,Poison"],["Venusaur","Grass,Poison"],["Charmander","Dragon,Monster"],["Charmeleon","Dragon,Monster"],["Charizard","Dragon,Monster"],
  ["Squirtle","Monster,Water 1"],["Wartortle","Monster,Water 1"],["Blastoise","Monster,Water 1"],["Pikachu","Field,Fairy"],["Raichu","Field,Fairy"],
  ["Geodude","Mineral"],["Graveler","Mineral"],["Golem","Mineral"],["Eevee","Field"],["Vaporeon","Field,Water 1"],["Jolteon","Field"],["Flareon","Field"],["Espeon","Field"],["Umbreon","Field"],["Leafeon","Field"],["Glaceon","Field"],
  ["Dratini","Water 1,Dragon"],["Dragonair","Water 1,Dragon"],["Dragonite","Water 1,Dragon"],["Ditto","Ditto"],
  ["Chikorita","Monster,Grass"],["Cyndaquil","Field"],["Totodile","Monster,Water 1"],["Togepi","Undiscovered"],["Togetic","Flying,Fairy"],["Mareep","Field,Monster"],["Marill","Water 1,Fairy"],["Azurill","Undiscovered,Fairy"],["Espeon","Field"],["Umbreon","Field"],["Larvitar","Monster"],["Pupitar","Monster"],["Tyranitar","Monster"],
  ["Treecko","Dragon,Monster"],["Torchic","Field"],["Mudkip","Monster,Water 1"],["Ralts","Amorphous"],["Kirlia","Amorphous"],["Gardevoir","Amorphous"],["Sableye","Human-Like"],["Aron","Monster"],["Lairon","Monster"],["Aggron","Monster"],["Feebas","Water 1,Dragon"],["Milotic","Water 1,Dragon"],["Bagon","Dragon"],["Shelgon","Dragon"],["Salamence","Dragon"],
  ["Turtwig","Monster,Grass"],["Chimchar","Field,Human-Like"],["Piplup","Water 1,Field"],["Shinx","Field"],["Luxio","Field"],["Luxray","Field"],["Riolu","Undiscovered"],["Lucario","Field,Human-Like"],["Gible","Monster,Dragon"],["Gabite","Monster,Dragon"],["Garchomp","Monster,Dragon"],
  ["Snivy","Field,Grass"],["Tepig","Field"],["Oshawott","Field"],["Sandile","Field"],["Krokorok","Field"],["Krookodile","Field"],["Darumaka","Field"],["Darmanitan","Field"],["Zorua","Field"],["Zoroark","Field"],["Litwick","Amorphous"],["Lampent","Amorphous"],["Chandelure","Amorphous"],["Axew","Monster,Dragon"],["Fraxure","Monster,Dragon"],["Haxorus","Monster,Dragon"],["Deino","Dragon"],["Zweilous","Dragon"],["Hydreigon","Dragon"]
];
const KEY="pokemmo-breeding-planner-v1";
let state = loadState();
let plan = [];

function defaults(){return {target:{species:"",nature:"Jolly",ivs:[31,31,31,0,31,31],notes:""},inventory:[],checks:[],notes:"",prices:{brace:10000,stone:0,gender:5000}}}
function loadState(){try{return {...defaults(),...JSON.parse(localStorage.getItem(KEY))}}catch{return defaults()}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function money(n){return "$"+Number(n||0).toLocaleString()}
function el(id){return document.getElementById(id)}
function options(arr, selected){return arr.map(x=>`<option ${x===selected?"selected":""}>${x}</option>`).join("")}
function ivInputs(values, cls=""){return STATS.map((s,i)=>`<label class="iv-box"><span>${s}</span><input class="${cls}" data-stat="${i}" type="number" min="0" max="31" value="${values?.[i]??0}"></label>`).join("")}

function init(){
  el("targetNature").innerHTML=options(NATURES,state.target.nature);
  el("speciesList").innerHTML=SPECIES.map(x=>`<option value="${x[0]}"></option>`).join("");
  el("targetIVs").innerHTML=ivInputs(state.target.ivs);
  bind();
  renderAll();
}
function bind(){
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
  el("targetSpecies").oninput=e=>{state.target.species=e.target.value;save()};
  el("targetNature").onchange=e=>{state.target.nature=e.target.value;save()};
  el("targetNotes").oninput=e=>{state.target.notes=e.target.value;save()};
  document.querySelectorAll("#targetIVs input").forEach(i=>i.onchange=()=>{state.target.ivs=[...document.querySelectorAll("#targetIVs input")].map(x=>clamp(+x.value));save()});
  el("six31Btn").onclick=()=>setTarget([31,31,31,31,31,31]);
  el("five31Btn").onclick=()=>setTarget([31,31,31,0,31,31]);
  el("clearIVBtn").onclick=()=>setTarget([0,0,0,0,0,0]);
  el("addPokemonBtn").onclick=()=>{state.inventory.push({name:"",gender:"F",nature:"Jolly",ivs:[0,0,0,0,0,0],price:0,notes:""});save();switchTab("inventory")};
  el("generateBtn").onclick=generatePlan;
  el("projectNotes").oninput=e=>state.notes=e.target.value;
  el("saveNotesBtn").onclick=()=>{state.notes=el("projectNotes").value;save()};
  el("bracePrice").onchange=e=>{state.prices.brace=+e.target.value;save()};
  el("stonePrice").onchange=e=>{state.prices.stone=+e.target.value;save()};
  el("genderPrice").onchange=e=>{state.prices.gender=+e.target.value;save()};
  el("exportBtn").onclick=exportData;
  el("importInput").onchange=importData;
  el("resetBtn").onclick=()=>{if(confirm("Delete this project and all saved breeders?")){state=defaults();plan=[];save()}};
}
function setTarget(v){state.target.ivs=v;save()}
function clamp(v){return Math.max(0,Math.min(31,Number.isFinite(v)?v:0))}
function switchTab(name){
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));
  document.querySelectorAll(".tab-panel").forEach(x=>x.classList.toggle("active",x.id==="tab-"+name));
}
function renderAll(){
  el("targetSpecies").value=state.target.species;el("targetNature").value=state.target.nature;el("targetNotes").value=state.target.notes;
  el("targetIVs").innerHTML=ivInputs(state.target.ivs);
  document.querySelectorAll("#targetIVs input").forEach(i=>i.onchange=()=>{state.target.ivs=[...document.querySelectorAll("#targetIVs input")].map(x=>clamp(+x.value));save()});
  el("projectTitle").textContent=state.target.species?`${state.target.species} Breeding Project`:"Untitled Breeding Project";
  el("projectSummary").textContent=state.target.species?`${state.target.nature} • ${state.target.ivs.filter(x=>x===31).length}×31 target`:"Set a target below, then add the breeders you already own.";
  el("projectNotes").value=state.notes;
  el("bracePrice").value=state.prices.brace;el("stonePrice").value=state.prices.stone;el("genderPrice").value=state.prices.gender;
  renderInventory();renderChecklist();updateProgress();
}
function renderInventory(){
  const list=el("inventoryList");list.innerHTML="";
  el("emptyInventory").style.display=state.inventory.length?"none":"block";
  state.inventory.forEach((p,idx)=>{
    const node=document.createElement("div");node.className="pokemon-row";
    node.innerHTML=`<div class="pokemon-main"><input class="p-name" value="${esc(p.name)}" placeholder="Species"><select class="p-gender">${options(["F","M","N"],p.gender).replaceAll(">F<",">♀ Female<").replaceAll(">M<",">♂ Male<").replaceAll(">N<",">Genderless<")}</select><select class="p-nature">${options(NATURES,p.nature)}</select></div><div class="iv-row">${ivInputs(p.ivs,"p-iv")}</div><div class="pokemon-meta"><label>Price <input class="p-price" type="number" value="${p.price||0}" min="0" step="1000"></label><label>Notes <input class="p-notes" value="${esc(p.notes||"")}" placeholder="e.g. HA, alpha"></label></div><button class="icon-btn remove-pokemon">×</button>`;
    node.querySelector(".p-name").onchange=e=>{p.name=e.target.value;save()};
    node.querySelector(".p-gender").onchange=e=>{p.gender=e.target.value;save()};
    node.querySelector(".p-nature").onchange=e=>{p.nature=e.target.value;save()};
    node.querySelector(".p-price").onchange=e=>{p.price=+e.target.value;save()};
    node.querySelector(".p-notes").onchange=e=>{p.notes=e.target.value;save()};
    node.querySelectorAll(".p-iv").forEach((i,si)=>i.onchange=e=>{p.ivs[si]=clamp(+e.target.value);save()});
    node.querySelector(".remove-pokemon").onclick=()=>{state.inventory.splice(idx,1);save()};
    list.appendChild(node);
  });
}
function generatePlan(){
  if(!state.target.species){alert("Set a target species first.");switchTab("target");return}
  const t=state.target.ivs;
  const required=t.map((v,i)=>v===31?i:null).filter(x=>x!==null);
  plan=[];
  // A practical editable template: add one required 31 at a time.
  // Inventory breeders are matched to the target species where possible.
  let current=[];
  required.forEach((stat,idx)=>{
    const prev=current.slice();
    current.push(stat);
    const parentA = idx===0 ? bestInventoryFor(t, stat) : `Step ${idx} result`;
    const parentB = findFodder(stat, current, idx);
    plan.push({
      id:idx+1,stat,parents:[parentA,parentB],result:`${state.target.species} ${idx+1}×31`,
      items:["Brace: "+STATS[stat]],cost:state.prices.brace
    });
  });
  if(state.target.nature){
    plan.push({id:plan.length+1,stat:null,parents:[`Current ${Math.max(1,required.length)}×31`,`${state.target.nature} parent`],result:`${state.target.species} final ${state.target.nature}`,items:["Everstone"],cost:state.prices.stone});
  }
  // Convert generated plan into checklist entries while preserving completion.
  state.checks=plan.map((x,i)=>state.checks[i]||false);
  save(); renderPlan(); switchTab("planner");
}
function bestInventoryFor(target,stat){
  const matches=state.inventory.filter(p=>p.name.toLowerCase()===state.target.species.toLowerCase() && p.ivs[stat]===31);
  if(matches.length)return `Owned ${matches[0].name} (${STATS[stat]} 31)`;
  const any=state.inventory.find(p=>p.ivs[stat]===31);
  return any?`Owned ${any.name} (${STATS[stat]} 31)`:"Buy/catch breeder";
}
function findFodder(stat,current,idx){
  const other=state.inventory.find(p=>p.ivs[stat]===31 && p.ivs.filter(x=>x===31).length>=1);
  return other?`Owned ${other.name}`:"Buy/catch compatible breeder";
}
function renderPlan(){
  const tree=el("breedingTree");tree.innerHTML="";
  if(!plan.length){tree.innerHTML=`<div class="empty">No plan generated yet. Set your target and click <b>Generate Plan</b>.</div>`;updateCosts();return}
  plan.forEach((s,i)=>{
    const d=document.createElement("div");d.className="breed-step";
    d.innerHTML=`<div class="step-no">${s.id}</div><div class="step-parents"><div><b>${esc(s.parents[0])}</b> + <b>${esc(s.parents[1])}</b></div><div class="step-items">${esc(s.items.join(" • "))}</div></div><div class="step-result">${esc(s.result)}</div>`;
    tree.appendChild(d);
  });
  updateCosts();
}
function updateCosts(){
  const braces=plan.filter(x=>x.items.some(y=>y.startsWith("Brace"))).length;
  const stones=plan.filter(x=>x.items.includes("Everstone")).length;
  const genders=0;
  el("braceCost").textContent=money(braces*state.prices.brace);
  el("stoneCost").textContent=money(stones*state.prices.stone);
  el("genderCost").textContent=money(genders*state.prices.gender);
  el("totalCost").textContent=money(braces*state.prices.brace+stones*state.prices.stone+genders*state.prices.gender);
  el("planWarnings").innerHTML=`<div class="warning">This planner is a starting route, not an exhaustive optimizer. It does not yet prove egg-group compatibility or simulate every IV inheritance branch. Verify each pair in the PokeMMO breeding preview before confirming.</div>`;
}
function renderChecklist(){
  const c=el("checklist");c.innerHTML="";
  if(!plan.length){c.innerHTML=`<div class="empty">Generate a breeding plan first.</div>`;el("checkCount").textContent="0 / 0";return}
  plan.forEach((s,i)=>{
    const row=document.createElement("label");row.className="check-item"+(state.checks[i]?" done":"");
    row.innerHTML=`<input type="checkbox" ${state.checks[i]?"checked":""}><span>Step ${s.id}: ${esc(s.parents.join(" + "))} → ${esc(s.result)} <small class="muted">(${esc(s.items.join(", "))})</small></span>`;
    row.querySelector("input").onchange=e=>{state.checks[i]=e.target.checked;save()};
    c.appendChild(row);
  });
  const done=state.checks.filter(Boolean).length;el("checkCount").textContent=`${done} / ${plan.length}`;
}
function updateProgress(){
  const total=plan.length;const done=state.checks.filter(Boolean).length;const pct=total?Math.round(done/total*100):0;
  el("progressText").textContent=pct+"%";el("checkCount").textContent=`${done} / ${total}`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pokemmo-breeding-project.json";a.click();URL.revokeObjectURL(a.href);
}
function importData(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=()=>{try{state={...defaults(),...JSON.parse(r.result)};plan=[];save();alert("Project imported. Generate the plan again.")}catch{alert("Invalid project file.")}};r.readAsText(f);
}
init();
