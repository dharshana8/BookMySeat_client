import React from "react";
import "./css/SeatMap.css";

/*
Props:
- layout: "seater" | "sleeper"
- totalSeats: number
- reserved: array of seat numbers
- femaleOnly: array of seats
- selected: array
- onToggle(seat)
*/

export default function SeatMap({ layout="seater", totalSeats=32, reserved=[], femaleOnly=[], selected=[], onToggle }){
  if(layout === "seater"){
    const seats = Array.from({length: totalSeats}, (_,i)=>i+1);
    return (
      <div className="seat-grid seater-grid">
        {seats.map(n=>{
          const isRes = reserved.includes(n);
          const isFemale = femaleOnly.includes(n);
          const isSel = selected.includes(n);
          return (
            <div key={n}
              className={`seat ${isSel? "selected": ""} ${isRes? "reserved": ""} ${isFemale? "female": ""}`}
              onClick={()=> !isRes && onToggle(n)}
              title={isRes? "Reserved": isFemale? "Female-only seat": "Seat "+n}>
              {isRes? "X": n}
            </div>
          )
        })}
      </div>
    )
  }

  // sleeper: left/right columns
  const rows = Math.ceil(totalSeats/2);
  const left = Array.from({length: rows}, (_,i)=> i*2 + 1);
  const right = Array.from({length: rows}, (_,i)=> i*2 + 2);
  return (
    <div className="sleeper-grid">
      {left.map((l, idx) => {
        const r = right[idx];
        const leftRes = reserved.includes(l); const rightRes = reserved.includes(r);
        return (
          <div className="sleeper-row" key={idx}>
            <div className={`seat ${selected.includes(l)?"selected":""} ${leftRes?"reserved":""}`} onClick={()=> !leftRes && onToggle(l)}>{leftRes? "X": l}</div>
            <div className="ladder" />
            <div className={`seat ${selected.includes(r)?"selected":""} ${rightRes?"reserved":""}`} onClick={()=> !rightRes && onToggle(r)}>{rightRes? "X": r}</div>
          </div>
        )
      })}
    </div>
  )
}
