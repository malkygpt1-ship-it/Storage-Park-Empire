'use client';

import { useMemo, useState } from 'react';

type Market = {
  id: string;
  city: string;
  region: string;
  x: number;
  y: number;
  land: number;
  demand: number;
  planning: number;
  competition: number;
  rent: number;
};

type Deal = {
  id: number;
  kind: 'LAND' | 'PARK';
  title: string;
  city: string;
  price: number;
  units: number;
  occupancy: number;
  monthlyRevenue: number;
  note: string;
};

const markets: Market[] = [
  { id: 'glasgow', city: 'Glasgow', region: 'Scotland', x: 37, y: 16, land: 420000, demand: 73, planning: 72, competition: 53, rent: 132 },
  { id: 'newcastle', city: 'Newcastle', region: 'North East', x: 58, y: 25, land: 375000, demand: 67, planning: 77, competition: 44, rent: 126 },
  { id: 'leeds', city: 'Leeds', region: 'Yorkshire', x: 53, y: 39, land: 510000, demand: 82, planning: 66, competition: 68, rent: 144 },
  { id: 'manchester', city: 'Manchester', region: 'North West', x: 40, y: 43, land: 585000, demand: 88, planning: 64, competition: 72, rent: 149 },
  { id: 'liverpool', city: 'Liverpool', region: 'North West', x: 31, y: 45, land: 465000, demand: 78, planning: 70, competition: 56, rent: 137 },
  { id: 'birmingham', city: 'Birmingham', region: 'West Midlands', x: 45, y: 59, land: 710000, demand: 86, planning: 59, competition: 74, rent: 158 },
  { id: 'bristol', city: 'Bristol', region: 'South West', x: 34, y: 73, land: 790000, demand: 81, planning: 55, competition: 69, rent: 165 },
  { id: 'london', city: 'London East', region: 'Greater London', x: 68, y: 74, land: 2250000, demand: 98, planning: 41, competition: 93, rent: 238 },
];

const starterDeals: Deal[] = [
  { id: 1, kind: 'LAND', title: 'M62 Trade Yard', city: 'Manchester', price: 285000, units: 38, occupancy: 0, monthlyRevenue: 0, note: 'Leasehold-ready yard · 0.46 acre · strong trade demand' },
  { id: 2, kind: 'PARK', title: 'Ribble Storage', city: 'Preston', price: 312000, units: 31, occupancy: 71, monthlyRevenue: 3570, note: 'Owner retiring · rents believed 9% below local market' },
  { id: 3, kind: 'LAND', title: 'Tyne Industrial Plot', city: 'Newcastle', price: 224000, units: 34, occupancy: 0, monthlyRevenue: 0, note: 'Freehold · 0.39 acre · planning risk: low' },
  { id: 4, kind: 'PARK', title: 'Black Country Lock-Up', city: 'Birmingham', price: 418000, units: 42, occupancy: 83, monthlyRevenue: 5480, note: 'Established park · basic security · immediate cashflow' },
];

const money = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

