// Created by Sheriff_U3 for the Coding Challenge
// Copyright (C) 2025  Sheriff_U3
/*
    This code is free code: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.
    This code is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
let Player=[]//returns array of playerIds
const spawn=[]
const GB='Grass Block'
const BW='Blue Wool'
const RW='Red Wool'
const D='Dirt'
const RD='Rocky Dirt'
const MD='Messy Dirt'
let Game='waiting'//values are waiting, countdown, started
let Tick=0
let Police=[]
let Wanted=[]
AssignTeams=()=>{
 Police.length=0
 Wanted.length=0
 if(Player.length>=6&&Player.length<8){
  Police.push(...Player.slice(3))
  Wanted.push(Player[0],Player[1],Player[2])
 }
 else if(Player.length>=8&&Player.length<12){
  Police.push(...Player.slice(4))
  Wanted.push(Player[0],Player[1],Player[2],Player[3])
 }
 else if(Player.length>=12&&Player.length<20){
  Police.push(...Player.slice(6))
  Wanted.push(Player[0],Player[1],Player[2],Player[3],Player[4],Player[5])
 }
 else if(Player.length>=20){
  Police.push(...Player.slice(11))
  Wanted.push(Player[0],Player[1],Player[2],Player[3],Player[4],Player[5],Player[6],
   Player[7],Player[8],Player[9],Player[10])
 }
}
onPlayerJoin=(p)=>{
 const wins=api.getInventoryItemAmount(p,GB)
 const pwins=api.getInventoryItemAmount(p,BW)
 const wwins=api.getInventoryItemAmount(p,RW)
 const losses=api.getInventoryItemAmount(p,D)
 const plosses=api.getInventoryItemAmount(p,RD)
 const wlosses=api.getInventoryItemAmount(p,MD)
 Player.push(p)
 api.sendFlyingMiddleMessage(p,
  ["Select your load outs! The options are on the walls."],100)
 api.setClientOption(p, "RightInfoText", [
 {str: "Your stats:"},
 "\n",
 {str:'Total rounds won: '+wins,style:{color:"lime"}},
 "\n",
 {str:'Wins as Police: '+pwins,style:{color:'lime'}},
 "\n",
 {str:'Wins as Wanted: '+wwins,style:{color:'lime'}},
 "\n",
 {str:'Total rounds loss: '+losses,style:{color:'red'}},
 "\n",
 {str:'Losses as Police: '+plosses,style:{color:'red'}},
 "\n",
 {str:'Losses as Wanted: '+wlosses,style:{color:'red'}}
 ])
 api.setMaxPlayers(30, 40)//softMaxPlayers is 30, maxPlayers is 40
  api.setClientOptions(p,[{'canChange':false,'canCraft':false,
   'canPickUpItems':false,'canUseZoomKey':false,
  'canSeeNametagsThroughWalls':false,'canPickBlocks':false,
  'useFullInventory':false,'showKillfeed':false,'invincible':true,
  'healthRegenInterval':600000/*player regains health every 10 mins*/,
  'healthRegenStartAfter':1200000/*player regains health after 20 mins*/,
  'secsToRespawn':0,'usePlayAgainButton':true,'autoRespawn':false,
  'respawnButtonText':'Spectate','dealingDamageHeadMultiplier':3,
  'dealingDamageLegMultiplier':0.5,'dealingDamageDefaultMultiplier':1,
  'fallDamage':true,'airMomentumConservation':true,'maxAuraLevel':0,
  'creative':false,'strictFluidBuckets':false}])
 if(Player.length>5&&Game=='waiting'){
  api.broadcastMessage('Game will start in 20 secs')
  api.sendMessage(p,"Prepare for game start!")
  Game='countdown'
 }
 else if(Player.length<5&&Game!='started'){
  api.broadcastMessage('Waiting for '+5-Player.length+' players')
  api.sendMessage(p,'Welcome, get ready for the round to start!')
  Game='waiting'
 }
 else if(Game=='started'){
  api.sendMessage(p,'Game has already started, prepare for the next round.')
 }
}
// This handles the game start functions
tick=()=>{
Tick++
 if(Game=='countdown'&&Tick==400){//this activates when the game starts
  AssignTeams()
  Tick=0
  Game='started'
  api.broadcastMessage('Game Starting',{color:'lime'})
  for(let pId of Police){
   api.setTargetPlayerSettingForEveryone(pId,'colorInLobbyLeaderboard','blue')
   api.setTargetPlayerSettingForEveryone(pId,'canSee',false)
   api.sendMessage(pId,'You are Police!',
   {color:'yellow'})
  }
  for(let wId of Wanted){
   api.setTargetPlayerSettingForEveryone(wId,'colorInLobbyLeaderboard','red')
   api.setTargetPlayerSettingForEveryone(wId,'canSee',false)
   api.sendMessage(wId,
    'You are wanted! Beware: the police are hot on your trial!',{color:'red'})
   api.setPosition(wId,[])
  }
 }
 else if(Game=='started'&&Tick==400){// This is when the police are released
  for(let pId of Police){
   api.sendMessage(pId,
    '[Dispatch]: Lethal force authorized - their armed and very dangerous.',
    {color:'yellow'})
   api.sendMessage(pId,'Search the building for any wanted criminals!')
   api.setTargetedPlayerSettingForEveryone(pId,'canSee',true,false)
  }
  for(let wId of Wanted){
   api.sendMessage(wId,"The Police are here! Hide or fight...")
   api.setTargetedPlayerSettingForEveryone(wId,'canSee',true,false)
  }
 }
}
onAttemptKillPlayer=(p, aL) => {
 const removeOfficer=Police.indexOf(p)
 const removeWanted=Wanted.indexOf(p)
 if(Police.length<2 || Wanted.length<2){
  if (Wanted.includes(p)){
   api.broadcastMessage("Police win! Wanted didn't get away.",{color:'lime'})
   for(const s of Police){
    if(api.hasItem(s,GB)){api.giveItem(s,GB,1)}
    else if(!api.hasItem(s,GB)){api.setItemSlot(s,40,GB,1)}
    if(api.hasItem(s,RW)){api.giveItem(s,RW,1)}
    else if(!api.hasItem(s,RW)){api.setItemSlot(s,44,RW,1)}
   }
   if(api.hasItem(p,D)){api.giveItem(p,D,1)}
   else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
   if(api.hasItem(p,MD)){api.giveItem(p,MD,1)}
   else if(!api.hasItem(p,MD)){api.setItemSlot(p,45,MD,1)}
   Police.length=0
   Wanted.length=0
   Game='waiting'
   for(const id of Player){
    const wins=api.getInventoryItemAmount(p,GB)
    const pwins=api.getInventoryItemAmount(p,BW)
    const wwins=api.getInventoryItemAmount(p,RW)
    const losses=api.getInventoryItemAmount(p,D)
    const plosses=api.getInventoryItemAmount(p,RD)
    const wlosses=api.getInventoryItemAmount(p,MD)
    api.setClientOption(p, "RightInfoText", [
     {str: "Your stats:"},
     "\n",
     {str:'Total rounds won: '+wins,style:{color:"lime"}},
     "\n",
     {str:'Wins as Police: '+pwins,style:{color:'lime'}},
     "\n",
     {str:'Wins as Wanted: '+wwins,style:{color:'lime'}},
     "\n",
     {str:'Total rounds loss: '+losses,style:{color:'red'}},
     "\n",
     {str:'Losses as Police: '+plosses,style:{color:'red'}},
     "\n",
     {str:'Losses as Wanted: '+wlosses,style:{color:'red'}}
    ])
    api.setPosition(id,spawn)
   }
  }
  else if(Police.includes(p)){
   api.broadcastMessage("Wanted win! Police didn't stop them.",{color:'lime'})
   if(api.hasItem(p,D)){api.giveItem(p,D,1)}
   else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
   if(api.hasItem(p,RD)){api.giveItem(p,RD,1)}
   else if(!api.hasItem(p,RD)){api.setItemSlot(p,44,RD,1)}
   for (const w of Wanted){
    if(api.hasItem(w,GB)){api.giveItem(w,GB,1)}
    else if(!api.hasItem(w,GB)){api.setItemSlot(w,43,GB,1)}
    if(api.hasItem(w,RW)){api.giveItem(w,RW,1)}
    else if(!api.hasItem(w,RW)){api.setItemSlot(w,45,RW,1)}
   }
   Police.length=0
   Wanted.length=0
   Game='waiting'
   for(const id of Player){
    const wins=api.getInventoryItemAmount(p,GB)
    const pwins=api.getInventoryItemAmount(p,BW)
    const wwins=api.getInventoryItemAmount(p,RW)
    const losses=api.getInventoryItemAmount(p,D)
    const plosses=api.getInventoryItemAmount(p,RD)
    const wlosses=api.getInventoryItemAmount(p,MD)
    api.setPosition(id,spawn)
    api.setClientOption(p, "RightInfoText", [
     {str: "Your stats:"},
     "\n",
     {str:'Total rounds won: '+wins,style:{color:"lime"}},
     "\n",
     {str:'Wins as Police: '+pwins,style:{color:'lime'}},
     "\n",
     {str:'Wins as Wanted: '+wwins,style:{color:'lime'}},
     "\n",
     {str:'Total rounds loss: '+losses,style:{color:'red'}},
     "\n",
     {str:'Losses as Police: '+plosses,style:{color:'red'}},
     "\n",
     {str:'Losses as Wanted: '+wlosses,style:{color:'red'}}
    ])
   }
  }
 }
 else if(removeOfficer>-1){
  if(api.hasItem(p,D)){api.giveItem(p,D,1)}
  else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
  if(api.hasItem(p,RD)){api.giveItem(p,RD,1)}
  else if(!api.hasItem(p,RD)){api.setItemSlot(p,44,RD,1)}
  Police.splice(removeOfficer,1)
 }
 else if(removeWanted>-1){
  if(api.hasItem(p,D)){api.giveItem(p,D,1)}
  else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
  if(api.hasItem(p,MD)){api.giveItem(p,MD,1)}
  else if(!api.hasItem(p,MD)){api.setItemSlot(p,45,MD,1)}
  Wanted.splice(removeWanted,1)
 }
}
// Below code prevents shooting of your own team and decreases damage when
// wearing Fur chestplate (bulletproof armor)
onPlayerDamagingOtherPlayer=(aP,dP,dD,wI)=>{
 const dPH=api.getEntityHealth(dP)
 if(!Police.includes(aP)&&!Wanted.includes(aP)){
  api.setPosition(aP,spawn)
  return 'preventDamage'
 }
 if(!Police.includes(dP)&&!Wanted.includes(dP)){
  api.setPosition(dP,spawn)
  return 'preventDamage'
 }
 else if(Police.includes(aP)&&Police.includes(dP)){return 'preventDamage'}
 else if(Wanted.includes(aP)&&Wanted.includes(dP)){return 'preventDamage'}
 else if(dPH<=50){api.sendMessage(dP,'You are at'+dPH+'!',{color:'red'})}
 else if(api.hasItem(dP,'Fur Chestplate')){return dD/2}
}
// Below code removes a player from arrays when they leave
onPlayerLeave=(p)=>{
 const PlayerLeft=Player.indexOf(p)
 const OfficerLeft=Police.indexOf(p)
 const WantedLeft=Wanted.indexOf(p)
 if(Player.includes(p)){Player.splice(PlayerLeft,1)}
 if(Police.length<2 || Wanted.length<2){
  if (Wanted.includes(p)){
   for(const s of Police){
    if(api.hasItem(s,GB)){api.giveItem(s,GB,1)}
    else if(!api.hasItem(s,GB)){api.setItemSlot(s,40,GB,1)}
    if(api.hasItem(s,RW)){api.giveItem(s,RW,1)}
    else if(!api.hasItem(s,RW)){api.setItemSlot(s,44,RW,1)}
   }
   if(api.hasItem(p,D)){api.giveItem(p,D,1)}
   else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
   if(api.hasItem(p,MD)){api.giveItem(p,MD,1)}
   else if(!api.hasItem(p,MD)){api.setItemSlot(p,45,MD,1)}
   api.broadcastMessage("Police win! Wanted didn't get away.",{color:'lime'})
   Police.length=0
   Wanted.length=0
   Game='waiting'
   for(const id of Player){
    const wins=api.getInventoryItemAmount(p,GB)
    const pwins=api.getInventoryItemAmount(p,BW)
    const wwins=api.getInventoryItemAmount(p,RW)
    const losses=api.getInventoryItemAmount(p,D)
    const plosses=api.getInventoryItemAmount(p,RD)
    const wlosses=api.getInventoryItemAmount(p,MD)
    api.setClientOption(p, "RightInfoText", [
     {str: "Your stats:"},
     "\n",
     {str:'Total rounds won: '+wins,style:{color:"lime"}},
     "\n",
     {str:'Wins as Police: '+pwins,style:{color:'lime'}},
     "\n",
     {str:'Wins as Wanted: '+wwins,style:{color:'lime'}},
     "\n",
     {str:'Total rounds loss: '+losses,style:{color:'red'}},
     "\n",
     {str:'Losses as Police: '+plosses,style:{color:'red'}},
     "\n",
     {str:'Losses as Wanted: '+wlosses,style:{color:'red'}}
    ])
    api.setPosition(id,spawn)
   }
   return
  }
  else if(Police.includes(p)){
   if(api.hasItem(p,D)){api.giveItem(p,D,1)}
   else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
   if(api.hasItem(p,RD)){api.giveItem(p,RD,1)}
   else if(!api.hasItem(p,RD)){api.setItemSlot(p,44,RD,1)}
   for (const w of Wanted){
    if(api.hasItem(w,GB)){api.giveItem(w,GB,1)}
    else if(!api.hasItem(w,GB)){api.setItemSlot(w,43,GB,1)}
    if(api.hasItem(w,MD)){api.giveItem(w,MD,1)}
    else if(!api.hasItem(w,MD)){api.setItemSlot(w,45,MD,1)}
   }
   api.broadcastMessage("Wanted win! Police didn't stop them.",{color:'lime'})
   Police.length=0
   Wanted.length=0
   Game='waiting'
   for(const id of Player){
    const wins=api.getInventoryItemAmount(p,GB)
    const pwins=api.getInventoryItemAmount(p,BW)
    const wwins=api.getInventoryItemAmount(p,RW)
    const losses=api.getInventoryItemAmount(p,D)
    const plosses=api.getInventoryItemAmount(p,RD)
    const wlosses=api.getInventoryItemAmount(p,MD)
    api.setClientOption(p, "RightInfoText", [
     {str: "Your stats:"},
     "\n",
     {str:'Total rounds won: '+wins,style:{color:"lime"}},
     "\n",
     {str:'Wins as Police: '+pwins,style:{color:'lime'}},
     "\n",
     {str:'Wins as Wanted: '+wwins,style:{color:'lime'}},
     "\n",
     {str:'Total rounds loss: '+losses,style:{color:'red'}},
     "\n",
     {str:'Losses as Police: '+plosses,style:{color:'red'}},
     "\n",
     {str:'Losses as Wanted: '+wlosses,style:{color:'red'}}
    ])
    api.setPosition(id,spawn)
   }
   return
  }
 }
 else if(Police.includes(p)){
  Police.splice(OfficerLeft,1)
  if(api.hasItem(p,D)){api.giveItem(p,D,1)}
  else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
  if(api.hasItem(p,RD)){api.giveItem(p,RD,1)}
  else if(!api.hasItem(p,RD)){api.setItemSlot(p,44,RD,1)}
 }
 else if(Wanted.includes(p)){
  Wanted.splice(WantedLeft, 1)
  if(api.hasItem(p,D)){api.giveItem(p,D,1)}
  else if(!api.hasItem(p,D)){api.setItemSlot(p,43,D,1)}
  if(api.hasItem(p,RW)){api.giveItem(p,RW,1)}
  else if(!api.hasItem(p,RW)){api.setItemSlot(p,45,RW,1)}
 }
}
