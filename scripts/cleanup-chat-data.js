#!/usr/bin/env node
/*
  Cleanup chat data while preserving the latest user message from the user with full_name "Bolaji Paul".
  - Keeps the most recent contact_messages row with name = 'Bolaji Paul'
  - Keeps the most recent support_messages row sent by that user (sender_type = 'user') and preserves its ticket
  - Deletes all other contact_messages, support_messages, and support_tickets not tied to the preserved message

  Environment:
  - Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (from admin-dashboard/.env if available)
*/

const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load env from admin-dashboard/.env if present
const envPath = path.join(__dirname, '..', 'admin-dashboard', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  try {
    const targetName = 'Bolaji Paul';

    // 1) Preserve latest contact_messages for target name
    const { data: contactRows, error: contactErr } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('name', targetName)
      .order('created_at', { ascending: false })
      .limit(1);
    if (contactErr) throw contactErr;

    // Delete all contact_messages
    const { error: delContactsErr } = await supabase.from('contact_messages').delete().not('id', 'is', null);
    if (delContactsErr) throw delContactsErr;

    // Re-insert preserved contact message
    if (contactRows && contactRows.length > 0) {
      const last = contactRows[0];
      const { error: reinsertErr } = await supabase.from('contact_messages').insert({
        name: last.name,
        email: last.email,
        phone: last.phone,
        message: last.message,
        status: 'new'
      });
      if (reinsertErr) throw reinsertErr;
    }

    // 2) Preserve latest support message from user with full_name targetName
    // Find the user id by full_name
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('full_name', targetName)
      .limit(1);
    if (usersErr) throw usersErr;

    let preservedMessageId = null;
    let preservedTicketId = null;
    if (users && users.length > 0) {
      const userId = users[0].id;
      const { data: latestMsg, error: latestMsgErr } = await supabase
        .from('support_messages')
        .select('id, ticket_id, sender_id, sender_type, created_at')
        .eq('sender_id', userId)
        .eq('sender_type', 'user')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestMsgErr) throw latestMsgErr;

      if (latestMsg) {
        preservedMessageId = latestMsg.id;
        preservedTicketId = latestMsg.ticket_id;
      }
    }

    // Delete support_messages except the preserved one (if any)
    if (preservedMessageId) {
      const { error: delMsgsErr } = await supabase
        .from('support_messages')
        .delete()
        .neq('id', preservedMessageId);
      if (delMsgsErr) throw delMsgsErr;
    } else {
      // No preserved message, clear all
      const { error: delAllMsgsErr } = await supabase
        .from('support_messages')
        .delete()
        .not('id', 'is', null);
      if (delAllMsgsErr) throw delAllMsgsErr;
    }

    // Delete support_tickets except the one hosting preserved message (if any)
    if (preservedTicketId) {
      const { error: delTicketsErr } = await supabase
        .from('support_tickets')
        .delete()
        .neq('id', preservedTicketId);
      if (delTicketsErr) throw delTicketsErr;
    } else {
      // No preserved ticket, clear all
      const { error: delAllTicketsErr } = await supabase
        .from('support_tickets')
        .delete()
        .not('id', 'is', null);
      if (delAllTicketsErr) throw delAllTicketsErr;
    }

    console.log('✅ Chat data cleanup complete. Preserved contact and latest support message for:', targetName);
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message || err);
    process.exit(1);
  }
}

main();


