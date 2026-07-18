// ── JM Football Pinpoint — NFL data layer (ESPN public stats API) ──────────────
// ESPN byathlete endpoint: CORS-open, sortable ranked leaderboards per category,
// includes headshot URL. sort format: "<category>.<statKey>:desc".
// NOTE: ESPN's byathlete data only goes back to 1993, so "career" = 1993–present.

const ESPN = 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete';
const CAREER_START = 1993, CAREER_END = 2024;

const _int = v => Math.round(parseFloat(v));
const _d1  = v => parseFloat(v).toFixed(1);

// Each group maps to one ESPN category (a stat may override with its own `cat`).
// careerOk:true = a plain counting total that can be summed across seasons.
const NFL_GROUPS = {
  passing: {
    label:'Passing (QB)', category:'passing',
    positions:[{val:'ALL',label:'All Passers'},{val:'QB',label:'Quarterback (QB)'}],
    stats:[
      {key:'passingYards',        label:'Passing Yards',       fmt:_int, order:'desc', careerOk:true},
      {key:'passingTouchdowns',   label:'Passing TDs',         fmt:_int, order:'desc', careerOk:true},
      {key:'completions',         label:'Completions',         fmt:_int, order:'desc', careerOk:true},
      {key:'passingAttempts',     label:'Pass Attempts',       fmt:_int, order:'desc', careerOk:true},
      {key:'interceptions',       label:'Interceptions Thrown',fmt:_int, order:'desc', careerOk:true},
      {key:'sacks',               label:'Times Sacked',        fmt:_int, order:'desc', careerOk:true},
      {key:'sackYardsLost',       label:'Sack Yards Lost',     fmt:_int, order:'desc', careerOk:true},
      {key:'longPassing',         label:'Longest Pass',        fmt:_int, order:'desc', careerOk:false},
      {key:'QBRating',            label:'Passer Rating',       fmt:_d1,  order:'desc', careerOk:false},
      {key:'QBR',                 label:'ESPN QBR',            fmt:_d1,  order:'desc', careerOk:false},
      {key:'completionPct',       label:'Completion %',        fmt:_d1,  order:'desc', careerOk:false},
      {key:'yardsPerPassAttempt', label:'Yards / Attempt',     fmt:_d1,  order:'desc', careerOk:false},
      {key:'passingYardsPerGame', label:'Pass Yards / Game',   fmt:_d1,  order:'desc', careerOk:false},
    ]
  },
  rushing: {
    label:'Rushing', category:'rushing',
    positions:[{val:'ALL',label:'All Rushers'},{val:'RB',label:'Running Back (RB)'},{val:'QB',label:'Quarterback (QB)'},{val:'WR',label:'Wide Receiver (WR)'}],
    stats:[
      {key:'rushingYards',        label:'Rushing Yards',       fmt:_int, order:'desc', careerOk:true},
      {key:'rushingTouchdowns',   label:'Rushing TDs',         fmt:_int, order:'desc', careerOk:true},
      {key:'rushingAttempts',     label:'Rushing Attempts',    fmt:_int, order:'desc', careerOk:true},
      {key:'rushingFirstDowns',   label:'Rushing First Downs', fmt:_int, order:'desc', careerOk:true},
      {key:'rushingBigPlays',     label:'Rushes 20+ yds',      fmt:_int, order:'desc', careerOk:true},
      {key:'rushingFumbles',      label:'Rushing Fumbles',     fmt:_int, order:'desc', careerOk:true},
      {key:'longRushing',         label:'Longest Rush',        fmt:_int, order:'desc', careerOk:false},
      {key:'yardsPerRushAttempt', label:'Yards / Carry',       fmt:_d1,  order:'desc', careerOk:false},
      {key:'rushingYardsPerGame', label:'Rush Yards / Game',   fmt:_d1,  order:'desc', careerOk:false},
    ]
  },
  receiving: {
    label:'Receiving', category:'receiving',
    positions:[{val:'ALL',label:'All Receivers'},{val:'WR',label:'Wide Receiver (WR)'},{val:'TE',label:'Tight End (TE)'},{val:'RB',label:'Running Back (RB)'}],
    stats:[
      {key:'receptions',            label:'Receptions',          fmt:_int, order:'desc', careerOk:true},
      {key:'receivingYards',        label:'Receiving Yards',     fmt:_int, order:'desc', careerOk:true},
      {key:'receivingTouchdowns',   label:'Receiving TDs',       fmt:_int, order:'desc', careerOk:true},
      {key:'receivingTargets',      label:'Targets',             fmt:_int, order:'desc', careerOk:true},
      {key:'receivingFirstDowns',   label:'Receiving First Downs',fmt:_int,order:'desc', careerOk:true},
      {key:'receivingYardsAfterCatch',label:'Yards After Catch', fmt:_int, order:'desc', careerOk:true},
      {key:'receivingBigPlays',     label:'Catches 20+ yds',     fmt:_int, order:'desc', careerOk:true},
      {key:'longReception',         label:'Longest Reception',   fmt:_int, order:'desc', careerOk:false},
      {key:'yardsPerReception',     label:'Yards / Reception',   fmt:_d1,  order:'desc', careerOk:false},
      {key:'receivingYardsPerGame', label:'Rec Yards / Game',    fmt:_d1,  order:'desc', careerOk:false},
    ]
  },
  defense: {
    label:'Defense', category:'defensive',
    positions:[{val:'ALL',label:'All Defenders'},{val:'DE',label:'Defensive End (DE)'},{val:'DT',label:'Defensive Tackle (DT)'},{val:'LB',label:'Linebacker (LB)'},{val:'CB',label:'Cornerback (CB)'},{val:'S',label:'Safety (S)'}],
    stats:[
      {key:'totalTackles',          label:'Total Tackles',      fmt:_int, order:'desc', careerOk:true},
      {key:'soloTackles',           label:'Solo Tackles',       fmt:_int, order:'desc', careerOk:true},
      {key:'assistTackles',         label:'Assisted Tackles',   fmt:_int, order:'desc', careerOk:true},
      {key:'sacks',                 label:'Sacks',              fmt:_d1,  order:'desc', careerOk:true},
      {key:'sackYards',             label:'Sack Yards',         fmt:_int, order:'desc', careerOk:true},
      {key:'tacklesForLoss',        label:'Tackles For Loss',   fmt:_int, order:'desc', careerOk:true},
      {key:'passesDefended',        label:'Passes Defended',    fmt:_int, order:'desc', careerOk:true},
      {key:'interceptions',         label:'Interceptions',      fmt:_int, order:'desc', careerOk:true, cat:'defensiveinterceptions'},
      {key:'interceptionYards',     label:'Interception Yards', fmt:_int, order:'desc', careerOk:true, cat:'defensiveinterceptions'},
      {key:'interceptionTouchdowns',label:'Pick Sixes',         fmt:_int, order:'desc', careerOk:true, cat:'defensiveinterceptions'},
    ]
  },
  scoring: {
    label:'Scoring', category:'scoring',
    positions:[{val:'ALL',label:'All Players'}],
    stats:[
      {key:'totalPoints',        label:'Total Points',       fmt:_int, order:'desc', careerOk:true},
      {key:'totalTouchdowns',    label:'Total Touchdowns',   fmt:_int, order:'desc', careerOk:true},
      {key:'rushingTouchdowns',  label:'Rushing TDs',        fmt:_int, order:'desc', careerOk:true},
      {key:'receivingTouchdowns',label:'Receiving TDs',      fmt:_int, order:'desc', careerOk:true},
      {key:'returnTouchdowns',   label:'Return TDs',         fmt:_int, order:'desc', careerOk:true},
      {key:'fieldGoals',         label:'Field Goals Made',   fmt:_int, order:'desc', careerOk:true},
      {key:'totalPointsPerGame', label:'Points / Game',      fmt:_d1,  order:'desc', careerOk:false},
    ]
  },
  kicking: {
    label:'Kicking', category:'kicking',
    positions:[{val:'ALL',label:'All Kickers'},{val:'K',label:'Kicker (K)'}],
    stats:[
      {key:'fieldGoalsMade',    label:'Field Goals Made',    fmt:_int, order:'desc', careerOk:true},
      {key:'fieldGoalAttempts', label:'FG Attempts',         fmt:_int, order:'desc', careerOk:true},
      {key:'fieldGoalsMade50',  label:'FGs Made 50+ yds',    fmt:_int, order:'desc', careerOk:true},
      {key:'fieldGoalsMade40_49',label:'FGs Made 40-49 yds', fmt:_int, order:'desc', careerOk:true},
      {key:'extraPointsMade',   label:'Extra Points Made',   fmt:_int, order:'desc', careerOk:true},
      {key:'extraPointAttempts',label:'Extra Point Attempts',fmt:_int, order:'desc', careerOk:true},
      {key:'longFieldGoalMade', label:'Longest Field Goal',  fmt:_int, order:'desc', careerOk:false},
      {key:'fieldGoalPct',      label:'Field Goal %',        fmt:_d1,  order:'desc', careerOk:false},
    ]
  },
  returning: {
    label:'Returning', category:'returning',
    positions:[{val:'ALL',label:'All Returners'},{val:'WR',label:'Wide Receiver (WR)'},{val:'RB',label:'Running Back (RB)'},{val:'CB',label:'Cornerback (CB)'}],
    stats:[
      {key:'kickReturnYards',      label:'Kick Return Yards',   fmt:_int, order:'desc', careerOk:true},
      {key:'kickReturns',          label:'Kick Returns',        fmt:_int, order:'desc', careerOk:true},
      {key:'kickReturnTouchdowns', label:'Kick Return TDs',     fmt:_int, order:'desc', careerOk:true},
      {key:'puntReturnYards',      label:'Punt Return Yards',   fmt:_int, order:'desc', careerOk:true},
      {key:'puntReturns',          label:'Punt Returns',        fmt:_int, order:'desc', careerOk:true},
      {key:'puntReturnTouchdowns', label:'Punt Return TDs',     fmt:_int, order:'desc', careerOk:true},
      {key:'longKickReturn',       label:'Longest Kick Return', fmt:_int, order:'desc', careerOk:false},
      {key:'longPuntReturn',       label:'Longest Punt Return', fmt:_int, order:'desc', careerOk:false},
      {key:'yardsPerKickReturn',   label:'Yards / Kick Return', fmt:_d1,  order:'desc', careerOk:false},
    ]
  },
  punting: {
    label:'Punting', category:'punting',
    positions:[{val:'ALL',label:'All Punters'},{val:'P',label:'Punter (P)'}],
    stats:[
      {key:'punts',             label:'Punts',              fmt:_int, order:'desc', careerOk:true},
      {key:'puntYards',         label:'Punt Yards',         fmt:_int, order:'desc', careerOk:true},
      {key:'puntsInside20',     label:'Punts Inside 20',    fmt:_int, order:'desc', careerOk:true},
      {key:'touchbacks',        label:'Touchbacks',         fmt:_int, order:'desc', careerOk:true},
      {key:'longPunt',          label:'Longest Punt',       fmt:_int, order:'desc', careerOk:false},
      {key:'grossAvgPuntYards', label:'Gross Avg / Punt',   fmt:_d1,  order:'desc', careerOk:false},
      {key:'netAvgPuntYards',   label:'Net Avg / Punt',     fmt:_d1,  order:'desc', careerOk:false},
    ]
  },
};

