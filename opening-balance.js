(()=>{'use strict';
const KEY='rayyoka_v2';
try{
  const raw=localStorage.getItem(KEY); if(!raw)return;
  const s=JSON.parse(raw), today=new Date().toISOString().slice(0,10), d=s.dayClose||{};
  const oldDate=String(d.businessDate||d.date||''), closed=!!(d.closedAt||d.closed_at||d.status==='Closed'||d.closed===true);
  const actual=Number(d.actualCash??d.actual_cash??d.cashInHand??d.cash_in_hand??0);
  if(closed && oldDate && oldDate!==today){
    s.dayClose={businessDate:today,openingCash:actual,opening_cash:actual,cashSales:0,digitalSales:0,cardSales:0,creditSales:0,expenses:0,expectedCash:actual,actualCash:null,variance:null,totalSales:0,totalOrders:0,closed:false,openedAt:new Date().toISOString(),source:'previous_day_cash'};
    localStorage.setItem(KEY,JSON.stringify(s));
  }
}catch(e){}
})();