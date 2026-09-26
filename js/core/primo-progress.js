import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://apkvvspubolyxlqtlkto.supabase.co";
const SUPABASE_KEY = "sb_publishable_0O4rNLfhuW18xYRZSPkLpw_xyXR9d3n";
const PRODUCT_KEY = "primo-volo";
const STORES = ["progress", "practice", "starting-checks", "journey"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const app = document.querySelector("#reportApp");
const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const TOPICS = Object.freeze({
  greetings:"Greetings & Introductions",hobbies:"Hobbies & Free Time",supplies:"School Supplies",food:"Food & Drinks",clothing:"Clothing",bodyParts:"Body Parts",home:"Home",places:"Places",prepositions:"Prepositions",family:"Family",colors:"Colors",adjectives:"Adjectives",feelings:"Feelings",numbers:"Numbers",animals:"Animals",routines:"Daily Routines",days:"Days of the Week",months:"Months",time:"Time",weather:"Weather",seasons:"Seasons",classroom:"Classroom Expressions"
});
const ACTIVITIES = Object.freeze({
  learn:"Impara · Learn",choose:"Scegli · Choose","match-word":"Abbina · Match","match-sound":"Ascolta · Listen",memory:"Memoria · Memory","words-in-action":"Parole in azione · Words in Action","conversation-choice":"Conversiamo: Scegli","conversation-write":"Conversiamo: Scrivi","conversation-practice":"Conversiamo · Conversation","introductions-practice":"Presentiamoci! · Introductions","assemble-sentences":"Assembla · Assemble",complete:"Completa · Complete",write:"Scrivi · Write",sentences:"Frasi · Sentences"
});

const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
const number = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
const topicLabel = key => TOPICS[key] || key || "Unknown topic";
const activityLabel = key => ACTIVITIES[key] || key || "Unknown activity";
const accuracy = (correct, attempts) => attempts ? Math.round(correct / attempts * 100) : null;
const formatDate = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(date);
};
const latestDate = values => values.map(value => new Date(value)).filter(value => !Number.isNaN(value.getTime())).sort((a,b)=>b-a)[0] || null;

function renderState(title, message, actions = "", detail = "") {
  app.innerHTML = `<section class="report-state"><p class="eyebrow">Primo Progress</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${detail ? `<p class="report-error-detail">${escapeHtml(detail)}</p>` : ""}${actions ? `<div class="report-state-actions">${actions}</div>` : ""}</section>`;
}

function activeEntitlement(row) {
  const now = Date.now();
  return row?.product_key === PRODUCT_KEY && row?.status === "active" &&
    (!row.starts_at || Date.parse(row.starts_at) <= now) &&
    (!row.expires_at || Date.parse(row.expires_at) > now);
}

async function authorizeEducator() {
  const { data, error } = await client.auth.getSession();
  const session = data?.session;
  if (error || !session?.user || session.user.is_anonymous === true) return null;
  const { data: entitlements, error: entitlementError } = await client.from("product_entitlements")
    .select("product_key,status,starts_at,expires_at")
    .eq("owner_user_id", session.user.id).eq("product_key", PRODUCT_KEY);
  if (entitlementError || !(entitlements || []).some(activeEntitlement)) return null;
  return session.user;
}

async function mappedProfiles(user, studentId = null) {
  let query = client.from("learner_profiles")
    .select("id,student_id,display_name,created_at,updated_at")
    .eq("owner_user_id", user.id).eq("product_key", PRODUCT_KEY)
    .not("student_id", "is", null).is("deleted_at", null);
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query.order("display_name");
  if (error) throw error;
  return data || [];
}

async function stateForProfile(profileId) {
  const { data, error } = await client.from("learning_state")
    .select("store_key,data,client_updated_at,updated_at")
    .eq("learner_profile_id", profileId).eq("product_key", PRODUCT_KEY).in("store_key", STORES);
  if (error) throw error;
  return Object.fromEntries((data || []).map(row => [row.store_key, row]));
}

function profilePicker(profiles) {
  if (!profiles.length) return renderState("No shared Primo students yet","A detailed report will be available after a shared student begins using Primo.",'<a class="button" href="index.html">Back to Primo</a>');
  app.innerHTML = `<section class="report-state"><p class="eyebrow">Primo Progress</p><h1>Choose a student</h1><p>Select an authorized shared student to view recorded Primo evidence.</p><div class="student-picker">${profiles.map(profile=>`<button type="button" data-student-id="${escapeHtml(profile.student_id)}">${escapeHtml(profile.display_name)}</button>`).join("")}</div></section>`;
  app.querySelectorAll("[data-student-id]").forEach(button => button.addEventListener("click",()=>{
    const url = new URL(location.href); url.searchParams.set("studentId",button.dataset.studentId); location.assign(url);
  }));
}

