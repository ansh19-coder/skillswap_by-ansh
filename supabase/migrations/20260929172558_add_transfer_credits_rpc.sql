/*
# Add transfer_credits RPC function

1. New Functions
   - `transfer_credits(p_user_id uuid, p_amount integer)` — adjusts a profile's credits by a signed amount.
     Used after a completed session: learner pays -5, teacher earns +5.
     SECURITY DEFINER so it can update profiles even though the caller is the learner/teacher (not the profile owner).

2. Security
   - SECURITY DEFINER, search_path locked to public.
   - Only modifies the credits column; no other columns are affected.
*/

CREATE OR REPLACE FUNCTION transfer_credits(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET credits = GREATEST(0, credits + p_amount)
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION transfer_credits TO authenticated;
