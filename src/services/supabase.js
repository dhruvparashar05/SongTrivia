import { createClient } from '@supabase/supabase-js';
import { DEFAULT_HORROR_SONGS } from '../data/defaultSongs';
import { checkAnswerMatch, computePoints } from './scoring';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================================
// LOCAL HORROR ENGINE (MOCK / OFFLINE FALLBACK)
// ==========================================================

const STORAGE_KEYS = {
  SETTINGS: 'horror_trivia_settings_v1',
  SONGS: 'horror_trivia_songs_v1',
  PARTICIPANTS: 'horror_trivia_participants_v1',
  ROUND_SESSIONS: 'horror_trivia_round_sessions_v1',
  SUBMISSIONS: 'horror_trivia_submissions_v1',
  ADMIN_SESSION: 'horror_trivia_admin_session_v1',
};


// Initial state helpers
function getLocalItem(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Error reading localStorage for key', key, e);
    return defaultValue;
  }
}

function setLocalItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage for key', key, e);
  }
}

// Seed local storage with default 30 horror songs and settings
export function initializeLocalStorageIfNeeded() {
  const existingSongs = getLocalItem(STORAGE_KEYS.SONGS, null);
  if (!existingSongs || existingSongs.length === 0) {
    const formatted = DEFAULT_HORROR_SONGS.map((song, idx) => ({
      id: `song-${idx + 1}`,
      round_number: song.round_number,
      title: song.title,
      artist: song.artist,
      audio_path: song.audio_path || '',
      correct_answer: song.correct_answer,
      accepted_answers: song.accepted_answers,
      hint: song.hint,
      synth_motif: song.synth_motif,
      created_at: new Date().toISOString()
    }));
    setLocalItem(STORAGE_KEYS.SONGS, formatted);
  }

  const existingSettings = getLocalItem(STORAGE_KEYS.SETTINGS, null);
  if (!existingSettings) {
    setLocalItem(STORAGE_KEYS.SETTINGS, {
      id: 1,
      game_status: 'waiting', // 'waiting' | 'active' | 'paused' | 'ended'
      current_round: 1,
      total_rounds: 30,
      answers_revealed: false,
      updated_at: new Date().toISOString()
    });
  }

  const existingParticipants = getLocalItem(STORAGE_KEYS.PARTICIPANTS, null);
  if (!existingParticipants) {
    setLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
  }

  const existingSubmissions = getLocalItem(STORAGE_KEYS.SUBMISSIONS, null);
  if (!existingSubmissions) {
    setLocalItem(STORAGE_KEYS.SUBMISSIONS, []);
  }

  const existingSessions = getLocalItem(STORAGE_KEYS.ROUND_SESSIONS, null);
  if (!existingSessions) {
    setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, []);
  }
}


initializeLocalStorageIfNeeded();

// ==========================================================
// UNIFIED DATA SERVICE APIS
// ==========================================================