function progressModel(row) {
  const data = object(row?.data);
  const byActivity = object(data.byActivity);
  const memory = object(byActivity.memory);
  const attempts = Math.max(0,number(data.attempts)-number(memory.attempts));
  const correct = Math.max(0,number(data.correct)-number(memory.correct));
  const allSessions = array(data.sessions);
  const sessions = allSessions.filter(item => object(item).activity !== "memory");
  return {data,attempts,correct,byTopic:object(data.byTopic),byActivity,memory,allSessions,sessions};
}

function practiceModel(row) { return object(row?.data?.byTopic); }
function checksModel(row) { return object(row?.data?.byTopic); }

function recentForTopic(sessions, topic) {
  return latestDate(sessions.filter(item=>item.topic===topic).map(item=>item.date));
}

function overviewHtml(progress, practice, checks) {
  const topicKeys = new Set([...Object.keys(progress.byTopic),...Object.keys(practice),...progress.sessions.map(item=>item.topic).filter(Boolean)]);
  const activityKeys = Object.keys(progress.byActivity).filter(key=>key!=="memory"&&number(progress.byActivity[key]?.attempts)>0);
  const recent = latestDate(progress.sessions.map(item=>item.date));
  const completedChecks = Object.values(checks).filter(value=>object(value).latest).length;
  const acc = accuracy(progress.correct,progress.attempts);
  return `<section class="report-section"><div class="section-heading"><div><h2>Overview</h2><p>Accuracy reflects recorded scored responses and should be interpreted together with the amount and type of activity completed.</p></div></div><div class="overview-grid">
    ${metric(progress.attempts,"Scored responses")}${metric(progress.correct,"Correct")}${metric(acc===null?"—":`${acc}%`,"Accuracy")}${metric(topicKeys.size,"Topics with evidence")}${metric(activityKeys.length,"Scored activities")}${metric(recent?formatDate(recent):"—","Most recent scored activity")}${completedChecks?metric(completedChecks,"Starting Checks completed"):""}
  </div>${progress.attempts?"":'<p class="empty">No scored Primo activity yet.</p>'}</section>`;
}
const metric = (value,label)=>`<div class="metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;

function topicsHtml(progress, practice, checks) {
  const keys = [...new Set([...Object.keys(progress.byTopic),...Object.keys(practice),...Object.keys(checks),...progress.sessions.map(item=>item.topic).filter(Boolean)])].sort((a,b)=>topicLabel(a).localeCompare(topicLabel(b)));
  if (!keys.length) return section("Topics","Scored and practiced topic evidence appears together without treating practice coverage as mastery.",'<p class="empty">No topic-level Primo evidence yet.</p>');
  const rows = keys.map(key=>{
    const scored=object(progress.byTopic[key]), practiced=array(practice[key]?.practiced), latest=checks[key]?.latest ? object(checks[key].latest) : null;
    const attempts=number(scored.attempts),correct=number(scored.correct),acc=accuracy(correct,attempts),date=recentForTopic(progress.sessions,key);
    return `<tr><td><strong>${escapeHtml(topicLabel(key))}</strong></td><td>${attempts||"—"}</td><td>${attempts?correct:"—"}</td><td class="accuracy">${acc===null?"—":`${acc}%`}</td><td>${practiced.length?practiced.map(activityLabel).map(escapeHtml).join(", "):"—"}</td><td>${latest?`${number(latest.recognitionCorrect)}/${number(latest.recognitionTotal)} recognition`:"—"}</td><td>${date?escapeHtml(formatDate(date)):"—"}</td></tr>`;
  }).join("");
  return section("Topics","Topics with practice but no scored responses remain labeled as practiced evidence.",`<div class="table-wrap"><table><thead><tr><th>Topic</th><th>Attempts</th><th>Correct</th><th>Accuracy</th><th>Practiced activities</th><th>Latest Check</th><th>Recent activity</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function activitiesHtml(progress) {
  const entries=Object.entries(progress.byActivity).filter(([key,value])=>key!=="memory"&&number(value?.attempts)>0).sort((a,b)=>activityLabel(a[0]).localeCompare(activityLabel(b[0])));
  const memoryAttempts=number(progress.memory.attempts),memoryCorrect=number(progress.memory.correct);
  if (!entries.length&&!memoryAttempts) return section("Activities","Only activities with recorded response evidence appear here.",'<p class="empty">No activity evidence yet.</p>');
  const rows=entries.map(([key,value])=>{const a=number(value.attempts),c=number(value.correct);return `<tr><td><strong>${escapeHtml(activityLabel(key))}</strong></td><td>${a}</td><td>${c}</td><td class="accuracy">${accuracy(c,a)}%</td></tr>`}).join("");
  const scored=entries.length?`<div class="table-wrap"><table><thead><tr><th>Scored activity</th><th>Attempts</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="empty">No scored activity evidence yet.</p>';
  const memory=memoryAttempts?`<h3 class="subsection-title">Memoria</h3><p class="section-note">Shown separately because performance depends partly on which cards are revealed.</p><div class="table-wrap"><table><thead><tr><th>Activity</th><th>Attempts</th><th>Matches</th><th>Recorded rate</th></tr></thead><tbody><tr><td><strong>${escapeHtml(activityLabel("memory"))}</strong></td><td>${memoryAttempts}</td><td>${memoryCorrect}</td><td class="accuracy">${accuracy(memoryCorrect,memoryAttempts)}%</td></tr></tbody></table></div>`:"";
  return section("Activities","Practice-only activities are not assigned invented scores. Memoria is not included in overall accuracy.",`${scored}${memory}`);
}

function recommendation(attempt) { return attempt?.recommendation?.primaryLabel || (attempt?.recommendation?.primary ? activityLabel(attempt.recommendation.primary) : "—"); }
function startingChecksHtml(checks) {
  const entries=Object.entries(checks).filter(([,value])=>object(value).latest).sort((a,b)=>topicLabel(a[0]).localeCompare(topicLabel(b[0])));
  if (!entries.length) return section("Starting Checks","Recognition and production remain separate diagnostic dimensions.",'<p class="empty">No Starting Check has been completed for this student yet.</p>');
  const cards=entries.map(([topic,value])=>{const latest=object(value.latest),history=array(value.history);return `<article class="check-card"><p class="eyebrow">${escapeHtml(topicLabel(topic))}</p><h3>${escapeHtml(formatDate(latest.completedAt))}</h3><div class="check-metrics"><span><strong>${number(latest.recognitionCorrect)}/${number(latest.recognitionTotal)}</strong> recognition</span>${latest.productionAdministered?`<span><strong>${number(latest.productionCorrect)}/${number(latest.productionTotal)}</strong> production</span>`:"<span>Production not administered</span>"}</div><p><strong>Recommendation:</strong> ${escapeHtml(recommendation(latest))}</p>${latest.languagePatterns?`<p><strong>Language patterns:</strong> ${number(latest.languagePatterns.correct)}/${number(latest.languagePatterns.total)}</p>`:""}${latest.carrierTotal!==undefined?`<p><strong>Useful language:</strong> ${number(latest.carrierCorrect)}/${number(latest.carrierTotal)}</p>`:""}<p class="check-history">${history.length} recorded administration${history.length===1?"":"s"}</p></article>`}).join("");
  return section("Starting Checks","Diagnostic starting-point evidence does not contribute to practice, Journey, or a universal mastery score.",`<div class="check-grid">${cards}</div>`);
}

function evidenceHtml(progress) {
  const events=[...progress.allSessions].filter(item=>item?.date).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,50);
  if (!events.length) return section("Recent Evidence","Individual recorded responses appear here without raw student answers.",'<p class="empty">No recent response evidence yet.</p>');
  const rows=events.map(item=>`<tr><td>${escapeHtml(formatDate(item.date))}</td><td>${escapeHtml(topicLabel(item.topic))}</td><td>${escapeHtml(activityLabel(item.activity))}</td><td><span class="result ${item.correct?"result-correct":"result-incorrect"}"><span class="result-dot"></span>${item.correct?"Correct":"Incorrect"}</span></td><td>${escapeHtml(item.targetItalian||"—")}</td><td>${escapeHtml(item.targetEnglish||"—")}</td></tr>`).join("");
  return section("Recent Evidence","Most recent privacy-safe response evidence. Event identifiers are not displayed.",`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Topic</th><th>Activity</th><th>Result</th><th>Italian target</th><th>English</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

function trendsHtml(progress) {
  const events=[...progress.sessions].filter(item=>typeof item?.correct==="boolean"&&item.date).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
  if (events.length<3) return section("Trends","A chronological view appears only when enough scored observations exist.",'<p class="empty">More scored activity is needed to show a trend.</p>');
  const points=events.slice(-30).map((item,index)=>`${index?'<span class="trend-line"></span>':""}<span class="trend-point ${item.correct?"trend-correct":"trend-incorrect"}" title="${escapeHtml(`${formatDate(item.date)} · ${item.correct?"Correct":"Incorrect"}`)}"></span>`).join("");
  return section("Trends","Recent correct/incorrect sequence; it is not a proficiency rating.",`<div class="timeline" aria-label="Recent scored response sequence">${points}</div>`);
}

function journeyHtml(row) {
  const data=object(row?.data),explored=Object.keys(object(data.exploredTopics)),cities=array(data.celebratedCities);
  const content=!explored.length&&!cities.length?'<p class="empty">Journey engagement will appear as the student explores Primo.</p>':`<div class="journey-grid"><article class="journey-card"><h3>Explored topics</h3><div class="tag-list">${explored.length?explored.map(key=>`<span class="tag">${escapeHtml(topicLabel(key))}</span>`).join(""):"None recorded yet"}</div></article><article class="journey-card"><h3>Celebrated cities</h3><div class="tag-list">${cities.length?cities.map(city=>`<span class="tag">${escapeHtml(city.charAt(0).toUpperCase()+city.slice(1))}</span>`).join(""):"None recorded yet"}</div></article></div>`;
  return `<section class="report-section journey-section"><div class="section-heading"><div><h2>Journey · Engagement</h2><p>Journey reflects exploration and engagement and is not a measure of mastery or proficiency.</p></div></div>${content}</section>`;
}

function section(title,description,content){return `<section class="report-section"><div class="section-heading"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div></div>${content}</section>`}

function renderReport(profile, states) {
  const progress=progressModel(states.progress),practice=practiceModel(states.practice),checks=checksModel(states["starting-checks"]);
  const activityUrl = `index.html?studentId=${encodeURIComponent(profile.student_id)}`;
  document.querySelectorAll('.report-brand, .report-back').forEach(link => {
    link.href = activityUrl;
    if (link.classList.contains('report-back')) link.textContent = `← Work with ${profile.display_name} in Primo`;
  });
  app.innerHTML=`<section class="student-hero"><div><p class="eyebrow">Looking at ${escapeHtml(profile.display_name)}</p><h1>${escapeHtml(profile.display_name)}’s Primo Progress</h1><p>Recorded practice, diagnostic evidence, and scored activity in Primo.</p></div><span class="student-product">Primo Volo</span></section>${overviewHtml(progress,practice,checks)}${topicsHtml(progress,practice,checks)}${activitiesHtml(progress)}${startingChecksHtml(checks)}${evidenceHtml(progress)}${trendsHtml(progress)}${journeyHtml(states.journey)}<p class="note">This report is read only. Accuracy summarizes recorded scored responses; practice and Journey evidence are shown separately.</p>`;
}

async function init() {
  try {
    const user=await authorizeEducator();
    if(!user){renderState("Educator access required","Sign in with an authorized permanent educator account to view Primo Progress.",'<a class="button button-primary" href="https://firstvololearning-ctrl.github.io/First-Volo-Account/">Go to My First Volo</a>');return;}
    const raw=new URLSearchParams(location.search).get("studentId");
    if(raw&&!UUID.test(raw)){renderState("Student link not recognized","This Primo Progress link is malformed. No student data was loaded.",'<a class="button" href="primo-progress.html">Choose a student</a>');return;}
    if(!raw){profilePicker(await mappedProfiles(user));return;}
    const profiles=await mappedProfiles(user,raw);
    if(profiles.length!==1){renderState("Student report not available","No authorized active Primo profile matches this student link.",'<a class="button" href="primo-progress.html">Choose a student</a>');return;}
    renderReport(profiles[0],await stateForProfile(profiles[0].id));
  } catch(error) {
    console.error("Primo Progress could not load.",error);
    renderState("Progress could not be loaded","No student data was changed. Please try again.",'<button class="button button-primary" type="button" id="retryProgress">Try again</button>',error?.message||"");
    app.querySelector("#retryProgress").addEventListener("click",()=>location.reload());
  }
}

init();
