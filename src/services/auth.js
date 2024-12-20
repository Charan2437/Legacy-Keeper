import { supabase } from '../lib/supabase';

const EMAIL_RATE_LIMIT = {
  MAX_ATTEMPTS: 3,
  WINDOW_HOURS: 1
};

export const authService = {
  async checkEmailRateLimit(email) {
    const { data, error } = await supabase
      .from('email_rate_limits')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    if (data) {
      const now = new Date();
      const nextAllowed = new Date(data.next_allowed);

      if (data.attempt_count >= EMAIL_RATE_LIMIT.MAX_ATTEMPTS && now < nextAllowed) {
        const minutesLeft = Math.ceil((nextAllowed - now) / (1000 * 60));
        throw new Error(`Too many attempts. Please try again in ${minutesLeft} minutes.`);
      }

      // Update attempt count
      await supabase
        .from('email_rate_limits')
        .update({
          attempt_count: data.attempt_count + 1,
          last_attempt: new Date().toISOString(),
          next_allowed: data.attempt_count + 1 >= EMAIL_RATE_LIMIT.MAX_ATTEMPTS 
            ? new Date(Date.now() + EMAIL_RATE_LIMIT.WINDOW_HOURS * 60 * 60 * 1000).toISOString()
            : data.next_allowed
        })
        .eq('email', email);
    } else {
      // First attempt
      await supabase
        .from('email_rate_limits')
        .insert([{ email }]);
    }
  },

  // Sign up new user
  async signUp({ email, password, full_name, phone_number, country_code, governmentID }) {
    try {
      // Check rate limit before attempting signup
      await this.checkEmailRateLimit(email);

      // 1. Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone_number,
            country_code
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;
      if (!authData?.user?.id) throw new Error('Failed to create user account');

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name,
          email,
          phone_number,
          country_code
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabase.auth.signOut();
        throw new Error('Failed to create user profile');
      }

      // 3. Handle government ID upload if provided
      if (governmentID) {
        try {
          const fileExt = governmentID.name.split('.').pop();
          const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('government-ids')
            .upload(fileName, governmentID, {
              cacheControl: '3600',
              upsert: false
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('government-ids')
              .getPublicUrl(fileName);

            await supabase
              .from('users')
              .update({ government_id_url: publicUrl })
              .eq('id', authData.user.id);
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          // Continue with signup even if file upload fails
        }
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      if (error.message?.includes('rate limit')) {
        throw error; // Rethrow rate limit errors
      }
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  },

  // Sign in user
  async signIn({ email, password, remember_me = false }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Create session record if remember_me is true
      if (remember_me) {
        await supabase.from('auth_sessions').insert([
          {
            user_id: data.user.id,
            remember_me: true,
            device_info: navigator.userAgent,
            ip_address: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          }
        ]);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Add this method to authService
  async resendConfirmationEmail(email) {
    try {
      // Check rate limit before attempting to resend
      await this.checkEmailRateLimit(email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      if (error.message?.includes('rate limit')) {
        throw error; // Rethrow rate limit errors
      }
      throw new Error('Failed to resend confirmation email');
    }
  },

  // Add this method to authService
  async resetPassword(email) {
    try {
      // Check rate limit before attempting password reset
      await this.checkEmailRateLimit(email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      if (error.message?.includes('rate limit')) {
        throw error; // Rethrow rate limit errors
      }
      console.error('Reset password error:', error);
      throw new Error('Failed to send password reset email');
    }
  },

  // Add this method for updating password
  async updatePassword(newPassword) {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, try to get it from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Set the access token
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: null
        });
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  async sendOTP(email) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            email,
            userId: user?.id
          })
        }
      );

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  async verifyOTP(email, otp) {
    try {
      const { data, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', otp)
        .eq('type', 'otp')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark OTP as used
      await supabase
        .from('verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);

      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }
}; 