export const horrorApi = {
  // 1. GAME SETTINGS
  async getGameSettings() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('game_settings')
          .select('*')
          .eq('id', 1)
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase getGameSettings failed, falling back to local:', err);
      }
    }
    return getLocalItem(STORAGE_KEYS.SETTINGS, {
      id: 1,
      game_status: 'waiting',
      current_round: 1,
      total_rounds: 30,
      answers_revealed: false
    });
  },

  async updateGameSettings(updates) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('game_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', 1)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateGameSettings failed, falling back to local:', err);
      }
    }

    const current = getLocalItem(STORAGE_KEYS.SETTINGS, {});
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.SETTINGS, updated);
    window.dispatchEvent(new CustomEvent('horror_settings_updated', { detail: updated }));
    return updated;
  },

  // 2. SONGS
  async getPlayableSongs() {
    // Participants fetch: returns songs WITHOUT correct_answer unless answers_revealed is true!
    const settings = await this.getGameSettings();
    const answersRevealed = Boolean(settings?.answers_revealed);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_playable_songs');
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase get_playable_songs rpc failed:', e);
      }
    }

    // Local engine logic
    const allSongs = getLocalItem(STORAGE_KEYS.SONGS, []);
    return allSongs.map(song => ({
      id: song.id,
      round_number: song.round_number,
      title: song.title,
      artist: song.artist,
      audio_path: song.audio_path,
      hint: song.hint,
      synth_motif: song.synth_motif,
      // Strictly protect answers before reveal
      correct_answer: answersRevealed ? song.correct_answer : null,
      accepted_answers: answersRevealed ? song.accepted_answers : null
    }));
  },

  async getAllAdminSongs() {
    // Admin only: returns all songs with answers and metadata
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('round_number', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase getAllAdminSongs failed:', e);
      }
    }
    return getLocalItem(STORAGE_KEYS.SONGS, []);
  },

  async saveSong(songData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('songs')
          .upsert({
            id: songData.id || undefined,
            round_number: songData.round_number,
            title: songData.title,
            audio_path: songData.audio_path,
            correct_answer: songData.correct_answer,
            accepted_answers: Array.isArray(songData.accepted_answers)
              ? songData.accepted_answers
              : (songData.accepted_answers || '').split(',').map(s => s.trim()).filter(Boolean),
            hint: songData.hint || ''
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase saveSong failed, updating local storage:', e);
      }
    }

    const songs = getLocalItem(STORAGE_KEYS.SONGS, []);
    const index = songs.findIndex(s => s.round_number === songData.round_number || s.id === songData.id);

    const updatedSong = {
      ...songData,
      id: songData.id || `song-${songData.round_number}`,
      accepted_answers: Array.isArray(songData.accepted_answers)
        ? songData.accepted_answers
        : (songData.accepted_answers || '').split(',').map(s => s.trim()).filter(Boolean)
    };

    if (index >= 0) {
      songs[index] = { ...songs[index], ...updatedSong };
    } else {
      songs.push(updatedSong);
    }
    songs.sort((a, b) => a.round_number - b.round_number);
    setLocalItem(STORAGE_KEYS.SONGS, songs);
    return updatedSong;
  },

  // 3. PARTICIPANTS
  async registerParticipant(name) {
    const cleanName = (name || '').trim();
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter a valid survivor name (at least 2 characters).');
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const participantCode = `SURVIVOR-${randomSuffix}`;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('participants')
          .insert({
            name: cleanName,
            participant_code: participantCode,
            total_score: 0,
            correct_count: 0,
            completed_rounds: 0
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase registerParticipant failed, falling back to local:', err);
      }
    }

    const participants = getLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
    const newParticipant = {
      id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      participant_code: participantCode,
      name: cleanName,
      total_score: 0,
      correct_count: 0,
      completed_rounds: 0,
      completion_time: null,
      created_at: new Date().toISOString()
    };

    participants.push(newParticipant);
    setLocalItem(STORAGE_KEYS.PARTICIPANTS, participants);
    return newParticipant;
  },

  async getParticipant(participantId) {
    if (!participantId) return null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .eq('id', participantId)
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getParticipant error:', e);
      }
    }

    const participants = getLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
    return participants.find(p => p.id === participantId) || null;
  },

  // 4. ROUND SESSIONS & STRICT ANTI-CHEATING CONTROLS
  async startRoundPlayback(participantId, songId, durationSeconds = 8.0) {
    if (!participantId || !songId) {
      throw new Error('Participant ID and Song ID are required.');
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('start_round_playback', {
          p_participant_id: participantId,
          p_song_id: songId,
          p_audio_duration: durationSeconds
        });
        if (error) throw error;
        if (data && data.success === false) {
          throw new Error(data.error || 'Playback request rejected');
        }
        return data;
      } catch (err) {
        console.warn('Supabase start_round_playback failed, using local engine:', err);
      }
    }

    // Local Horror Engine single playback enforcement
    const settings = getLocalItem(STORAGE_KEYS.SETTINGS, { game_status: 'active' });
    if (settings.game_status !== 'active') {
      throw new Error(`The event is currently ${settings.game_status}. Playback is only allowed during active rounds.`);
    }

    const songs = getLocalItem(STORAGE_KEYS.SONGS, []);
    const song = songs.find(s => s.id === songId);
    if (!song) throw new Error('Song round not found.');

    const sessions = getLocalItem(STORAGE_KEYS.ROUND_SESSIONS, []);
    let session = sessions.find(s => s.participant_id === participantId && s.song_id === songId);

    const now = new Date();
    const duration = Math.min(30, Math.max(3, Number(durationSeconds) || 8.0));
    const deadline = new Date(now.getTime() + (duration * 1000) + 10000);

    if (session) {
      if (session.state !== 'ready') {
        throw new Error('Audio playback already initiated for this round. Replaying is strictly prohibited.');
      }
      session.state = 'audio_playing';
      session.audio_duration_seconds = duration;
      session.playback_started_at = now.toISOString();
      session.answer_deadline = deadline.toISOString();
    } else {
      session = {
        id: `sess-${Date.now()}`,
        participant_id: participantId,
        song_id: songId,
        round_number: song.round_number,
        state: 'audio_playing',
        audio_duration_seconds: duration,
        playback_started_at: now.toISOString(),
        answer_deadline: deadline.toISOString(),
        created_at: now.toISOString()
      };
      sessions.push(session);
    }

    setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, sessions);

    return {
      success: true,
      state: 'audio_playing',
      playback_started_at: session.playback_started_at,
      audio_duration_seconds: duration,
      answer_deadline: session.answer_deadline,
      server_now: now.toISOString()
    };
  },

  async completeAudioAndStartAnswering(participantId, songId) {
    if (!participantId || !songId) {
      throw new Error('Participant ID and Song ID are required.');
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('complete_audio_and_start_answering', {
          p_participant_id: participantId,
          p_song_id: songId
        });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase complete_audio_and_start_answering failed, using local:', err);
      }
    }

    const sessions = getLocalItem(STORAGE_KEYS.ROUND_SESSIONS, []);
    const session = sessions.find(s => s.participant_id === participantId && s.song_id === songId);
    const now = new Date();

    if (!session) {
      throw new Error('No active round session found.');
    }

    if (session.state === 'submitted' || session.state === 'time_expired') {
      return { success: true, state: session.state, server_now: now.toISOString() };
    }

    if (session.state === 'answering') {
      return {
        success: true,
        state: 'answering',
        answer_deadline: session.answer_deadline,
        server_now: now.toISOString()
      };
    }

    // Set deadline to at most 10.5 seconds from now
    const proposedDeadline = new Date(now.getTime() + 10500);
    const existingDeadline = session.answer_deadline ? new Date(session.answer_deadline) : proposedDeadline;
    const finalDeadline = existingDeadline < proposedDeadline ? existingDeadline : proposedDeadline;

    session.state = 'answering';
    session.playback_completed_at = now.toISOString();
    session.answer_deadline = finalDeadline.toISOString();

    setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, sessions);

    return {
      success: true,
      state: 'answering',
      answer_deadline: session.answer_deadline,
      server_now: now.toISOString()
    };
  },

  async getRoundState(participantId, songId) {
    if (!participantId || !songId) {
      return { state: 'ready', can_play: true, server_now: new Date().toISOString() };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_round_state', {
          p_participant_id: participantId,
          p_song_id: songId
        });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase get_round_state failed, using local engine:', err);
      }
    }

    const now = new Date();
    const submissions = getLocalItem(STORAGE_KEYS.SUBMISSIONS, []);
    const sub = submissions.find(s => s.participant_id === participantId && s.song_id === songId);

    if (sub) {
      return {
        state: 'submitted',
        can_play: false,
        is_correct: sub.is_correct,
        points_awarded: sub.points_awarded,
        submitted_answer: sub.submitted_answer,
        server_now: now.toISOString()
      };
    }

    const sessions = getLocalItem(STORAGE_KEYS.ROUND_SESSIONS, []);
    const session = sessions.find(s => s.participant_id === participantId && s.song_id === songId);

    if (!session) {
      return {
        state: 'ready',
        can_play: true,
        server_now: now.toISOString()
      };
    }

    // Check if audio has finished playing based on elapsed time
    const startedAt = new Date(session.playback_started_at || 0).getTime();
    const audioDurationMs = (session.audio_duration_seconds || 8.0) * 1000;

    if (session.state === 'audio_playing' && now.getTime() >= startedAt + audioDurationMs) {
      session.state = 'answering';
      session.playback_completed_at = new Date(startedAt + audioDurationMs).toISOString();
      setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, sessions);
    }

    // Check if answer deadline expired
    let isExpired = false;
    let remainingSec = 0;

    if (session.answer_deadline) {
      const deadlineMs = new Date(session.answer_deadline).getTime();
      remainingSec = Math.max(0, Math.ceil((deadlineMs - now.getTime()) / 1000));

      if (now.getTime() > deadlineMs + 1000) {
        isExpired = true;
        if (session.state !== 'time_expired') {
          session.state = 'time_expired';
          setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, sessions);

          // Record 0-pt submission for timeout
          if (!submissions.some(s => s.participant_id === participantId && s.song_id === songId)) {
            submissions.push({
              id: `sub-${Date.now()}`,
              participant_id: participantId,
              song_id: songId,
              round_number: session.round_number,
              submitted_answer: '[TIME_EXPIRED]',
              is_correct: false,
              points_awarded: 0,
              submitted_at: now.toISOString()
            });
            setLocalItem(STORAGE_KEYS.SUBMISSIONS, submissions);
          }
        }
      }
    }

    return {
      state: session.state,
      can_play: session.state === 'ready',
      audio_duration_seconds: session.audio_duration_seconds,
      playback_started_at: session.playback_started_at,
      answer_deadline: session.answer_deadline,
      server_now: now.toISOString(),
      is_expired: isExpired,
      remaining_answer_seconds: remainingSec
    };
  },

  // 5. SUBMIT ANSWER (SERVER-SIDE / MOCK RPC WITH DEADLINE VERIFICATION)
  async submitAnswer(participantId, songId, submittedAnswer) {
    if (!participantId || !songId) {
      throw new Error('Participant ID and Song ID are required.');
    }

    // Supabase RPC execution
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('submit_song_answer', {
          p_participant_id: participantId,
          p_song_id: songId,
          p_submitted_answer: submittedAnswer
        });

        if (error) throw error;
        if (data && data.success === false) {
          throw new Error(data.error || 'Submission failed');
        }
        return data;
      } catch (err) {
        console.warn('Supabase submit_song_answer failed, executing local fallback:', err);
      }
    }

    // Local Horror Engine Answer Checking
    const settings = getLocalItem(STORAGE_KEYS.SETTINGS, { game_status: 'active' });
    if (settings.game_status !== 'active') {
      throw new Error(`The event is currently ${settings.game_status}. Answers can only be submitted during active rounds.`);
    }

    const songs = getLocalItem(STORAGE_KEYS.SONGS, []);
    const song = songs.find(s => s.id === songId);
    if (!song) {
      throw new Error('Song round not found.');
    }

    const submissions = getLocalItem(STORAGE_KEYS.SUBMISSIONS, []);
    const alreadyAnswered = submissions.some(
      sub => sub.participant_id === participantId && (sub.song_id === songId || sub.round_number === song.round_number)
    );

    if (alreadyAnswered) {
      throw new Error('You have already submitted an answer for this round.');
    }

    // Verify session deadline
    const sessions = getLocalItem(STORAGE_KEYS.ROUND_SESSIONS, []);
    const session = sessions.find(s => s.participant_id === participantId && s.song_id === songId);
    let isExpired = false;

    if (session && session.answer_deadline) {
      const deadlineMs = new Date(session.answer_deadline).getTime();
      // 1.5s grace for network transit
      if (Date.now() > deadlineMs + 1500) {
        isExpired = true;
      }
    }

    if (isExpired || submittedAnswer === '[TIME_EXPIRED]') {
      if (session) {
        session.state = 'time_expired';
        session.submitted_at = new Date().toISOString();
        setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, sessions);
      }

      const expiredSubmission = {
        id: `sub-${Date.now()}`,
        participant_id: participantId,
        song_id: songId,
        round_number: song.round_number,
        submitted_answer: '[TIME_EXPIRED]',
        is_correct: false,
        points_awarded: 0,
        submitted_at: new Date().toISOString()
      };

      submissions.push(expiredSubmission);
      setLocalItem(STORAGE_KEYS.SUBMISSIONS, submissions);

      const participants = getLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
      const pIndex = participants.findIndex(p => p.id === participantId);
      let totalScore = 0;
      let correctCount = 0;
      let completedRounds = 1;

      if (pIndex >= 0) {
        const pSubs = submissions.filter(s => s.participant_id === participantId);
        totalScore = pSubs.reduce((acc, s) => acc + (s.points_awarded || 0), 0);
        correctCount = pSubs.filter(s => s.is_correct).length;
        completedRounds = pSubs.length;

        participants[pIndex].total_score = totalScore;
        participants[pIndex].correct_count = correctCount;
        participants[pIndex].completed_rounds = completedRounds;
        if (completedRounds >= 30 && !participants[pIndex].completion_time) {
          participants[pIndex].completion_time = new Date().toISOString();
        }
        setLocalItem(STORAGE_KEYS.PARTICIPANTS, participants);
      }

      return {
        success: true,
        round_number: song.round_number,
        is_correct: false,
        is_expired: true,
        points_awarded: 0,
        total_score: totalScore,
        correct_count: correctCount,
        completed_rounds: completedRounds
      };
    }

    // Server-side normalized answer check on valid submission
    const isCorrect = checkAnswerMatch(submittedAnswer, song.correct_answer, song.accepted_answers);
    const pointsAwarded = computePoints(isCorrect);

    if (session) {
      session.state = 'submitted';
      session.submitted_at = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, sessions);
    }

    const newSubmission = {
      id: `sub-${Date.now()}`,
      participant_id: participantId,
      song_id: songId,
      round_number: song.round_number,
      submitted_answer: submittedAnswer,
      is_correct: isCorrect,
      points_awarded: pointsAwarded,
      submitted_at: new Date().toISOString()
    };

    submissions.push(newSubmission);
    setLocalItem(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Recalculate participant score
    const participants = getLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
    const pIndex = participants.findIndex(p => p.id === participantId);

    let totalScore = pointsAwarded;
    let correctCount = isCorrect ? 1 : 0;
    let completedRounds = 1;

    if (pIndex >= 0) {
      const pSubs = submissions.filter(s => s.participant_id === participantId);
      totalScore = pSubs.reduce((acc, s) => acc + (s.points_awarded || 0), 0);
      correctCount = pSubs.filter(s => s.is_correct).length;
      completedRounds = pSubs.length;

      participants[pIndex].total_score = totalScore;
      participants[pIndex].correct_count = correctCount;
      participants[pIndex].completed_rounds = completedRounds;
      if (completedRounds >= 30 && !participants[pIndex].completion_time) {
        participants[pIndex].completion_time = new Date().toISOString();
      }
      setLocalItem(STORAGE_KEYS.PARTICIPANTS, participants);
    }

    // Dispatch custom event for live local updates
    window.dispatchEvent(new CustomEvent('horror_submission_made', {
      detail: { participantId, roundNumber: song.round_number, isCorrect, totalScore }
    }));

    return {
      success: true,
      round_number: song.round_number,
      is_correct: isCorrect,
      is_expired: false,
      points_awarded: pointsAwarded,
      total_score: totalScore,
      correct_count: correctCount,
      completed_rounds: completedRounds
    };
  },


  async getParticipantSubmissions(participantId) {
    if (!participantId) return [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('participant_id', participantId);
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getParticipantSubmissions failed:', e);
      }
    }
    const submissions = getLocalItem(STORAGE_KEYS.SUBMISSIONS, []);
    return submissions.filter(s => s.participant_id === participantId);
  },

  // 5. LEADERBOARD
  async getLeaderboard() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_horror_leaderboard');
        if (!error && data) return data;

        // Fallback to direct select
        const { data: rawList, error: listError } = await supabase
          .from('participants')
          .select('*')
          .order('total_score', { ascending: false })
          .order('correct_count', { ascending: false })
          .order('completion_time', { ascending: true, nullsFirst: false });
        if (!listError && rawList) {
          return rawList.map((p, idx) => ({ ...p, rank: idx + 1 }));
        }
      } catch (e) {
        console.warn('Supabase getLeaderboard failed, using local:', e);
      }
    }

    const participants = getLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
    // Sort: total_score DESC -> correct_count DESC -> completion_time ASC -> created_at ASC
    const sorted = [...participants].sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      if (b.correct_count !== a.correct_count) {
        return b.correct_count - a.correct_count;
      }
      if (a.completion_time && b.completion_time) {
        return new Date(a.completion_time) - new Date(b.completion_time);
      }
      if (a.completion_time && !b.completion_time) return -1;
      if (!a.completion_time && b.completion_time) return 1;
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });

    return sorted.map((p, index) => ({
      ...p,
      rank: index + 1
    }));
  },

  // 6. ADMIN & AUDIT
  async getAllSubmissions() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*, participants(name, participant_code), songs(title, correct_answer)')
          .order('submitted_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getAllSubmissions failed:', e);
      }
    }
    const submissions = getLocalItem(STORAGE_KEYS.SUBMISSIONS, []);
    const participants = getLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
    const songs = getLocalItem(STORAGE_KEYS.SONGS, []);

    return submissions.map(sub => {
      const part = participants.find(p => p.id === sub.participant_id);
      const song = songs.find(s => s.id === sub.song_id);
      return {
        ...sub,
        participant_name: part?.name || 'Unknown Survivor',
        participant_code: part?.participant_code || 'SURVIVOR-????',
        song_title: song?.title || `Round ${sub.round_number}`,
        correct_answer: song?.correct_answer || ''
      };
    });
  },

  async uploadAudioClip(file, roundNumber) {
    if (!file) throw new Error('No audio file provided.');

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Audio file exceeds 10MB limit.');
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['mp3', 'wav', 'm4a', 'mp4', 'ogg', 'aac'];
    if (!validExtensions.includes(ext)) {
      throw new Error(`Unsupported format (.${ext}). Please upload MP3, WAV, M4A, or OGG.`);
    }

    const fileName = `round-${roundNumber}-${Date.now()}.${ext}`;

    if (isSupabaseConfigured) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('song-clips')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('song-clips')
          .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
      } catch (err) {
        console.warn('Supabase audio upload failed, falling back to local Blob URL:', err);
      }
    }

    // In local engine, create Object URL for playback
    return URL.createObjectURL(file);
  },

  // 7. ADMIN AUTHENTICATION
  async adminLogin(email, password) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
      } catch (err) {
        console.warn('Supabase auth failed:', err.message);
        throw err;
      }
    }

    // Local engine demo credentials check
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin@horrortrivia.com' || cleanEmail === 'organizer@horrortrivia.com' || password.length >= 6) {
      const mockSession = {
        email: cleanEmail,
        token: 'horror-admin-token-' + Date.now(),
        logged_in_at: new Date().toISOString()
      };
      setLocalItem(STORAGE_KEYS.ADMIN_SESSION, mockSession);
      return { success: true, user: { email: cleanEmail }, session: mockSession };
    }

    throw new Error('Invalid organizer credentials. (Demo login: admin@horrortrivia.com / any 6+ char password)');
  },

  async adminLogout() {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  async getAdminSession() {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) return data.session;
      } catch (e) {}
    }
    return getLocalItem(STORAGE_KEYS.ADMIN_SESSION, null);
  },

  // 8. RESET GAME (Protected with Confirmation)
  async resetGame() {
    if (isSupabaseConfigured) {
      try {
        // Delete round sessions, submissions and participants
        await supabase.from('round_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('game_settings').update({
          game_status: 'waiting',
          current_round: 1,
          answers_revealed: false,
          updated_at: new Date().toISOString()
        }).eq('id', 1);
      } catch (e) {
        console.warn('Supabase reset failed:', e);
      }
    }

    setLocalItem(STORAGE_KEYS.ROUND_SESSIONS, []);
    setLocalItem(STORAGE_KEYS.SUBMISSIONS, []);
    setLocalItem(STORAGE_KEYS.PARTICIPANTS, []);
    setLocalItem(STORAGE_KEYS.SETTINGS, {
      id: 1,
      game_status: 'waiting',
      current_round: 1,
      total_rounds: 30,
      answers_revealed: false,
      updated_at: new Date().toISOString()
    });

    window.dispatchEvent(new CustomEvent('horror_game_reset'));
    return true;

  }
};
