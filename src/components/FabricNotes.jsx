import { fabricNotes } from '../lib/fabric.js';

export default function FabricNotes({ composition, category }) {
  const notes = fabricNotes(composition, category);
  if (notes.length === 0) return null;
  return (
    <ul className="fabric-notes">
      {notes.map((n) => (
        <li key={n.text} className={`note-${n.level}`}>{n.text}</li>
      ))}
    </ul>
  );
}