export default function Game() {
  const [cash, setCash] = useState(500000);
  const [debt, setDebt] = useState(0);
  const [month, setMonth] = useState(1);
  const [selectedMarket, setSelectedMarket] = useState(markets[3]);
  const [owned, setOwned] = useState<Deal[]>([]);
  const [deals, setDeals] = useState(starterDeals);
  const [feed, setFeed] = useState<string[]>(['Investor funds cleared. Your first acquisition hunt begins.']);

  const monthlyRevenue = owned.reduce((sum, d) => sum + d.monthlyRevenue, 0);
  const monthlyCosts = owned.reduce((sum, d) => sum + Math.round(d.units * 24 + d.monthlyRevenue * 0.17), 0) + Math.round(debt * 0.0065);
  const cashflow = monthlyRevenue - monthlyCosts;
  const portfolioValue = owned.reduce((sum, d) => sum + Math.round(d.price * (d.kind === 'PARK' ? 1.04 : 1.0)), 0);

  const marketScore = useMemo(() => Math.round((selectedMarket.demand * 0.45 + selectedMarket.planning * 0.25 + (100 - selectedMarket.competition) * 0.15 + Math.min(100, selectedMarket.rent / 2.2) * 0.15)), [selectedMarket]);

  function buyDeal(deal: Deal) {
    if (cash < deal.price) {
      const gap = deal.price - cash;
      const facility = Math.ceil(gap / 10000) * 10000;
      setDebt((d) => d + facility);
      setCash((c) => c + facility - deal.price);
      setFeed((f) => [`Acquired ${deal.title} using ${money(facility)} of acquisition debt.`, ...f].slice(0, 5));
    } else {
      setCash((c) => c - deal.price);
      setFeed((f) => [`Acquired ${deal.title} for ${money(deal.price)}.`, ...f].slice(0, 5));
    }
    const activated = deal.kind === 'LAND' ? { ...deal, occupancy: 32, monthlyRevenue: Math.round(deal.units * 0.32 * 139) } : deal;
    setOwned((o) => [...o, activated]);
    setDeals((d) => d.filter((x) => x.id !== deal.id));
  }

  function advanceMonth() {
    const growth = owned.map((d) => {
      const nextOcc = Math.min(94, d.occupancy + (d.kind === 'LAND' ? 6 : 2));
      const unitRate = d.monthlyRevenue && d.occupancy ? d.monthlyRevenue / (d.units * (d.occupancy / 100)) : 139;
      return { ...d, occupancy: nextOcc, monthlyRevenue: Math.round(d.units * (nextOcc / 100) * unitRate) };
    });
    const nextRevenue = growth.reduce((s, d) => s + d.monthlyRevenue, 0);
    const nextCosts = growth.reduce((s, d) => s + Math.round(d.units * 24 + d.monthlyRevenue * 0.17), 0) + Math.round(debt * 0.0065);
    setOwned(growth);
    setCash((c) => c + nextRevenue - nextCosts);
    setMonth((m) => m + 1);
    setFeed((f) => [`Month ${month} closed: ${money(nextRevenue - nextCosts)} net cashflow.`, ...f].slice(0, 5));
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brandMark">SP</span><div><strong>STORAGE PARK EMPIRE</strong><small>UK PROPERTY TYCOON</small></div></div>
        <div className="stats">
          <Stat label="Cash" value={money(cash)} />
          <Stat label="Portfolio" value={money(portfolioValue)} />
          <Stat label="Debt" value={money(debt)} />
          <Stat label="Monthly CF" value={money(cashflow)} positive={cashflow >= 0} />
        </div>
        <button className="monthButton" onClick={advanceMonth}>Advance month <span>→</span></button>
      </header>

      <div className="gameGrid">
        <aside className="sidebar">
          <nav>
            {['Map', 'Portfolio', 'Deal Room', 'Developments', 'Finance', 'Staff'].map((item, i) => <button className={i === 0 ? 'active' : ''} key={item}><span>{['⌖','▦','◇','▤','£','◎'][i]}</span>{item}</button>)}
          </nav>
          <div className="stageCard"><small>CAMPAIGN</small><strong>Stage 1 · First Yard</strong><div className="progress"><i style={{ width: `${Math.min(100, owned.length * 35)}%` }} /></div><p>{owned.length}/3 parks acquired</p></div>
          <div className="monthBadge">YEAR 1 · MONTH {month}</div>
        </aside>

        <section className="mapPanel">
          <div className="sectionHead"><div><small>MARKET INTELLIGENCE</small><h1>United Kingdom</h1></div><div className="legend"><span><i className="dot hot"/>High demand</span><span><i className="dot warm"/>Opportunity</span></div></div>
          <div className="mapWrap">
            <div className="ukShape" />
            {markets.map((m) => <button key={m.id} aria-label={m.city} onClick={() => setSelectedMarket(m)} className={`marketPin ${selectedMarket.id === m.id ? 'selected' : ''}`} style={{ left: `${m.x}%`, top: `${m.y}%` }}><span>{m.demand}</span><em>{m.city}</em></button>)}
            <div className="mapTexture" />
          </div>
          <div className="marketStrip">
            <div><small>SELECTED MARKET</small><h2>{selectedMarket.city}</h2><p>{selectedMarket.region}</p></div>
            <Metric label="Demand" value={selectedMarket.demand} />
            <Metric label="Planning" value={selectedMarket.planning} />
            <Metric label="Competition" value={100 - selectedMarket.competition} suffix=" gap" />
            <div className="marketMoney"><small>Typical land / acre</small><strong>{money(selectedMarket.land)}</strong><small>20ft target rent</small><strong>{money(selectedMarket.rent)}/mo</strong></div>
            <div className="score"><small>Investment score</small><strong>{marketScore}</strong><span>/100</span></div>
          </div>
        </section>

        <aside className="rightRail">
          <div className="railHead"><div><small>LIVE OPPORTUNITIES</small><h2>Deal Room</h2></div><span>{deals.length} LIVE</span></div>
          <div className="dealList">
            {deals.length === 0 && <div className="empty">No live deals. Advance the game to generate more opportunities.</div>}
            {deals.map((deal) => <article className="deal" key={deal.id}>
              <div className="dealTop"><span className={deal.kind === 'PARK' ? 'tag park' : 'tag'}>{deal.kind === 'PARK' ? 'OPERATING PARK' : 'LAND'}</span><strong>{money(deal.price)}</strong></div>
              <h3>{deal.title}</h3><p className="location">{deal.city}</p><p className="note">{deal.note}</p>
              <div className="dealNumbers"><span><small>CAPACITY</small><b>{deal.units} units</b></span><span><small>OCCUPANCY</small><b>{deal.occupancy}%</b></span><span><small>REV / MO</small><b>{money(deal.monthlyRevenue)}</b></span></div>
              <button onClick={() => buyDeal(deal)}>Acquire deal <span>→</span></button>
            </article>)}
          </div>
        </aside>
      </div>

      <footer className="bottomBar">
        <div className="feed"><span className="pulse"/><div><small>LATEST EVENT</small><strong>{feed[0]}</strong></div></div>
        <div className="ownedSummary"><span>{owned.length} parks</span><span>{owned.reduce((s, d) => s + d.units, 0)} units</span><span>{owned.length ? Math.round(owned.reduce((s,d)=>s+d.occupancy,0)/owned.length) : 0}% avg occupancy</span></div>
      </footer>
    </main>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return <div className="stat"><small>{label}</small><strong className={positive ? 'positive' : ''}>{value}</strong></div>;
}

function Metric({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return <div className="metric"><div><small>{label}</small><strong>{value}{suffix}</strong></div><div className="meter"><i style={{ width: `${value}%` }} /></div></div>;
}
