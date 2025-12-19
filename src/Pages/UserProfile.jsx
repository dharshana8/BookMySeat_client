import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBus } from "../context/BusContext";

export default function UserProfile(){
  const { user, updateProfile } = useAuth();
  const { bookings } = useBus();
  const my = bookings.filter(b => b.user?.email === user?.email);
  const [edit, setEdit] = useState({ name:user?.name, email:user?.email, password:"" });

  function save(){ updateProfile({ name: edit.name, email: edit.email, password: edit.password || undefined }) ; alert("Saved") }

  return (
    <div className="container" style={{padding:20}}>
      <div className="card" style={{padding:16}}>
        <h2>Profile</h2>
        <input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})}/>
        <input value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})}/>
        <input placeholder="New password (leave blank to keep)" value={edit.password} onChange={e=>setEdit({...edit,password:e.target.value})} />
        <div style={{marginTop:10}}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>

      <h3 style={{marginTop:16}}>Your Bookings</h3>
      <div>
        {my.length === 0 ? <p className="small">No bookings</p> : my.map(b => (
          <div className="card small" key={b.id} style={{marginTop:8}}>
            <div>{b.id} • {b.seats.length} seats • {new Date(b.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
