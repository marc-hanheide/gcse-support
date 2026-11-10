(function(){
'use strict';
var $=function(s,el){return (el||document).querySelector(s)};
var $$=function(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
var DAY=86400000;

/* ---------- storage ---------- */
var META=DATA.meta||{}, KEY=META.storageKey||'gcse-revision-v1', mem=null;
function load(){try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):{}}catch(e){return mem||{}}}
var S=load();
['cards','wrong','quiz','done','exam','drafts'].forEach(function(k){if(!S[k])S[k]={}});
if(!S.theme)S.theme='auto';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){mem=S}}

/* ---------- data ---------- */
var SECS=DATA.sections, SEC={}, TOP={}, COLS=META.colors||{}, PAL=['#6d28d9','#be185d','#0369a1','#0f766e','#b45309','#15803d','#b42318','#475569'];
SECS.forEach(function(s){
  var id=s.section.id; SEC[id]=s; TOP[id]={}; s.color=COLS[id]||PAL[SECS.indexOf(s)%PAL.length];
  s.topics.forEach(function(t,i){t._i=i;TOP[id][t.id]=t});
  s.cards=(s.flashcards||[]).map(function(c,i){return {id:id+':c'+i,sec:id,topic:c.topic,q:c.q,a:c.a,say:c.say}});
  s.vq=[];if(META.vocabQuiz)s.topics.forEach(function(t){(t.terms||[]).forEach(function(x,i){s.vq.push({id:id+':w'+t.id+':'+i,sec:id,topic:t.id,vocab:1,term:x.term,def:x.def,q:'French for: **'+x.def+'**',why:'**'+x.term+'** means '+x.def+'.'})})});
  if(META.termCards)s.topics.forEach(function(t){(t.terms||[]).forEach(function(x,i){s.cards.push({id:id+':v'+t.id+':'+i,sec:id,topic:t.id,q:x.def,a:x.term,say:x.term})})});
  s.qz=(s.quiz||[]).map(function(c,i){return {id:id+':q'+i,sec:id,topic:c.topic,q:c.q,options:c.options,answer:c.answer,why:c.why}});
  s.ex=(s.exam||[]).map(function(c,i){var o=Object.assign({},c);o.id=id+':e'+i;o.sec=id;return o});
});
var LBL=Object.assign({views:'Different views',sources:'Sources of wisdom and authority',use:'Use it for',terms:'Key terms',quoteBank:'Quote bank',quoteBankSub:'Sources of wisdom and authority',quoteSearch:'Search quotes or references',paper:'Paper'},META.labels||{});
var SPEAK=META.speak||'',VOICE=null;
function pickVoice(){if(!SPEAK||!window.speechSynthesis)return;var vs=speechSynthesis.getVoices(),lc=SPEAK.toLowerCase();VOICE=vs.filter(function(v){return v.lang&&v.lang.toLowerCase().replace('_','-')===lc})[0]||vs.filter(function(v){return v.lang&&v.lang.toLowerCase().indexOf(lc.slice(0,2))===0})[0]||null}
if(SPEAK&&window.speechSynthesis){pickVoice();if(speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',pickVoice)}
function sayBtn(t){if(!SPEAK||!window.speechSynthesis||!t)return '';return '<button class="say" type="button" data-act="say" data-say="'+esc(String(t).replace(/\*\*/g,''))+'" aria-label="Listen">🔊</button>'}
function speakText(t){try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=SPEAK;if(VOICE)u.voice=VOICE;u.rate=.9;speechSynthesis.speak(u)}catch(e){}}
var PAPERS=[];SECS.forEach(function(s){if(PAPERS.indexOf(s.section.paper)<0)PAPERS.push(s.section.paper)});PAPERS.sort();
function paperName(p){return (META.papers&&META.papers[p])||(LBL.paper+' '+p)}
function tname(sec,t){var x=TOP[sec]&&TOP[sec][t];return x?x.title:''}
function col(sec){return SEC[sec]?SEC[sec].color:'#4338ca'}
function secDone(s){return s.topics.filter(function(t){return S.done[s.section.id+':'+t.id]}).length}
function secKnown(s){return s.cards.filter(function(c){var x=S.cards[c.id];return x&&x.b>=3}).length}
function isDue(c,now){var x=S.cards[c.id];return x&&x.d<=now}

/* ---------- theme ---------- */
var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
function applyTheme(){var m=S.theme==='auto'?(mq&&mq.matches?'dark':'light'):S.theme;document.documentElement.setAttribute('data-mode',m);var tc=document.querySelector('meta[name=theme-color]');if(tc)tc.setAttribute('content',m==='dark'?'#12141c':'#4338ca')}
if(mq&&mq.addEventListener)mq.addEventListener('change',applyTheme);
applyTheme();

/* ---------- ui helpers ---------- */
var HOMEBTN='<a class="ib homebtn" href="#/" data-act="goHome" aria-label="Home"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg></a>';
function hdr(title,sub,back){return '<header class="top">'+(back?'<button class="ib" data-act="back" aria-label="Back">‹</button>':'')+'<div style="flex:1;min-width:0"><h1>'+esc(title)+'</h1>'+(sub?'<p class="sub">'+esc(sub)+'</p>':'')+'</div>'+HOMEBTN+'</header>'}
function bar(p,c){return '<div class="bar" style="--c:'+(c||'var(--ac)')+'" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(p)+'"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i></div>'}
function pill(t,c){return '<span class="pill'+(c?' c':'')+'"'+(c?' style="--c:'+c+'"':'')+'>'+esc(t)+'</span>'}
function pct(a,b){return b?Math.round(100*a/b):0}
var ICON={home:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',cards:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',write:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',guide:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>',more:'<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'};
function renderNav(h){var items=[['home','Home','#/'],['cards','Cards','#/cards'],['quiz','Quiz','#/quiz'],['write','Write','#/write'],['guide','Guide','#/guide'],['more','More','#/more']];
  var cur=h.indexOf('#/cards')===0?'cards':h.indexOf('#/quiz')===0?'quiz':(h.indexOf('#/write')===0||h.indexOf('#/w/')===0)?'write':h.indexOf('#/guide')===0?'guide':(h.indexOf('#/more')===0||h.indexOf('#/glossary')===0||h.indexOf('#/quotes')===0||h.indexOf('#/search')===0)?'more':'home';
  $('#nav').innerHTML='<div class="in">'+items.map(function(i){return '<a href="'+i[2]+'" class="'+(i[0]===cur?'on':'')+'"'+(i[0]===cur?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[i[0]]+'</svg>'+i[1]+'</a>'}).join('')+'</div>'}
function view(html){var v=$('#view');v.innerHTML=html;window.scrollTo(0,0)}

/* ---------- pools / scope ---------- */
function scopeOptions(sel){var o='<option value="all">Everything</option>';if(PAPERS.length>1)PAPERS.forEach(function(p){o+='<option value="p'+p+'"'+(sel==='p'+p?' selected':'')+'>'+esc((META.scopeLabels&&META.scopeLabels[p])||paperName(p))+'</option>'});
  SECS.forEach(function(s){o+='<option value="'+s.section.id+'"'+(sel===s.section.id?' selected':'')+'>'+esc(s.section.title)+'</option>'});return o}
function topicOptions(sec,sel){var o='<option value="all">All topics</option>';if(SEC[sec])SEC[sec].topics.forEach(function(t){o+='<option value="'+t.id+'"'+(sel===t.id?' selected':'')+'>'+esc(t.code+': '+t.title)+'</option>'});return o}
function scopeUI(sc,extra){sc=sc||{};return '<label class="f" for="sc-sec">What to cover</label><select id="sc-sec" data-scope="1">'+scopeOptions(sc.sec||'all')+(extra||'')+'</select><div id="sc-topwrap" style="'+(SEC[sc.sec]?'':'display:none')+'"><label class="f" for="sc-top">Topic</label><select id="sc-top">'+topicOptions(sc.sec,sc.topic)+'</select></div>'}
function readScope(){var s=$('#sc-sec')?$('#sc-sec').value:'all',t=$('#sc-top')?$('#sc-top').value:'all';return {sec:s,topic:SEC[s]?t:'all'}}
function inScope(s,sc){var v=sc.sec;if(!v||v==='all')return true;var m=/^p(\d+)$/.exec(v);if(m)return s.section.paper===+m[1];return s.section.id===v}
function pool(kind,sc){var out=[];SECS.forEach(function(s){if(!inScope(s,sc))return;s[kind].forEach(function(x){if(sc.topic&&sc.topic!=='all'&&x.topic!==sc.topic)return;out.push(x)})});return out}

/* ---------- views ---------- */
function home(){
  var now=Date.now(),totT=0,doneT=0,totC=0,knownC=0,due=0,newC=0;
  SECS.forEach(function(s){totT+=s.topics.length;doneT+=secDone(s);totC+=s.cards.length;knownC+=secKnown(s);s.cards.forEach(function(c){if(!S.cards[c.id])newC++;else if(S.cards[c.id].d<=now)due++})});
  var wrong=Object.keys(S.wrong).length;
  var h=hdr(META.title||'Revision',META.subtitle||'');
  h+='<div class="card"><div class="row" style="align-items:center"><div><div class="big">'+pct(doneT,totT)+'%</div><div class="mut small">topics revised ('+doneT+' of '+totT+')</div></div><div><div class="big">'+pct(knownC,totC)+'%</div><div class="mut small">cards learnt ('+knownC+' of '+totC+')</div></div></div></div>';
  h+='<div class="card"><b>Today</b><div class="row" style="margin-top:10px"><a class="btn pri" href="#/cards" data-act="quickCards">Flashcards: '+(due>0?due+' due':Math.min(newC,20)+' new')+'</a><a class="btn" href="#/quiz" data-act="quickQuiz">Quick quiz (10)</a>'+(SECS.some(function(s){return s.vq.length})?'<a class="btn" href="#/quiz" data-act="quickQuiz" data-kind="vq">'+esc(META.vocabQuizLabel||'Vocabulary')+' (10)</a>':'')+'</div>'+(wrong?'<p class="small mut" style="margin-top:10px">'+wrong+' question'+(wrong>1?'s':'')+' to revisit in the Quiz tab.</p>':'')+'</div>';
  PAPERS.forEach(function(p){
    h+='<h2>'+esc(paperName(p))+'</h2><div class="grid">';
    SECS.filter(function(s){return s.section.paper===p}).forEach(function(s){
      var d=secDone(s),n=s.topics.length,k=secKnown(s);
      h+='<a class="card sec c" style="--c:'+s.color+'" href="#/s/'+s.section.id+'"><b>'+esc(s.section.title)+'</b><div class="small mut" style="margin:4px 0 8px">'+esc(s.section.blurb||'')+'</div>'+bar(pct(d,n),s.color)+'<div class="stat"><span>'+d+'/'+n+' topics</span><span>'+k+'/'+s.cards.length+' cards</span><span>'+s.ex.length+' exam Qs</span></div></a>'});
    h+='</div>'});
  h+='<div class="card"><b>New here?</b><p class="small mut">Read the <a href="#/guide">exam guide</a> first, then work through a section: read a topic, do its flashcards, take its quiz, then write an exam answer.</p></div>';
  view(h)}

function secPage(id){
  var s=SEC[id];if(!s)return notFound();
  var h=hdr(s.section.title,paperName(s.section.paper),true);
  h+='<div class="card c" style="--c:'+s.color+'"><p>'+esc(s.section.blurb||'')+'</p>'+bar(pct(secDone(s),s.topics.length),s.color)+'<div class="row" style="margin-top:12px"><a class="btn pri" href="#/cards" data-act="goCards" data-sec="'+id+'">Flashcards ('+s.cards.length+')</a><a class="btn" href="#/quiz" data-act="goQuiz" data-sec="'+id+'">Quiz ('+s.qz.length+')</a><a class="btn" href="#/write" data-act="goWrite" data-sec="'+id+'">Write ('+s.ex.length+')</a>'+(s.vq.length?'<a class="btn" href="#/quiz" data-act="goQuiz" data-kind="vq" data-sec="'+id+'" data-start="1">Vocab quiz ('+s.vq.length+')</a>':'')+'</div></div>';
  h+='<h2>Topics</h2><div class="list">';
  s.topics.forEach(function(t){var d=S.done[id+':'+t.id];h+='<a class="item" href="#/t/'+id+'/'+t.id+'"><span class="tick'+(d?' on':'')+'" aria-label="'+(d?'Revised':'Not yet revised')+'">'+(d?'✓':'')+'</span><span class="t"><small>'+esc(t.code)+'</small>'+esc(t.title)+'</span><span class="mut">›</span></a>'});
  h+='</div>';view(h)}

function topicPage(sid,tid){
  var s=SEC[sid],t=s&&TOP[sid][tid];if(!t)return notFound();var c=s.color,done=S.done[sid+':'+tid];
  var h=hdr(t.title,s.section.title+' · '+t.code,true);
  h+='<div class="card c" style="--c:'+c+'"><p>'+fmt(t.overview||'')+'</p></div>';
  (t.notes||[]).forEach(function(n){h+='<h2>'+esc(n.h)+'</h2><div class="card c" style="--c:'+c+'"><ul class="b">'+(n.bullets||[]).map(function(b){return '<li>'+fmt(b)+'</li>'}).join('')+'</ul></div>'});
  if(t.views&&t.views.length){h+='<h2>'+esc(LBL.views)+'</h2>'+t.views.map(function(v){return '<div class="view" style="--c:'+c+'"><b>'+esc(v.label)+'</b>'+fmt(v.text)+(v.say?sayBtn(v.say===true?v.text:v.say):'')+(v.en?'<details class="en"><summary>English</summary><div>'+fmt(v.en)+'</div></details>':'')+'</div>'}).join('')}
  if(t.sources&&t.sources.length){h+='<h2>'+esc(LBL.sources)+'</h2>'+t.sources.map(function(q){return '<div class="quote" style="--c:'+c+'"><q>'+fmt(q.text)+sayBtn(q.text)+'</q><div class="ref">'+esc(q.ref||'')+'</div>'+(q.use?'<div class="use">'+esc(LBL.use)+': '+esc(q.use)+'</div>':'')+'</div>'}).join('')}
  if(t.terms&&t.terms.length){h+='<h2>'+esc(LBL.terms)+'</h2><div class="terms" style="--c:'+c+'">'+t.terms.map(function(x){return '<div><b>'+esc(x.term)+'</b>: '+fmt(x.def)+sayBtn(x.term)+'</div>'}).join('')+'</div>'}
  if(t.tip)h+='<div class="tip"><b>Exam tip.</b> '+fmt(t.tip)+'</div>';
  var nc=s.cards.filter(function(x){return x.topic===tid}).length,nq=s.qz.filter(function(x){return x.topic===tid}).length,ne=s.ex.filter(function(x){return x.topic===tid}).length,nv=s.vq.filter(function(x){return x.topic===tid}).length;
  h+='<h2>Test yourself</h2><div class="row"><a class="btn pri" href="#/cards" data-act="goCards" data-sec="'+sid+'" data-topic="'+tid+'" data-start="1">Cards ('+nc+')</a><a class="btn" href="#/quiz" data-act="goQuiz" data-sec="'+sid+'" data-topic="'+tid+'" data-start="1">Quiz ('+nq+')</a><a class="btn" href="#/write" data-act="goWrite" data-sec="'+sid+'" data-topic="'+tid+'">Write ('+ne+')</a>'+(nv?'<a class="btn" href="#/quiz" data-act="goQuiz" data-kind="vq" data-sec="'+sid+'" data-topic="'+tid+'" data-start="1">Vocab quiz ('+nv+')</a>':'')+'</div>';
  h+='<div style="margin:16px 0"><button class="btn '+(done?'':'ok')+'" style="width:100%" data-act="toggleDone" data-key="'+sid+':'+tid+'">'+(done?'✓ Marked as revised (tap to undo)':'Mark as revised')+'</button></div>';
  var prev=s.topics[t._i-1],next=s.topics[t._i+1];
  h+='<div class="row">'+(prev?'<a class="btn" href="#/t/'+sid+'/'+prev.id+'">‹ '+esc(prev.code)+'</a>':'')+(next?'<a class="btn" href="#/t/'+sid+'/'+next.id+'">'+esc(next.code)+' ›</a>':'')+'</div>';
  view(h)}

/* ----- flashcards ----- */
var CS=null,cardSetup={sec:'all',topic:'all',mode:'due',n:'20'};
function cardsSetup(){
  CS=null;var now=Date.now(),all=pool('cards',cardSetup),due=all.filter(function(c){return isDue(c,now)}).length,nw=all.filter(function(c){return !S.cards[c.id]}).length;
  var h=hdr('Flashcards','Cards you find hard come back sooner');
  h+='<div class="card">'+scopeUI(cardSetup)+
   '<label class="f" for="cd-mode">Which cards?</label><select id="cd-mode"><option value="due"'+(cardSetup.mode==='due'?' selected':'')+'>Due and new (recommended)</option><option value="weak"'+(cardSetup.mode==='weak'?' selected':'')+'>Ones I find hard</option><option value="all"'+(cardSetup.mode==='all'?' selected':'')+'>All cards, shuffled</option></select>'+
   '<label class="f" for="cd-n">How many?</label><select id="cd-n"><option value="10"'+(cardSetup.n==='10'?' selected':'')+'>10</option><option value="20"'+(cardSetup.n==='20'?' selected':'')+'>20</option><option value="40"'+(cardSetup.n==='40'?' selected':'')+'>40</option><option value="999"'+(cardSetup.n==='999'?' selected':'')+'>All of them</option></select>'+
   '<p class="small mut" id="cd-info" style="margin-top:12px">'+all.length+' cards in this selection: '+due+' due, '+nw+' new.</p>'+
   '<button class="btn pri" style="width:100%" data-act="startCards">Start</button></div>';
  view(h)}
function startCards(){
  var sc=readScope();cardSetup={sec:sc.sec,topic:sc.topic,mode:$('#cd-mode').value,n:$('#cd-n').value};beginCards()}
function beginCards(){
  var now=Date.now(),all=pool('cards',cardSetup),q;
  if(cardSetup.mode==='all')q=shuffle(all);
  else if(cardSetup.mode==='weak')q=shuffle(all.filter(function(c){var x=S.cards[c.id];return x&&x.b<=2}));
  else{var d=shuffle(all.filter(function(c){return isDue(c,now)})),n=shuffle(all.filter(function(c){return !S.cards[c.id]}));q=d.concat(n)}
  q=q.slice(0,parseInt(cardSetup.n,10)||20);
  if(!q.length){view(hdr('Flashcards','',true)+'<div class="card"><p><b>Nothing to practise here right now.</b></p><p class="mut">No cards are due in this selection. Try "All cards, shuffled", or pick another section.</p><a class="btn pri" href="#/cards" data-act="resetCardsRoute">Change selection</a></div>');return}
  CS={queue:q,total:q.length,done:0,good:0,again:0,flip:false,seen:{}};renderCard()}
function renderCard(){
  if(!CS)return;
  if(!CS.queue.length){var h=hdr('Well done','Session complete');h+='<div class="card"><div class="big">'+CS.good+' / '+CS.total+'</div><p class="mut">cards recalled first time. '+CS.again+' will come back sooner.</p><div class="row" style="margin-top:12px"><button class="btn pri" data-act="startCardsAgain">Another round</button><a class="btn" href="#/cards" data-act="resetCardsRoute">Change selection</a></div></div>';view(h);CS=null;return}
  var c=CS.queue[0],col_=col(c.sec);
  var h='<header class="top"><button class="ib" data-act="endCards" aria-label="Stop and go back">‹</button><div style="flex:1">'+bar(pct(CS.done,CS.total),col_)+'<p class="sub small" style="margin:4px 0 0">'+CS.done+' of '+CS.total+' · '+esc(SEC[c.sec].section.short||SEC[c.sec].section.title)+'</p></div>'+HOMEBTN+'</header>';
  h+='<div class="card fc c" style="--c:'+col_+';border-color:'+col_+'" data-act="flip" role="button" tabindex="0" aria-label="Card. Tap to reveal the answer">';
  h+=CS.flip?'<div class="small mut" style="margin-bottom:8px">Answer</div><div class="a">'+fmt(c.a)+'</div><div class="hint">'+esc(c.q)+'</div>':'<div class="small mut" style="margin-bottom:8px">'+esc(tname(c.sec,c.topic))+'</div><div class="q">'+fmt(c.q)+'</div><div class="hint">Tap to reveal the answer</div>';
  h+='</div>';
  h+=CS.flip?sayBtn(c.say):'';
  h+=CS.flip?'<div class="row"><button class="btn bad" data-act="cardAns" data-v="0">Not yet</button><button class="btn ok" data-act="cardAns" data-v="1">Got it</button></div>':'<button class="btn" style="width:100%" data-act="flip">Show answer</button>';
  view(h);var f=$('.fc');if(f)f.focus({preventScroll:true})}
var INTV=[0,0,1,3,7,14,30];
function cardAns(v){
  var c=CS.queue.shift(),x=S.cards[c.id]||{b:0,d:0},first=!CS.seen[c.id];CS.seen[c.id]=1;
  if(v){x.b=Math.min(6,(x.b||0)+1);x.d=Date.now()+INTV[Math.min(x.b,6)]*DAY;if(first)CS.good++;CS.done++}
  else{x.b=1;x.d=Date.now();if(first)CS.again++;CS.queue.splice(Math.min(3,CS.queue.length),0,c)}
  if(x.b>5)x.b=5;
  S.cards[c.id]=x;save();CS.flip=false;renderCard()}

/* ----- quiz ----- */
var QS=null,quizSetup={sec:'all',topic:'all',n:'10',wrongOnly:false};
function quizPage(){
  QS=null;var wc=Object.keys(S.wrong).length,all=pool(qkind(),quizSetup).length,hasV=SECS.some(function(s){return s.vq.length});
  var h=hdr('Quiz','Multiple choice, with an explanation after each answer');
  h+='<div class="card">'+(hasV?'<label class="f" for="qz-kind">Question type</label><select id="qz-kind"><option value="qz"'+(qkind()==='qz'?' selected':'')+'>Topic questions</option><option value="vq"'+(qkind()==='vq'?' selected':'')+'>'+esc(META.vocabQuizLabel||'Vocabulary')+'</option></select>':'')+scopeUI(quizSetup)+'<label class="f" for="qz-n">How many questions?</label><select id="qz-n"><option value="5"'+(quizSetup.n==='5'?' selected':'')+'>5</option><option value="10"'+(quizSetup.n==='10'?' selected':'')+'>10</option><option value="20"'+(quizSetup.n==='20'?' selected':'')+'>20</option><option value="999"'+(quizSetup.n==='999'?' selected':'')+'>All of them</option></select>'+
   '<label class="chk" style="margin-top:10px"><input type="checkbox" id="qz-wrong"'+(quizSetup.wrongOnly?' checked':'')+'><span>Only questions I got wrong before ('+wc+')</span></label><p class="small mut" id="qz-info">'+all+' questions in this selection.</p><button class="btn pri" style="width:100%" data-act="startQuiz">Start quiz</button></div>';
  var rec=[];SECS.forEach(function(s){if(S.quiz[s.section.id])rec.push({s:s,k:s.section.id,l:s.section.title});if(S.quiz[s.section.id+':vocab'])rec.push({s:s,k:s.section.id+':vocab',l:s.section.title+' (vocabulary)'})});
  if(rec.length){h+='<h2>Your best scores</h2><div class="list">'+rec.map(function(o){var s=o.s,q=S.quiz[o.k];return '<div class="item"><span class="t">'+esc(o.l)+'<small>Last '+q.last+'%</small></span>'+pill('Best '+q.best+'%',s.color)+'</div>'}).join('')+'</div>'}
  view(h)}
function startQuiz(){
  var sc=readScope();quizSetup={sec:sc.sec,topic:sc.topic,n:$('#qz-n').value,wrongOnly:$('#qz-wrong').checked,kind:$('#qz-kind')?$('#qz-kind').value:'qz'};beginQuiz()}
function vocabOpts(x){
  var near=SEC[x.sec].vq.filter(function(y){return y.topic===x.topic}),far=[];SECS.forEach(function(s){s.vq.forEach(function(y){if(y.topic!==x.topic)far.push(y)})});
  function senses(d){return String(d).replace(/\([^)]*\)/g,'').split(/[,\/;]/).map(function(z){return z.trim().toLowerCase()}).filter(Boolean)}
  var opts=[x.term],seen={},used=senses(x.def);seen[x.term]=1;
  /* skip distractors that share any meaning with the answer, so only one option is right */
  shuffle(near).concat(shuffle(far)).forEach(function(y){if(opts.length<4&&!seen[y.term]&&!senses(y.def).some(function(z){return used.indexOf(z)>=0})){opts.push(y.term);seen[y.term]=1}});
  return {options:opts,answer:0}}
function qkind(){return quizSetup.kind==='vq'?'vq':'qz'}
function beginQuiz(items){
  var q=items;
  if(!q){q=pool(qkind(),quizSetup);if(quizSetup.wrongOnly)q=q.filter(function(x){return S.wrong[x.id]});q=shuffle(q).slice(0,parseInt(quizSetup.n,10)||10)}
  if(!q.length){view(hdr('Quiz','',true)+'<div class="card"><p><b>No questions to show.</b></p><p class="mut">Nothing matches this selection yet (you may have no mistakes saved). Change the selection and try again.</p><a class="btn pri" href="#/quiz" data-act="resetQuizRoute">Back</a></div>');return}
  q=q.map(function(x){return x.vocab?Object.assign({},x,vocabOpts(x)):x});
  QS={kind:qkind(),items:q.map(function(x){var idx=shuffle(x.options.map(function(_,i){return i}));return {id:x.id,sec:x.sec,topic:x.topic,q:x.q,why:x.why,say:x.term,opts:idx.map(function(i){return {t:x.options[i],ok:i===x.answer}})}}),i:0,score:0,pick:null,wrong:[]};renderQuiz()}
function renderQuiz(){
  if(!QS)return;
  if(QS.i>=QS.items.length){var tot=QS.items.length,p=pct(QS.score,tot);
    var secs={};QS.items.forEach(function(x){secs[x.sec]=1});
    Object.keys(secs).forEach(function(k){var its=QS.items.filter(function(x){return x.sec===k}),sc=its.filter(function(x){return QS.wrong.indexOf(x.id)<0}).length,pp=pct(sc,its.length),kk=k+(QS.kind==='vq'?':vocab':''),r=S.quiz[kk]||{best:0,last:0};r.last=pp;r.best=Math.max(r.best,pp);S.quiz[kk]=r});save();
    var h=hdr('Quiz complete');h+='<div class="card"><div class="big">'+QS.score+' / '+tot+'</div><p class="mut">'+p+'%. '+(p>=80?'Excellent work.':p>=60?'Good, keep going.':'Worth another go after a look at the notes.')+'</p></div>';
    if(QS.wrong.length){h+='<h2>To review</h2>'+QS.items.filter(function(x){return QS.wrong.indexOf(x.id)>=0}).map(function(x){var ok=x.opts.filter(function(o){return o.ok})[0];return '<div class="card c" style="--c:'+col(x.sec)+'"><p><b>'+fmt(x.q)+'</b></p><p>Answer: '+fmt(ok.t)+'</p><p class="small mut">'+fmt(x.why)+'</p><a class="small" href="#/t/'+x.sec+'/'+x.topic+'">Open topic: '+esc(tname(x.sec,x.topic))+'</a></div>'}).join('')}
    h+='<div class="row">'+(QS.wrong.length?'<button class="btn pri" data-act="retryWrong">Retry the ones I missed</button>':'')+'<a class="btn" href="#/quiz" data-act="resetQuizRoute">New quiz</a></div>';
    view(h);return}
  var it=QS.items[QS.i],c=col(it.sec);
  var h='<header class="top"><button class="ib" data-act="endQuiz" aria-label="Stop and go back">‹</button><div style="flex:1">'+bar(pct(QS.i,QS.items.length),c)+'<p class="sub small" style="margin:4px 0 0">Question '+(QS.i+1)+' of '+QS.items.length+' · score '+QS.score+'</p></div>'+HOMEBTN+'</header>';
  h+='<div class="card c" style="--c:'+c+'"><div class="small mut">'+esc(SEC[it.sec].section.short||SEC[it.sec].section.title)+' · '+esc(tname(it.sec,it.topic))+'</div><p style="font-size:1.1rem;font-weight:700;margin-top:6px">'+fmt(it.q)+'</p></div>';
  var L='ABCD';
  it.opts.forEach(function(o,i){var cls='';if(QS.pick!==null){if(o.ok)cls=' ok';else if(i===QS.pick)cls=' bad'}h+='<button class="opt'+cls+'" data-act="quizPick" data-i="'+i+'"'+(QS.pick!==null?' disabled':'')+'><b>'+L[i]+'.</b> '+fmt(o.t)+(QS.pick!==null&&o.ok?' ✓':'')+(QS.pick===i&&!o.ok?' ✗':'')+'</button>'});
  if(QS.pick!==null){var good=it.opts[QS.pick].ok;h+='<div class="fb '+(good?'ok':'bad')+'"><b>'+(good?'Correct.':'Not quite.')+'</b><p>'+fmt(it.why)+(QS.kind==='vq'?sayBtn(it.say):'')+'</p></div><button class="btn pri" style="width:100%" data-act="quizNext">'+(QS.i+1>=QS.items.length?'See results':'Next question')+'</button>'}
  view(h)}

/* ----- write ----- */
var W={sec:'all',topic:'all',marks:'all'},cur=null,MARKS=[];SECS.forEach(function(s){s.ex.forEach(function(e){var m=String(e.marks);if(MARKS.indexOf(m)<0)MARKS.push(m)})});MARKS.sort(function(a,b){return a-b});
function writeList(){
  var h=hdr('Write','Exam questions with model answers and mark points');
  var items=[];SECS.forEach(function(s){if(!inScope(s,W))return;s.ex.forEach(function(e){if(W.topic!=='all'&&e.topic!==W.topic)return;if(W.marks!=='all'&&String(e.marks)!==W.marks)return;items.push(e)})});
  h+='<div class="card">'+scopeUI(W)+'<label class="f">Question size</label><div class="chips" id="w-marks">'+['all'].concat(MARKS).map(function(m){return '<button class="chip'+(W.marks===m?' on':'')+'" data-act="setMarks" data-m="'+m+'">'+(m==='all'?'All':m+' marks')+'</button>'}).join('')+'</div><p class="small mut">'+items.length+' questions. '+items.filter(function(e){return S.exam[e.id]}).length+' attempted.</p>'+(items.length?'<a class="btn pri" style="width:100%" href="#/w/'+shuffle(items)[0].id+'">Random question</a>':'')+'</div>';
  h+='<div class="list">'+items.map(function(e){var d=S.exam[e.id];return '<a class="item" href="#/w/'+e.id+'"><span class="t"><small>'+esc(SEC[e.sec].section.short||SEC[e.sec].section.title)+' · '+esc(tname(e.sec,e.topic))+'</small>'+esc(e.q.length>120?e.q.slice(0,117)+'...':e.q)+'</span>'+pill(e.marks+' marks',col(e.sec))+(d?'<span class="tick on">✓</span>':'')+'</a>'}).join('')+'</div>';
  view(h)}
var STRUCT0={'evaluate':['Argument for, with evidence','Argument against, with evidence','Evaluate: how convincing is each side?','Conclusion: which is stronger, and why?']};
var STRUCT=Object.assign({},STRUCT0,META.structures||{});
function writeItem(id){
  var sid=id.split(':')[0],s=SEC[sid],e=s&&s.ex.filter(function(x){return x.id===id})[0];if(!e)return notFound();cur=e;var c=s.color,st=S.exam[id]||{},mins=e.marks;
  var timing=['conversation','roleplay','read-aloud'].indexOf(e.type)<0?'<p class="small mut">Aim for about '+mins+' minutes in the exam.</p>':'';
  var h=hdr((META.typeNames&&META.typeNames[e.type])||(e.marks+' mark question'),(META.typeNames&&META.typeNames[e.type]?e.marks+' marks · ':'')+s.section.title,true);
  h+='<div class="card c" style="--c:'+c+'"><div class="small mut">'+esc(tname(sid,e.topic))+'</div><p style="font-size:1.08rem;font-weight:700;margin-top:6px">'+fmt(e.q)+'</p>'+timing+(e.listen?sayBtn(e.model).replace('aria-label="Listen">🔊','aria-label="Listen">🔊 Listen'):'')+'</div>';
  if(STRUCT[e.type])h+='<details><summary>Structure to follow</summary><div><ol class="steps">'+STRUCT[e.type].map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol></div></details>';
  h+='<label class="f" for="draft">Your answer (saved on this device)</label><textarea id="draft" data-act-input="draft" data-id="'+esc(id)+'" placeholder="Write your answer here, or on paper, then check it below.">'+esc(S.drafts[id]||'')+'</textarea>';
  h+='<div id="reveal">'+(st.shown?revealHtml(e,st):'<button class="btn pri" style="width:100%;margin-top:12px" data-act="reveal">Show model answer and mark points</button>')+'</div>';
  var list=[];s.ex.forEach(function(x){list.push(x)});var i=list.indexOf(e),prev=list[i-1],next=list[i+1];
  h+='<div class="row" style="margin-top:16px">'+(prev?'<a class="btn" href="#/w/'+prev.id+'">‹ Previous</a>':'')+(next?'<a class="btn" href="#/w/'+next.id+'">Next ›</a>':'')+'</div>';
  view(h)}
function revealHtml(e,st){
  var c=col(e.sec),pts=(e.points&&e.points.length)?e.points:(e.type==='evaluate'?(META.evaluateChecklist||['Argued one side with a developed point','Supported it with evidence','Argued a different point of view with a developed point','Supported that with evidence','Evaluated the arguments (how strong or weak each is)','Reached a justified conclusion']):[]),got=(st.pts||[]);
  var h=pts.length?'<h2>Mark points</h2><p class="small mut">Tick each point your answer made.</p><div class="card">'+pts.map(function(p,i){return '<label class="chk"><input type="checkbox" data-act-input="pt" data-i="'+i+'"'+(got.indexOf(i)>=0?' checked':'')+'><span>'+fmt(p)+'</span></label>'}).join('')+'<p class="small" id="ptsum" style="margin-top:8px"><b>'+got.length+' of '+pts.length+' points</b></p></div>':'';
  if(e.type==='evaluate'){
    if(e['for']&&e['for'].length)h+='<h2>Arguments for</h2><div class="card"><ul class="b">'+e['for'].map(function(x){return '<li>'+fmt(x)+'</li>'}).join('')+'</ul></div>';
    if(e.against&&e.against.length)h+='<h2>Arguments against</h2><div class="card"><ul class="b">'+e.against.map(function(x){return '<li>'+fmt(x)+'</li>'}).join('')+'</ul></div>';
    if(e.conclusion)h+='<h2>Conclusion</h2><div class="card">'+fmt(e.conclusion)+'</div>'}
  h+='<h2>Model answer</h2><div class="model" style="--c:'+c+'">'+esc(e.model||'')+'</div>'+(e.say?sayBtn(e.model):'')+(e.en?'<details class="en"><summary>English</summary><div>'+fmt(e.en)+'</div></details>':'')+'<p class="small mut" style="margin-top:8px">A model answer is one good way to answer, not the only one. Different correct points can earn marks too.</p>';
  return h}

/* ----- guide / more / glossary / quotes / search ----- */
function guide(){view(hdr('Exam guide','How the papers work and how to answer each question')+(typeof TECH_GUIDE!=='undefined'?TECH_GUIDE:'<div class="card">No guide has been added for this subject yet.</div>'))}
function more(){
  var h=hdr('More');
  h+='<div class="list"><a class="item" href="#/glossary"><span class="t">Glossary<small>'+DATA.glossary.length+' '+esc(META.glossaryLabel||'key terms')+'</small></span><span class="mut">›</span></a><a class="item" href="#/quotes"><span class="t">'+esc(LBL.quoteBank)+'<small>'+esc(LBL.quoteBankSub)+'</small></span><span class="mut">›</span></a><a class="item" href="#/search"><span class="t">Search<small>Topics, terms and cards</small></span><span class="mut">›</span></a><a class="item" href="#/guide"><span class="t">Exam guide<small>Structure, timing, how to answer</small></span><span class="mut">›</span></a></div>';
  h+='<h2>Settings</h2><div class="card"><label class="f" for="theme">Appearance</label><select id="theme" data-act-change="theme"><option value="auto"'+(S.theme==='auto'?' selected':'')+'>Match my phone</option><option value="light"'+(S.theme==='light'?' selected':'')+'>Light</option><option value="dark"'+(S.theme==='dark'?' selected':'')+'>Dark</option></select>';
  h+='<p class="small mut" style="margin-top:12px">Progress is saved in this browser on this device only. To keep the app on your phone: open it in your browser, tap Share, then Add to Home Screen.</p><button class="btn" style="width:100%" data-act="reset" id="resetbtn">Reset all my progress</button></div>';
  h+='<h2>About this app</h2><div class="card small">'+(META.about||'')+'<p><strong>Disclaimer:</strong> this app is provided for revision only. The information in it is not guaranteed to be correct or complete; check anything important against the exam board specification and with your teacher.</p><p>&copy; Marc Hanheide. Source code and licence (Apache 2.0): <a href="https://github.com/marc-hanheide/gcse-support" target="_blank" rel="noopener">github.com/marc-hanheide/gcse-support</a></p><p class="mut">Version: '+esc(DATA.built||'')+'</p></div>';
  view(h)}
var GF={g:'all',q:''};
function glossary(){
  var groups=['all'].concat(DATA.glossary.reduce(function(a,x){if(a.indexOf(x.group)<0)a.push(x.group);return a},[]));
  var h=hdr('Glossary',META.glossaryLabel||'Key terms',true)+'<div class="sticky"><input type="search" id="gq" placeholder="Search terms" value="'+esc(GF.q)+'" aria-label="Search glossary"></div><div class="chips">'+groups.map(function(g){return '<button class="chip'+(GF.g===g?' on':'')+'" data-act="gGroup" data-g="'+esc(g)+'">'+(g==='all'?'All':esc(g))+'</button>'}).join('')+'</div><div id="glist"></div>';view(h);glist()}
function glist(){
  var q=GF.q.toLowerCase(),items=DATA.glossary.filter(function(x){return (GF.g==='all'||x.group===GF.g)&&(!q||x.term.toLowerCase().indexOf(q)>=0||x.def.toLowerCase().indexOf(q)>=0)});
  items.sort(function(a,b){return a.term.localeCompare(b.term)});
  $('#glist').innerHTML=items.length?items.map(function(x){return '<details><summary><span>'+esc(x.term)+' <span class="mut small">'+esc(x.group)+'</span></span></summary><div>'+esc(x.def)+sayBtn(META.speak?x.term:'')+'</div></details>'}).join(''):'<p class="mut">No terms match.</p>'}
var QF={sec:'all',q:''};
function quotes(){
  var h=hdr(LBL.quoteBank,LBL.quoteBankSub,true)+(typeof TECH_QUOTES!=='undefined'?TECH_QUOTES:'')+'<div class="sticky" style="margin-top:10px"><input type="search" id="qq" placeholder="'+esc(LBL.quoteSearch)+'" value="'+esc(QF.q)+'" aria-label="Search quotes"></div><div class="chips"><button class="chip'+(QF.sec==='all'?' on':'')+'" data-act="qSec" data-s="all">All</button>'+SECS.map(function(s){return '<button class="chip'+(QF.sec===s.section.id?' on':'')+'" data-act="qSec" data-s="'+s.section.id+'">'+esc(s.section.short||s.section.title)+'</button>'}).join('')+'</div><div id="qlist"></div>';view(h);qlist()}
function qlist(){
  var q=QF.q.toLowerCase(),out=[];
  SECS.forEach(function(s){if(QF.sec!=='all'&&QF.sec!==s.section.id)return;s.topics.forEach(function(t){(t.sources||[]).forEach(function(x){var blob=(x.text+' '+x.ref+' '+(x.use||'')).toLowerCase();if(!q||blob.indexOf(q)>=0)out.push({s:s,t:t,x:x})})})});
  $('#qlist').innerHTML=out.length?out.map(function(o){return '<div class="quote" style="--c:'+o.s.color+'"><q>'+fmt(o.x.text)+sayBtn(o.x.text)+'</q><div class="ref">'+esc(o.x.ref||'')+'</div>'+(o.x.use?'<div class="use">'+esc(LBL.use)+': '+esc(o.x.use)+'</div>':'')+'<div class="use"><a href="#/t/'+o.s.section.id+'/'+o.t.id+'">'+esc(o.s.section.short||o.s.section.title)+': '+esc(o.t.title)+'</a></div></div>'}).join(''):'<p class="mut">No quotes match.</p>'}
var IDX=null;
function buildIdx(){IDX=[];SECS.forEach(function(s){var id=s.section.id;s.topics.forEach(function(t){var txt=[t.title,t.overview].concat((t.notes||[]).reduce(function(a,n){return a.concat(n.bullets||[])},[])).join(' ');IDX.push({k:'Topic',l:t.title,sub:s.section.title,t:txt.toLowerCase(),link:'#/t/'+id+'/'+t.id,c:s.color});(t.terms||[]).forEach(function(x){IDX.push({k:'Term',l:x.term,sub:x.def,t:(x.term+' '+x.def).toLowerCase(),link:'#/t/'+id+'/'+t.id,c:s.color})})});s.cards.forEach(function(c){IDX.push({k:'Card',l:c.q,sub:c.a,t:(c.q+' '+c.a).toLowerCase(),link:'#/t/'+id+'/'+c.topic,c:s.color})})});DATA.glossary.forEach(function(x){IDX.push({k:'Glossary',l:x.term,sub:x.def,t:(x.term+' '+x.def).toLowerCase(),link:'#/glossary',c:'#4338ca'})})}
function search(){view(hdr('Search','',true)+'<div class="sticky"><input type="search" id="sq" placeholder="Search everything" aria-label="Search"></div><div id="sres"><p class="mut">Type at least two letters.</p></div>')}
function doSearch(q){
  if(!IDX)buildIdx();q=q.toLowerCase().trim();var r=$('#sres');if(q.length<2){r.innerHTML='<p class="mut">Type at least two letters.</p>';return}
  var out=IDX.filter(function(x){return x.t.indexOf(q)>=0}).slice(0,40);
  r.innerHTML=out.length?'<div class="list">'+out.map(function(x){return '<a class="item" href="'+x.link+'"><span class="t"><small>'+x.k+(x.k!=='Glossary'?' · '+esc(x.k==='Topic'?x.sub:''):'')+'</small>'+esc(x.l)+(x.k!=='Topic'?'<small>'+esc(x.sub.length>110?x.sub.slice(0,107)+'...':x.sub)+'</small>':'')+'</span><span class="mut">›</span></a>'}).join('')+'</div>':'<p class="mut">Nothing found.</p>'}
function notFound(){view(hdr('Not found','',true)+'<div class="card"><p>That page does not exist.</p><a class="btn pri" href="#/">Home</a></div>')}

/* ---------- router ---------- */
function route(){
  var h=location.hash||'#/',m;if(h.charAt(1)!=='/')h='#/';renderNav(h);
  if(h==='#/'||h==='#')return home();
  if(m=h.match(/^#\/s\/([\w-]+)$/))return secPage(m[1]);
  if(m=h.match(/^#\/t\/([\w-]+)\/([\w-]+)$/))return topicPage(m[1],m[2]);
  if(h==='#/cards')return CS?renderCard():cardsSetup();
  if(h==='#/quiz')return QS?renderQuiz():quizPage();
  if(h==='#/write')return writeList();
  if(m=h.match(/^#\/w\/(.+)$/))return writeItem(decodeURIComponent(m[1]));
  if(h==='#/guide')return guide();
  if(h==='#/more')return more();
  if(h==='#/glossary')return glossary();
  if(h==='#/quotes')return quotes();
  if(h==='#/search')return search();
  notFound()}
window.addEventListener('hashchange',route);

/* ---------- events ---------- */
var ACT={
 goHome:function(){CS=null;QS=null},
 back:function(){if(history.length>1)history.back();else location.hash='#/'},
 toggleDone:function(t){var k=t.dataset.key;S.done[k]=!S.done[k];if(!S.done[k])delete S.done[k];save();var p=k.split(':');topicPage(p[0],p[1])},
 quickCards:function(){cardSetup={sec:'all',topic:'all',mode:'due',n:'20'};CS=null;setTimeout(beginCards,0)},
 quickQuiz:function(t){quizSetup={sec:'all',topic:'all',n:'10',wrongOnly:false,kind:t&&t.dataset&&t.dataset.kind||'qz'};QS=null;setTimeout(beginQuiz,0)},
 goCards:function(t){cardSetup={sec:t.dataset.sec,topic:t.dataset.topic||'all',mode:t.dataset.start?'all':'due',n:t.dataset.start?'999':'20'};CS=null;if(t.dataset.start)setTimeout(beginCards,0)},
 goQuiz:function(t){quizSetup={sec:t.dataset.sec,topic:t.dataset.topic||'all',n:t.dataset.start?(t.dataset.kind==='vq'?'20':'999'):'10',wrongOnly:false,kind:t.dataset.kind||'qz'};QS=null;if(t.dataset.start)setTimeout(beginQuiz,0)},
 goWrite:function(t){W={sec:t.dataset.sec,topic:t.dataset.topic||'all',marks:'all'}},
 startCards:startCards,
 startCardsAgain:function(){beginCards()},
 resetCardsRoute:function(){CS=null;if(location.hash==='#/cards')setTimeout(cardsSetup,0)},
 endCards:function(){CS=null;history.length>1?history.back():(location.hash='#/cards');if(location.hash==='#/cards')cardsSetup()},
 say:function(t,e){if(e)e.stopPropagation();speakText(t.dataset.say)},
 flip:function(){if(CS){CS.flip=!CS.flip;renderCard()}},
 cardAns:function(t){cardAns(t.dataset.v==='1')},
 startQuiz:startQuiz,
 resetQuizRoute:function(){QS=null;if(location.hash==='#/quiz')setTimeout(quizPage,0)},
 endQuiz:function(){QS=null;history.length>1?history.back():(location.hash='#/quiz');if(location.hash==='#/quiz')quizPage()},
 quizPick:function(t){if(QS.pick!==null)return;var i=+t.dataset.i,it=QS.items[QS.i];QS.pick=i;var ok=it.opts[i].ok;if(ok){QS.score++;if(S.wrong[it.id]){S.wrong[it.id]--;if(S.wrong[it.id]<=0)delete S.wrong[it.id]}}else{QS.wrong.push(it.id);S.wrong[it.id]=(S.wrong[it.id]||0)+1}save();renderQuiz();var f=$('.fb');if(f)f.scrollIntoView({block:'nearest'})},
 quizNext:function(){QS.i++;QS.pick=null;renderQuiz()},
 retryWrong:function(){var ids=QS.wrong.slice(),all=[];SECS.forEach(function(s){s.qz.concat(s.vq).forEach(function(x){if(ids.indexOf(x.id)>=0)all.push(x)})});beginQuiz(shuffle(all))},
 setMarks:function(t){var sc=readScope();W.sec=sc.sec;W.topic=sc.topic;W.marks=t.dataset.m;writeList()},
 reveal:function(){var st=S.exam[cur.id]||{};st.shown=true;S.exam[cur.id]=st;save();$('#reveal').innerHTML=revealHtml(cur,st)},
 gGroup:function(t){GF.g=t.dataset.g;glossary()},
 qSec:function(t){QF.sec=t.dataset.s;quotes()},
 reset:function(t){if(t.dataset.sure){S={cards:{},wrong:{},quiz:{},done:{},exam:{},drafts:{},theme:S.theme};save();CS=null;QS=null;location.hash='#/';return}t.dataset.sure='1';t.textContent='Tap again to erase all progress';t.className='btn bad';t.style.width='100%'}
};
document.addEventListener('click',function(e){var t=e.target.closest('[data-act]');if(!t)return;var a=ACT[t.dataset.act];if(a){a(t,e)}});
document.addEventListener('keydown',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('fc')&&(e.key===' '||e.key==='Enter')){e.preventDefault();ACT.flip()}
  if(CS&&CS.flip&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){if(e.key==='1')ACT.cardAns({dataset:{v:'0'}});if(e.key==='2')ACT.cardAns({dataset:{v:'1'}})}});
document.addEventListener('change',function(e){var t=e.target;
  if(t.id==='sc-sec'){var v=t.value,w=$('#sc-topwrap');if(SEC[v]){$('#sc-top').innerHTML=topicOptions(v);w.style.display=''}else w.style.display='none';refreshInfo()}
  else if(t.id==='qz-kind'||t.id==='sc-top'||t.id==='cd-mode'||t.id==='qz-wrong'||t.id==='qz-n'||t.id==='cd-n')refreshInfo();
  if(t.dataset.actChange==='theme'){S.theme=t.value;save();applyTheme()}
  if(t.dataset.actInput==='pt'&&cur){var st=S.exam[cur.id]||{},p=st.pts||[],i=+t.dataset.i,k=p.indexOf(i);if(t.checked&&k<0)p.push(i);if(!t.checked&&k>=0)p.splice(k,1);st.pts=p;S.exam[cur.id]=st;save();var s=$('#ptsum');if(s)s.innerHTML='<b>'+p.length+' of '+(cur.points||[]).length+' points</b>'}
  if(location.hash==='#/write'&&(t.id==='sc-sec'||t.id==='sc-top')){var sc=readScope();W.sec=sc.sec;W.topic=sc.topic;writeList()}});
function refreshInfo(){
  var sc=readScope();
  if($('#cd-info')){var now=Date.now(),all=pool('cards',sc),d=all.filter(function(c){return isDue(c,now)}).length,n=all.filter(function(c){return !S.cards[c.id]}).length;$('#cd-info').textContent=all.length+' cards in this selection: '+d+' due, '+n+' new.'}
  if($('#qz-info')){var q=pool($('#qz-kind')&&$('#qz-kind').value==='vq'?'vq':'qz',sc);if($('#qz-wrong')&&$('#qz-wrong').checked)q=q.filter(function(x){return S.wrong[x.id]});$('#qz-info').textContent=q.length+' questions in this selection.'}}
document.addEventListener('input',function(e){var t=e.target;
  if(t.id==='draft'){S.drafts[t.dataset.id]=t.value;var st=S.exam[t.dataset.id]||{};st.started=1;S.exam[t.dataset.id]=st;clearTimeout(window._ds);window._ds=setTimeout(save,400)}
  if(t.id==='gq'){GF.q=t.value;glist()}
  if(t.id==='qq'){QF.q=t.value;qlist()}
  if(t.id==='sq')doSearch(t.value)});
route();
})();