// ── name matching (shared with the guess autocomplete) ──────────────────────────
function norm(s){
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9\s]/g,'').trim();
}
function isMatch(guess, playerName){
  const g=norm(guess), full=norm(playerName);
  if(full===g) return true;
  const tokens=full.split(/\s+/), last=tokens[tokens.length-1];
  if(last.length>=4 && last===g) return true;
  const noSfx=tokens.filter(t=>!['jr','sr','ii','iii','iv','v'].includes(t));
  if(noSfx.join(' ')===g) return true;
  if(noSfx[noSfx.length-1]?.length>=4 && noSfx[noSfx.length-1]===g) return true;
  return false;
}

// Dense ranks: ties share a rank, next distinct value increments by 1 (not skipped).
function assignDenseRanks(items, rawKey){
  let rank=0, lastVal=null;
  return items.map(item=>{
    const val=item[rawKey];
    if(lastVal===null || val!==lastVal){ rank++; lastVal=val; }
    return {...item, rank};
  });
}

function headshotFor(athlete){
  if(athlete.headshot && athlete.headshot.href) return athlete.headshot.href;
  if(athlete.id) return 'https://a.espncdn.com/i/headshots/nfl/players/full/' + athlete.id + '.png';
  return '';
}

function statValue(athlete, cat, key, namesByCat){
  const names=namesByCat[cat]; if(!names) return NaN;
  const idx=names.indexOf(key); if(idx<0) return NaN;
  const c=(athlete.categories||[]).find(x=>x.name===cat);
  if(!c || !c.values) return NaN;
  return parseFloat(c.values[idx]);
}

