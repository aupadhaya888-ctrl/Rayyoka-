(()=>{'use strict';
const KEY='rayyoka_v2';
try{
  const params=new URLSearchParams(location.search);
  if(params.get('customer')==='1') return;
  const raw=localStorage.getItem(KEY);
  if(!raw)return;
  const s=JSON.parse(raw), today=new Date().toISOString().slice(0,10), d=s.dayClose||{};
  const oldDate=String(d.businessDate||d.date||''), closed=!!(d.closedAt||d.closed_at||d.status==='Closed'||d.closed===true);
  const previousCash=Number(d.actualCash??d.actual_cash??d.cashInHand??d.cash_in_hand??d.openingCash??d.opening_cash??0);
  if(closed && oldDate && oldDate!==today){
    s.dayClose={businessDate:today,openingCash:previousCash,opening_cash:previousCash,cashSales:0,digitalSales:0,cardSales:0,creditSales:0,expenses:0,expectedCash:previousCash,actualCash:null,variance:null,totalSales:0,totalOrders:0,closed:false,openedAt:new Date().toISOString(),source:'previous_day_cash'};
    localStorage.setItem(KEY,JSON.stringify(s));
  }
  const current=Number((s.dayClose||{}).openingCash??(s.dayClose||{}).opening_cash??previousCash??0);
  const entered=window.prompt('RAYYOKA — TODAY\'S OPENING CASH\n\nEnter the cash physically in hand at opening (NPR).\nThis is editable every day.',String(current));
  if(entered!==null && entered.trim()!==''){
    const value=Math.max(0,Number(entered));
    if(Number.isFinite(value)){
      const latest=JSON.parse(localStorage.getItem(KEY)||'{}');
      latest.dayClose={...(latest.dayClose||{}),businessDate:today,openingCash:value,opening_cash:value,cashSales:Number(latest.dayClose?.cashSales||0),digitalSales:Number(latest.dayClose?.digitalSales||0),cardSales:Number(latest.dayClose?.cardSales||0),creditSales:Number(latest.dayClose?.creditSales||0),expenses:Number(latest.dayClose?.expenses||0),closed:false,openedAt:latest.dayClose?.openedAt||new Date().toISOString(),source:'editable_opening_balance'};
      localStorage.setItem(KEY,JSON.stringify(latest));
    }
  }
}catch(e){}
})();