
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const BACKEND_URL = 'http://localhost:5000';

  const login = async () => {
    const res = await axios.post(`${BACKEND_URL}/api/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };
  
  const fetchNotes = async () => {
    const res = await axios.get(`${BACKEND_URL}/api/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotes(res.data);
  };
  
  const addNote = async () => {
    await axios.post(`${BACKEND_URL}/api/notes`, { text: newNote }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNewNote('');
    fetchNotes();
  };
  
  const deleteNote = async (id) => {
    await axios.delete(`${BACKEND_URL}/api/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotes();
  };
  

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /><br />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} /><br />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Notes</h2>
      <input value={newNote} onChange={(e) => setNewNote(e.target.value)} />
      <button onClick={addNote}>Add</button>
      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            {note.text} <button onClick={() => deleteNote(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
