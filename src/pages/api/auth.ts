import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../services/supabase'

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  return supabase.auth.api.setAuthCookie(req, res);
}