// ── bundled all-time (pre-1993) leaders, from alltime.json ──────────────────────
let _alltime=null, _alltimePromise=null;
function loadAllTime(){
  if(_alltime) return Promise.resolve(_alltime);
  if(!_alltimePromise) _alltimePromise=fetch('alltime.json').then(r=>r.json()).then(d=>{_alltime=d;return d;}).catch(()=>({}));
  return _alltimePromise;
}
function allTimeStatsFor(group){ return (_alltime && _alltime[group]) ? Object.keys(_alltime[group]) : []; }

async function fetchEspnPage(cat, key, order, season, page){
  const params = new URLSearchParams({
    region:'us', lang:'en', contentorigin:'espn', limit:'50',
    sort: cat + '.' + key + ':' + order,
    season: String(season), seasontype:'2', page:String(page)
  });
  const r = await fetch(ESPN + '?' + params.toString());
  if(!r.ok) throw new Error('ESPN API error ' + r.status);
  return r.json();
}

async function fetchOneSeasonRaw(cat, key, order, season, maxPages){
  const first = await fetchEspnPage(cat, key, order, season, 1);
  const namesByCat = {};
  (first.categories||[]).forEach(c=>{ namesByCat[c.name]=c.names; });
  let athletes = first.athletes || [];
  const pages = Math.min((first.pagination && first.pagination.pages) || 1, maxPages);
  for(let p=2; p<=pages; p++){
    const d = await fetchEspnPage(cat, key, order, season, p).catch(()=>null);
    if(d && d.athletes) athletes = athletes.concat(d.athletes);
  }
  return { athletes, namesByCat };
}

