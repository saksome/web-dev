import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Plus, Pencil, Trash2, X, StickyNote, Pin, Check } from 'lucide-react';
import './style.css';

const starterNotes = [
  { id: 'welcome', title: 'Welcome to your notes', content: 'Capture ideas, reminders, and anything you want to remember. Edit or delete this note whenever you like.', color: 'lavender', pinned: true, updatedAt: Date.now() },
  { id: 'ideas', title: 'Ideas to explore', content: 'Build a daily routine\nRead for 20 minutes\nStart that project you have been thinking about', color: 'yellow', pinned: false, updatedAt: Date.now() - 60000 },
  { id: 'todo', title: 'Quick reminders', content: 'Review class notes\nFinish the assignment\nTake a short break', color: 'mint', pinned: false, updatedAt: Date.now() - 120000 }
];

function loadNotes() {
  try {
    const saved = localStorage.getItem('experiment7-notes');
    return saved ? JSON.parse(saved) : starterNotes;
  } catch {
    return starterNotes;
  }
}

function App() {
  const [notes, setNotes] = useState(loadNotes);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('lavender');
  const [pinned, setPinned] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem('experiment7-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredNotes = useMemo(() => notes
    .filter(note => (note.title + ' ' + note.content).toLowerCase().includes(search.toLowerCase().trim()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt), [notes, search]);

  function openNew() {
    setEditing('new');
    setTitle('');
    setContent('');
    setColor('lavender');
    setPinned(false);
  }

  function openEdit(note) {
    setEditing(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setPinned(note.pinned);
  }

  function closeEditor() {
    setEditing(null);
    setTitle('');
    setContent('');
  }

  function saveNote(event) {
    event.preventDefault();
    if (!title.trim() && !content.trim()) {
      setToast('Add a title or some note content first.');
      return;
    }
    const now = Date.now();
    const nextNote = {
      id: editing === 'new' ? (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(now)) : editing,
      title: title.trim() || 'Untitled note',
      content: content.trim(),
      color,
      pinned,
      updatedAt: now
    };
    if (editing === 'new') {
      setNotes(current => [nextNote, ...current]);
      setToast('Note created successfully');
    } else {
      setNotes(current => current.map(note => note.id === editing ? nextNote : note));
      setToast('Note updated successfully');
    }
    closeEditor();
  }

  function togglePin(note) {
    setNotes(current => current.map(item => item.id === note.id ? { ...item, pinned: !item.pinned, updatedAt: Date.now() } : item));
    setToast(note.pinned ? 'Note unpinned' : 'Note pinned');
  }

  function confirmDelete() {
    setNotes(current => current.filter(note => note.id !== deleteId));
    setDeleteId(null);
    setToast('Note deleted');
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Notes home">
          <span className="brand-icon"><StickyNote size={21} /></span>
          <span>paper<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="saved-indicator"><span className="status-dot" /> Saved on this device</span>
          <button className="primary-button top-add" onClick={openNew}><Plus size={17} /> New note</button>
        </div>
      </header>

      <main id="top" className="main-content">
        <section className="intro">
          <div className="eyebrow"><StickyNote size={14} /> EXPERIMENT 7 · REACT NOTES</div>
          <h1>Good ideas deserve<br className="mobile-break" /> a place to land<span>.</span></h1>
          <p>A little space for everything on your mind.</p>
        </section>

        <section className="toolbar" aria-label="Notes controls">
          <div className="search-box">
            <Search size={18} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your notes..." aria-label="Search notes" />
            <span className="search-hint">Search</span>
          </div>
          <div className="note-count">{filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}</div>
        </section>

        {filteredNotes.length ? (
          <section className="notes-grid" aria-label="Your notes">
            {filteredNotes.map(note => (
              <article className={'note-card ' + note.color} key={note.id}>
                <div className="card-top">
                  <span className="note-type"><span className="type-dot" /> NOTE</span>
                  <div className="card-actions">
                    <button className={'icon-button pin-button ' + (note.pinned ? 'is-pinned' : '')} onClick={() => togglePin(note)} title={note.pinned ? 'Unpin note' : 'Pin note'} aria-label={note.pinned ? 'Unpin note' : 'Pin note'}><Pin size={15} /></button>
                    <button className="icon-button" onClick={() => openEdit(note)} title="Edit note" aria-label="Edit note"><Pencil size={15} /></button>
                    <button className="icon-button delete-button" onClick={() => setDeleteId(note.id)} title="Delete note" aria-label="Delete note"><Trash2 size={15} /></button>
                  </div>
                </div>
                <h2>{note.title}</h2>
                <p className="note-body">{note.content || <span className="empty-content">No additional details</span>}</p>
                <div className="card-footer">
                  <span>{formatDate(note.updatedAt)}</span>
                  {note.pinned && <span className="pinned-label"><Pin size={12} /> Pinned</span>}
                </div>
              </article>
            ))}
            <button className="add-card" onClick={openNew}>
              <span className="add-card-icon"><Plus size={22} /></span>
              <strong>Create a new note</strong>
              <span>Get that thought out of your head.</span>
            </button>
          </section>
        ) : (
          <section className="empty-state">
            <div className="empty-icon"><Search size={25} /></div>
            <h2>{search ? 'No notes found' : 'A fresh page'}</h2>
            <p>{search ? 'Try a different search term.' : 'Your notes will show up here. Start with a new note.'}</p>
            {search ? <button className="secondary-button" onClick={() => setSearch('')}>Clear search</button> : <button className="primary-button" onClick={openNew}><Plus size={17} /> Create your first note</button>}
          </section>
        )}

        <footer className="page-footer">
          <span>Made for your thoughts.</span>
          <span>{notes.length} total {notes.length === 1 ? 'note' : 'notes'} <span className="footer-sparkle">✳</span></span>
        </footer>
      </main>

      {editing !== null && (
        <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeEditor(); }}>
          <section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="modal-header">
              <div><span className="modal-kicker">YOUR NOTES</span><h2 id="editor-title">{editing === 'new' ? 'Create a note' : 'Edit your note'}</h2></div>
              <button className="icon-button close-button" onClick={closeEditor} aria-label="Close editor"><X size={19} /></button>
            </div>
            <form onSubmit={saveNote}>
              <label className="field-label" htmlFor="note-title">Title</label>
              <input id="note-title" className="title-input" value={title} onChange={event => setTitle(event.target.value)} placeholder="Give your note a title..." maxLength={100} autoFocus />
              <label className="field-label" htmlFor="note-content">Your thoughts</label>
              <textarea id="note-content" value={content} onChange={event => setContent(event.target.value)} placeholder="Start writing here..." rows={7} maxLength={5000} />
              <div className="editor-options">
                <div>
                  <span className="field-label">Note color</span>
                  <div className="color-options">
                    {[['lavender', 'Lavender'], ['yellow', 'Butter'], ['mint', 'Mint'], ['peach', 'Peach']].map(([value, label]) => (
                      <button key={value} type="button" className={'color-choice ' + value + (color === value ? ' selected' : '')} onClick={() => setColor(value)} aria-label={label} title={label}>{color === value && <Check size={14} />}</button>
                    ))}
                  </div>
                </div>
                <label className="pin-option"><input type="checkbox" checked={pinned} onChange={event => setPinned(event.target.checked)} /> <Pin size={14} /> Pin this note</label>
              </div>
              <div className="modal-footer">
                <span className="character-count">{content.length}/5000 characters</span>
                <div className="modal-buttons">
                  <button type="button" className="secondary-button" onClick={closeEditor}>Cancel</button>
                  <button type="submit" className="primary-button"><Check size={16} /> Save note</button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteId !== null && (
        <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setDeleteId(null); }}>
          <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="delete-symbol"><Trash2 size={22} /></div>
            <h2 id="delete-title">Delete this note?</h2>
            <p>This note will be permanently removed from this device. This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="secondary-button" onClick={() => setDeleteId(null)}>Keep note</button>
              <button className="danger-button" onClick={confirmDelete}><Trash2 size={15} /> Delete note</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><Check size={16} /> {toast}</div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
