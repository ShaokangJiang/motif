"use strict";

// Small, dependency-free SVG charts. All values are bundled locally so the
// charts also work when index.html is opened directly from disk.
(() => {
  const data = window.MOTIF_STUDY_DATA;
  if (!data) return;
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attributes = {}, text) => {
    const element = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const add = (parent, tag, attributes, text) => {
    const element = make(tag, attributes, text);
    parent.append(element);
    return element;
  };
  const number = value => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
  const unitFor = (series, value) => series.kind === "line" && value === 1 ? "pattern" : series.unit;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function createChart(id, title, height, description) {
    const root = document.getElementById(id);
    const canvas = document.createElement("div");
    canvas.className = "chart-canvas";
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "region");
    canvas.setAttribute("aria-label", `${title}. Scroll horizontally on narrow screens.`);
    const svg = make("svg", {viewBox: `0 0 640 ${height}`, "aria-label": title, "aria-describedby": `${id}-description`});
    add(svg, "desc", {id: `${id}-description`}, description);
    const plot = add(svg, "g", {});
    canvas.append(svg);
    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.setAttribute("role", "group");
    legend.setAttribute("aria-label", `${title}: visible series`);
    const tip = document.createElement("div");
    tip.className = "chart-tooltip";
    tip.id = `${id}-tooltip`;
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    root.append(canvas, legend, tip);
    let selected = null, cursor = null, leaving;
    const hide = () => {
      clearTimeout(leaving);
      tip.hidden = true;
      selected = null;
      plot.querySelectorAll(".is-selected").forEach(element => element.classList.remove("is-selected"));
    };
    root.addEventListener("keydown", event => { if (event.key === "Escape") hide(); });
    root.addEventListener("focusout", event => { if (!root.contains(event.relatedTarget)) hide(); });
    document.addEventListener("pointerdown", event => { if (!root.contains(event.target)) hide(); });
    // Float beside the cursor (or the focused item when using the keyboard): to its
    // right on the chart's left half and to its left on the right half, flipping if
    // that side would leave the viewport. Too narrow for either side: go below or above.
    function place() {
      const gap = 16, margin = 8;
      const anchor = cursor && cursor.target === selected
        ? {left: cursor.x, right: cursor.x, top: cursor.y, bottom: cursor.y}
        : selected.getBoundingClientRect();
      const chart = canvas.getBoundingClientRect(), bounds = root.getBoundingClientRect();
      const viewWidth = document.documentElement.clientWidth, viewHeight = window.innerHeight;
      const width = tip.offsetWidth, height = tip.offsetHeight;
      const right = anchor.right + gap, left = anchor.left - gap - width;
      const fitsRight = right + width <= viewWidth - margin, fitsLeft = left >= margin;
      const preferLeft = anchor.left + anchor.right > chart.left + chart.right;
      let x, y;
      if (fitsRight || fitsLeft) {
        x = (preferLeft ? fitsLeft : !fitsRight) ? left : right;
        y = (anchor.top + anchor.bottom - height) / 2;
      } else {
        x = (anchor.left + anchor.right - width) / 2;
        y = anchor.bottom + gap + height <= viewHeight - margin ? anchor.bottom + gap : anchor.top - gap - height;
      }
      x = Math.max(margin, Math.min(viewWidth - margin - width, x));
      y = Math.max(margin, Math.min(viewHeight - margin - height, y));
      tip.style.left = `${x - bounds.left}px`;
      tip.style.top = `${y - bounds.top}px`;
    }
    function show(target, content) {
      clearTimeout(leaving);
      tip.innerHTML = content;
      tip.hidden = false;
      plot.querySelectorAll(".is-selected").forEach(element => element.classList.remove("is-selected"));
      target.classList.add("is-selected");
      selected = target;
      place();
    }
    function interactive(target, label, content) {
      const follow = event => { cursor = {x: event.clientX, y: event.clientY, target}; };
      target.setAttribute("tabindex", "0");
      target.setAttribute("role", "button");
      target.setAttribute("aria-label", label);
      target.setAttribute("aria-describedby", tip.id);
      target.classList.add("chart-target");
      target.addEventListener("pointerenter", event => { follow(event); show(target, content()); });
      target.addEventListener("pointermove", event => { follow(event); if (selected === target) place(); });
      // Touch keeps the tooltip until the next tap; a mouse hides it on leaving,
      // after a short delay so crossing the gap between two items does not flicker.
      target.addEventListener("pointerleave", event => {
        if (event.pointerType === "touch") return;
        cursor = null;
        leaving = setTimeout(hide, 80);
      });
      target.addEventListener("focus", () => show(target, content()));
      target.addEventListener("click", () => show(target, content()));
      target.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault(); show(target, content());
        }
        const targets = [...plot.querySelectorAll(".chart-target")];
        const index = targets.indexOf(target);
        let next;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % targets.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + targets.length) % targets.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = targets.length - 1;
        if (next !== undefined) { event.preventDefault(); targets[next].focus(); }
      });
    }
    return {root, svg, plot, legend, hide, interactive};
  }

  function legendButton(chart, series, render) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", `Show ${series.label}`);
    const swatch = document.createElement("span");
    swatch.className = `legend-swatch ${series.kind === "line" ? "line-swatch" : ""}`;
    swatch.style.setProperty("--series-color", series.color);
    swatch.setAttribute("aria-hidden", "true");
    button.append(swatch, document.createTextNode(series.label));
    button.addEventListener("click", () => {
      series.visible = !series.visible;
      button.setAttribute("aria-pressed", String(series.visible));
      chart.hide(); render();
    });
    chart.legend.append(button);
  }

  const participantSeries = [
    {key:"motif", label:"Motif-identified", color:"#285c9e", kind:"line", unit:"patterns"},
    {key:"reflection", label:"Self-reflection", color:"#d5a400", kind:"line", unit:"patterns"},
    {key:"correct", label:"Correct", color:"#aebdd5", kind:"bar", unit:"of 5 reviewed"},
    {key:"useful", label:"Useful", color:"#c7e3da", kind:"bar", unit:"of 5 reviewed"},
    {key:"grounded", label:"Working (w/ behavior)", color:"#f6dfa0", kind:"bar", unit:"of 5 reviewed"},
    {key:"description", label:"Working (w/o behavior)", color:"#e4ad00", kind:"bar", unit:"of 5 reviewed"},
  ].map(series => ({...series, visible:true}));
  const participantChart = createChart("participant-chart", "Discovered patterns and reviewed outcomes", 326,
    "Eight participants. Lines use the left axis, 0 to 40 patterns; bars use the right axis, 0 to 5 reviewed programs. Focus a participant to inspect exact values. Use legend buttons to toggle series.");
  function renderParticipants() {
    const {plot} = participantChart;
    plot.replaceChildren();
    const left=48, right=584, top=36, bottom=280, width=right-left;
    const y = value => bottom - value / 40 * (bottom-top);
    const center = index => left + (index + .5) * width / 8;
    add(plot,"text",{x:left,y:16,class:"axis-title"},"Patterns found");
    add(plot,"text",{x:right,y:16,"text-anchor":"end",class:"axis-title"},"Reviewed (of 5)");
    for(let tick=0;tick<=5;tick++) {
      const position=y(tick*8);
      add(plot,"line",{x1:left,x2:right,y1:position,y2:position,class:"chart-grid"});
      add(plot,"text",{x:left-10,y:position+4,"text-anchor":"end",class:"axis-label"},tick*8);
      add(plot,"text",{x:right+10,y:position+4,class:"axis-label"},tick);
    }
    const bars=participantSeries.filter(series=>series.kind==="bar"&&series.visible);
    data.participants.labels.forEach((label,index)=>{
      const groupWidth=bars.length*10;
      bars.forEach((series,j)=>{
        const value=data.participants[series.key][index];
        const position=y(value*8);
        add(plot,"rect",{x:center(index)-groupWidth/2+j*10+1,y:position,width:9,height:bottom-position,fill:series.color,rx:1});
      });
      add(plot,"text",{x:center(index),y:bottom+23,"text-anchor":"middle",class:"axis-label participant-label"},label);
    });
    participantSeries.filter(series=>series.kind==="line"&&series.visible).forEach(series=>{
      const coordinates=data.participants[series.key].map((value,i)=>`${center(i)},${y(value)}`).join(" ");
      add(plot,"polyline",{points:coordinates,fill:"none",stroke:series.color,"stroke-width":2.6,"stroke-linejoin":"round"});
      data.participants[series.key].forEach((value,i)=>{
        add(plot,"circle",{cx:center(i),cy:y(value),r:4,fill:"var(--section-background, #fff)",stroke:series.color,"stroke-width":2.4});
      });
    });
    data.participants.labels.forEach((label,index)=>{
      const group=add(plot,"g",{});
      add(group,"rect",{x:center(index)-width/16+2,y:top-6,width:width/8-4,height:bottom-top+40,class:"chart-focus-band",rx:3});
      const values=()=>participantSeries.filter(series=>series.visible).map(series=>
        `<div class="tooltip-row"><span><i style="background:${series.color}"></i>${escape(series.label)}</span><b>${data.participants[series.key][index]} <small>${unitFor(series,data.participants[series.key][index])}</small></b></div>`).join("");
      const aria=participantSeries.filter(s=>s.visible).map(s=>`${s.label}: ${data.participants[s.key][index]} ${unitFor(s,data.participants[s.key][index])}`).join("; ");
      participantChart.interactive(group,`${label}. ${aria}`,()=>`<strong class="tooltip-title">Participant ${label}</strong>${values()||"No series selected."}`);
    });
  }
  participantSeries.forEach(series=>legendButton(participantChart,series,renderParticipants));
  renderParticipants();

  // Linear quantiles and 1.5-IQR whiskers match the paper's Seaborn box plots.
  // Outliers remain in the raw ratings but are not drawn, as in showfliers=False.
  function summarize(values) {
    const sorted=[...values].sort((a,b)=>a-b);
    const quantile=p=>{
      const index=(sorted.length-1)*p;
      const low=Math.floor(index), fraction=index-low;
      return sorted[low]+(sorted[Math.min(low+1,sorted.length-1)]-sorted[low])*fraction;
    };
    const q1=quantile(.25),median=quantile(.5),q3=quantile(.75),iqr=q3-q1;
    const inside=sorted.filter(value=>value>=q1-1.5*iqr&&value<=q3+1.5*iqr);
    return {q1,median,q3,low:inside[0],high:inside[inside.length-1],ratings:sorted};
  }
  const surveySeries=[
    {key:"vibe",label:"Vibe coding",color:"#219fc4",visible:true},
    {key:"motif",label:"Motif",color:"#d57c4f",visible:true},
  ];
  const experienceChart=createChart("experience-chart","Post-study survey",366,
    "Box plots for eight survey questions, scored 1 to 5. Each condition has eight ratings. Focus a box to inspect its median, quartiles, whiskers, and raw scores. Whiskers use 1.5 times the interquartile range; outliers are hidden, matching the paper.");
  const questionLines=[
    ["Easy to","use"],["Got wanted","program"],["Understand","code"],["Verify","correctness"],
    ["Fix","mistakes"],["Useful for daily","browsing"],["Would use","again"],["Enjoyed","using"],
  ];
  function renderExperience() {
    const {plot}=experienceChart;
    plot.replaceChildren();
    const left=38,right=620,top=32,bottom=280;
    const y=value=>bottom-(value-1)/4*(bottom-top);
    add(plot,"text",{x:left,y:14,class:"axis-title"},"Score (1–5, higher is better)");
    for(let tick=1;tick<=5;tick++) {
      add(plot,"line",{x1:left,x2:right,y1:y(tick),y2:y(tick),class:"chart-grid"});
      add(plot,"text",{x:left-12,y:y(tick)+4,"text-anchor":"end",class:"axis-label"},tick);
    }
    const active=surveySeries.filter(series=>series.visible);
    data.survey.forEach((question,index)=>{
      const center=left+(index+.5)*(right-left)/8;
      const label=add(plot,"text",{x:center,y:bottom+23,"text-anchor":"middle",class:"question-label"});
      questionLines[index].forEach((line,j)=>add(label,"tspan",{x:center,dy:j===0?0:14},line));
      active.forEach((series,j)=>{
        const stats=summarize(question[series.key]);
        const x=center+(j-(active.length-1)/2)*23;
        const group=add(plot,"g",{});
        add(group,"rect",{x:x-13,y:top-6,width:26,height:bottom-top+13,class:"chart-focus-band",rx:3});
        add(group,"line",{x1:x,x2:x,y1:y(stats.low),y2:y(stats.high),stroke:series.color,"stroke-width":1.7});
        [stats.low,stats.high].forEach(value=>add(group,"line",{x1:x-6,x2:x+6,y1:y(value),y2:y(value),stroke:series.color,"stroke-width":1.7}));
        add(group,"rect",{x:x-9,y:y(stats.q3),width:18,height:Math.max(1,y(stats.q1)-y(stats.q3)),fill:series.color,"fill-opacity":.7,stroke:series.color,"stroke-width":1.5});
        add(group,"line",{x1:x-9,x2:x+9,y1:y(stats.median),y2:y(stats.median),stroke:"#3f4650","stroke-width":2});
        const row=(label,value)=>`<div class="tooltip-row"><span>${label}</span><b>${value}</b></div>`;
        const content=()=>`<strong class="tooltip-title">${escape(question.label)} · ${series.label}</strong><p class="tooltip-question">${escape(question.question)}</p>`+
          row("Median",number(stats.median))+row("Middle 50%",`${number(stats.q1)}–${number(stats.q3)}`)+row("Whiskers",`${number(stats.low)}–${number(stats.high)}`)+
          `<p class="tooltip-ratings">8 ratings: ${stats.ratings.join(", ")}</p>`;
        experienceChart.interactive(group,`${question.label}, ${series.label}. Median ${number(stats.median)}; middle 50 percent ${number(stats.q1)} to ${number(stats.q3)}; whiskers ${number(stats.low)} to ${number(stats.high)}.`,content);
      });
    });
  }
  surveySeries.forEach(series=>legendButton(experienceChart,series,renderExperience));
  renderExperience();
})();
