-- Create update_contact_v1 RPC function
CREATE OR REPLACE FUNCTION public.update_contact_v1(contact_id uuid, new_status text, new_metadata jsonb)
 RETURNS contacts
 LANGUAGE plpgsql
AS $function$
DECLARE
  updated_row contacts;
BEGIN
  UPDATE contacts
  SET 
    status = COALESCE(new_status, status),
    metadata = CASE 
      WHEN new_metadata IS NULL THEN metadata 
      ELSE metadata || new_metadata 
    END,
    updated_at = NOW()
  WHERE id = contact_id
  RETURNING * INTO updated_row;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;
  
  RETURN updated_row;
END;
$function$;
