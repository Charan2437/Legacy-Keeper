// This is a Supabase Edge Function that processes reminders
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const processReminders = async () => {
  try {
    // Get active reminders that need processing
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'Active')
      .lte('next_reminder_date', new Date().toISOString());

    if (error) throw error;

    for (const reminder of reminders) {
      try {
        // Send notifications based on preferences
        if (reminder.notification_email) {
          await sendEmailNotification(reminder);
        }
        
        if (reminder.notification_sms) {
          await sendSMSNotification(reminder);
        }

        // Update next reminder date based on frequency
        await updateNextReminderDate(reminder);

        // Log successful notification
        await supabase
          .from('reminder_history')
          .insert([{
            reminder_id: reminder.id,
            notification_date: new Date().toISOString(),
            notification_type: 'system',
            status: 'success'
          }]);

      } catch (error) {
        // Log failed notification
        await supabase
          .from('reminder_history')
          .insert([{
            reminder_id: reminder.id,
            notification_date: new Date().toISOString(),
            notification_type: 'system',
            status: 'failed',
            error_message: error.message
          }]);
      }
    }

    return { success: true, processed: reminders.length };
  } catch (error) {
    console.error('Error processing reminders:', error);
    throw error;
  }
};

// Helper function to send email notifications
async function sendEmailNotification(reminder) {
  // Implement email sending logic here
  // This could use SendGrid, AWS SES, or other email service
}

// Helper function to send SMS notifications
async function sendSMSNotification(reminder) {
  // Implement SMS sending logic here
  // This could use Twilio, AWS SNS, or other SMS service
}

// Helper function to update next reminder date
async function updateNextReminderDate(reminder) {
  let nextDate = new Date(reminder.next_reminder_date);
  
  switch (reminder.frequency) {
    case 'Daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'Weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'Monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'Quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'Yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'Once':
      // Mark reminder as completed for one-time reminders
      await supabase
        .from('reminders')
        .update({ status: 'Completed' })
        .eq('id', reminder.id);
      return;
  }

  // Update next reminder date
  if (!reminder.end_date || nextDate <= new Date(reminder.end_date)) {
    await supabase
      .from('reminders')
      .update({ next_reminder_date: nextDate.toISOString() })
      .eq('id', reminder.id);
  } else {
    // Mark reminder as completed if end date is reached
    await supabase
      .from('reminders')
      .update({ status: 'Completed' })
      .eq('id', reminder.id);
  }
}

// Invoke the function
Deno.serve(async () => {
  try {
    const result = await processReminders();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 