/*
  # Create donors table for storing donor information
  
  1. New Tables
    - `donors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - All donor fields from the Donor type
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Insert their own donors
      - Read their own donors
      - Update their own donors
      - Delete their own donors
*/

CREATE TABLE donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  ds_rating text,
  quality_score numeric,
  profile text,
  rfm_total integer,
  last_gift_date text,
  total_gift_amount text,
  num_of_gifts integer,
  age integer,
  date_of_birth text,
  phone_number text,
  address text,
  address_2 text,
  city text,
  state text,
  zip text,
  client_id text,
  sp_first text,
  sp_middle text,
  sp_last text,
  notes text,
  largest_gift_amount text,
  largest_gift_date text,
  last_gift_amount text,
  first_date_range text,
  first_gift_amount text,
  total_of_likely_matches text,
  num_of_gift_matches integer,
  foundation text,
  fnd_assets text,
  non_profit text,
  political_likely_count integer,
  political_likely_total text,
  maybe_total text,
  largest_gift_found text,
  largest_gift_found_lower_range text,
  wealth_based_capacity text,
  real_estate_est text,
  num_of_prop integer,
  real_estate_trust text,
  num_of_st_w_prop integer,
  zestimate_total text,
  zestimate_count integer,
  ln_total text,
  ln_count integer,
  sec_stock_value text,
  sec_stock_or_insider text,
  market_guide text,
  market_guide_comp text,
  market_guide_options text,
  business_revenue text,
  business_affiliation text,
  pension_admin text,
  pension_assets text,
  estimated_capacity text,
  annual_fund_likelihood integer,
  major_gift_likelihood integer,
  pgid integer,
  vip_match text,
  inner_circle integer,
  average_home_value text,
  median_household_income text,
  corp_tech text,
  faa_pilots text,
  airplane_owner text,
  boat_owner text,
  whos_who text,
  rfm_recent_gift integer,
  rfm_freq integer,
  rfm_money integer,
  classic_quality_score numeric,
  prefix text,
  suffix text,
  higher_education_count integer,
  higher_education_total text,
  education_gift_count integer,
  education_gift_amount text,
  philanthropy_and_grantmaking_count integer,
  philanthropy_and_grantmaking_total text,
  healthcare_count integer,
  healthcare_total text,
  arts_gift_count integer,
  arts_gift_amount text,
  republican_gift_count integer,
  republican_gift_total text,
  democratic_gift_count integer,
  democratic_gift_total text,
  other_political_count integer,
  other_political_total text,
  religion_count integer,
  religion_total text,
  society_benefit_count integer,
  society_benefit_total text,
  shale_wealth integer,
  mbt_net_worth text,
  mbt_income_estimate text,
  mbt_highest_asset text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own donors"
  ON donors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own donors"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own donors"
  ON donors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX donors_user_id_idx ON donors(user_id);
CREATE INDEX donors_client_id_idx ON donors(client_id);

-- Create updated_at trigger
CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();