// group: key into NFL_GROUPS · statDef: one of that group's stats
// season: "2024" | "career" | "range:a-b" | "decade:d" · position: 'ALL' or an abbreviation
async function fetchPlayers(group, statDef, season, position){
  const G = NFL_GROUPS[group];
  const cat = statDef.cat || G.category;
  const order = statDef.order || 'desc';
  const asc = order === 'asc';

  // True all-time (includes pre-1993) from the bundled dataset.
  if(season==='alltime'){
    const data = await loadAllTime();
    const list = data[group] && data[group][statDef.key];
    if(!list || !list.length) throw new Error('No all-time list for this stat — choose a specific season instead.');
    const mapped = list.map(p=>({
      rawVal:p.raw, name:p.name, team:'', position:'', photo:p.photo||'',
      value:String(statDef.fmt(p.raw)), nameLower:p.name.toLowerCase()
    }));
    mapped.sort((a,b)=> asc ? a.rawVal-b.rawVal : b.rawVal-a.rawVal);
    return assignDenseRanks(mapped, 'rawVal');
  }

  let years = [];
  if(season==='career'){
    for(let y=CAREER_START; y<=CAREER_END; y++) years.push(y);
  } else if(String(season).startsWith('range:')){
    const [,range]=season.split(':'); const [s,e]=range.split('-').map(Number);
    for(let y=s;y<=e;y++) years.push(y);
  } else if(String(season).startsWith('decade:')){
    const s=Number(season.split(':')[1]); const e=s+9;
    for(let y=s;y<=e;y++) years.push(y);
  } else {
    years=[Number(season)];
  }

  const posOk = a => position==='ALL' || (a.athlete.position && a.athlete.position.abbreviation===position);

  if(years.length===1){
    const {athletes, namesByCat} = await fetchOneSeasonRaw(cat, statDef.key, order, years[0], 6);
    const mapped=[];
    for(const a of athletes){
      if(!posOk(a)) continue;
      const raw=statValue(a, cat, statDef.key, namesByCat);
      if(isNaN(raw)) continue;
      mapped.push({
        rawVal: raw,
        name: a.athlete.displayName || '?',
        team: (a.athlete.teamShortName || (a.athlete.team && a.athlete.team.abbreviation) || ''),
        position: (a.athlete.position && a.athlete.position.abbreviation) || '',
        photo: headshotFor(a.athlete),
        value: String(statDef.fmt(raw)),
        nameLower: (a.athlete.displayName||'').toLowerCase()
      });
    }
    if(!mapped.length) throw new Error('No data for that season / category. Try another year.');
    mapped.sort((x,y)=> asc ? x.rawVal-y.rawVal : y.rawVal-x.rawVal);
    return assignDenseRanks(mapped.slice(0,300), 'rawVal');
  }

  // multi-year (career / range / decade): sum counting totals per athlete id.
  // Cap pages per season so a 25-season career stays a reasonable number of requests.
  const perYearPages = 4;
  const totals={};
  const perSeason = await Promise.all(years.map(y =>
    fetchOneSeasonRaw(cat, statDef.key, order, y, perYearPages).catch(()=>({athletes:[],namesByCat:{}}))));
  for(const {athletes, namesByCat} of perSeason){
    for(const a of athletes){
      if(!posOk(a)) continue;
      const raw=statValue(a, cat, statDef.key, namesByCat);
      if(isNaN(raw)) continue;
      const id=a.athlete.id;
      if(!totals[id]) totals[id]={total:0, name:a.athlete.displayName||'?', team:(a.athlete.teamShortName||''), position:(a.athlete.position&&a.athlete.position.abbreviation)||'', photo:headshotFor(a.athlete)};
      totals[id].total += raw;
    }
  }
  const arr=Object.values(totals);
  if(!arr.length) throw new Error('No data for that range.');
  arr.sort((x,y)=> asc ? x.total-y.total : y.total-x.total);
  const mapped=arr.slice(0,300).map(p=>({
    rawVal:p.total, name:p.name, team:p.team, position:p.position, photo:p.photo,
    value:String(statDef.fmt(p.total)), nameLower:p.name.toLowerCase()
  }));
  return assignDenseRanks(mapped, 'rawVal');
}
