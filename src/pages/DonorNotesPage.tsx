import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

interface Note {
  id: string;
  donor_id: string;
  user_id: string;
  title: string;
  content: string;
  attachment_url?: string;
  created_at: string;
  donor?: {
    "First Name": string;
    "Last Name": string;
  };
}

const NOTES_PER_PAGE = 10;

export function DonorNotesPage() {
  const { donorId } = useParams<{ donorId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmingNoteId, setConfirmingNoteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          donor:donor_id (
            "First Name",
            "Last Name"
          )
        `)
        .eq('donor_id', donorId)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load notes');
        console.error(error);
      } else {
        setNotes(data || []);
      }

      setLoading(false);
    };

    if (donorId) fetchNotes();
  }, [donorId]);

  const handleDelete = async (noteId: string) => {
    setToast(null);
    const noteTitle = notes.find(n => n.id === noteId)?.title || 'this note';

    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) {
      setError('Failed to delete note');
      console.error(error);
    } else {
      setNotes(notes.filter((note) => note.id !== noteId));
      setToast(`✅ "${noteTitle}" was deleted.`);
    }
  };

  const totalPages = Math.ceil(notes.length / NOTES_PER_PAGE);
  const paginatedNotes = notes.slice(
    (currentPage - 1) * NOTES_PER_PAGE,
    currentPage * NOTES_PER_PAGE
  );

  if (loading) return <div className="p-4">Loading notes...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const donorName = notes[0]?.donor
    ? `${notes[0].donor["First Name"]} ${notes[0].donor["Last Name"]}`
    : 'Donor';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notes for {donorName}</h1>

      {toast && (
        <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-800 text-sm shadow">
          {toast}
        </div>
      )}

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {paginatedNotes.map((note) => (
              <li key={note.id} className="border rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold">{note.title}</h2>
                <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
                {note.attachment_url && (
                  <a
                    href={`https://YOUR_PROJECT.supabase.co/storage/v1/object/public/note-attachments/${note.attachment_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline block mt-2"
                  >
                    View Attachment
                  </a>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(note.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => setConfirmingNoteId(note.id)}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {confirmingNoteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Delete Note?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete "<strong>{notes.find(n => n.id === confirmingNoteId)?.title}</strong>"?
              You won’t be able to recover it later.
            </p>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setConfirmingNoteId(null)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDelete(confirmingNoteId);
                  setConfirmingNoteId(null);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
