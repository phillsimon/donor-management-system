/*
  # Add notes table for donor prospects
  
  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `donor_id` (text, required) - Reference to the donor
      - `user_id` (uuid, required) - Reference to the authenticated user
      - `title` (text, required) - Note title
      - `content` (text, required) - Note content
      - `attachment_url` (text) - Optional URL to attachment
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Insert their own notes
      - Read notes they created
      - Update their own notes
      - Delete their own notes
*/

-- Create notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  content text NOT NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX notes_donor_id_idx ON notes(donor_id);
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_created_at_idx ON notes(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();