'use client';

import { useState, useEffect, useRef } from 'react';
import { useRealtime, playHospitalChime } from '@/hooks/useRealtime';
import { Volume2, VolumeX, Users, Radio, Clock, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

interface ServingPatient {
  tokenNumber: number | string;
  patientName: string;
  doctorName: string;
  room: string;
  calledAt: string;
}

export default function WaitingRoomTV() {
  const [currentServing, setCurrentServing] = useState<ServingPatient>({
    tokenNumber: 101,
    patientName: "Sunil Deshmukh",
    doctorName: "Dr. Rajesh Sharma",
    room: "Cabin 1 (General Medicine)",
    calledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const [upcomingList, setUpcomingList] = useState<any[]>([
    { tokenNumber: 102, patientName: "Aarti Kulkarni", status: "Waiting", time: "10:30 AM" },
    { tokenNumber: 103, patientName: "Mahesh Patil", status: "Arrived", time: "10:45 AM" },
    { tokenNumber: 104, patientName: "Pooja Gaikwad", status: "Waiting", time: "11:00 AM" },
    { tokenNumber: 105, patientName: "Rohan Shinde", status: "Waiting", time: "11:15 AM" }
  ]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [announcementText, setAnnouncementText] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial appointments for queue
  const fetchQueueData = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const waiting = data.filter((a: any) => 
          a.rawStatus !== "COMPLETED" && 
          a.status !== "Completed" && 
          a.rawStatus !== "CANCELLED"
        );
        if (waiting.length > 0) {
          setUpcomingList(waiting.slice(1, 7).map((a: any) => ({
            tokenNumber: a.tokenNumber,
            patientName: a.patient?.name || a.patientName || "Patient",
            status: a.status || "Waiting",
            time: a.time || "10:00 AM"
          })));
        }
      }
    } catch (e) {
      // Keep fallbacks
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Speak announcement using Web Speech API
  const speakAnnouncement = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Connect Real-Time SSE
  const { isConnected } = useRealtime({
    enableChime: soundEnabled,
    onEvent: (event) => {
      if (event.type === 'queue.next') {
        const payload = event.payload || {};
        const newServing: ServingPatient = {
          tokenNumber: payload.tokenNumber || '---',
          patientName: payload.patientName || 'Next Patient',
          doctorName: payload.doctorName || 'Consultant Doctor',
          room: payload.room || 'Cabin 1',
          calledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setCurrentServing(newServing);

        // Announce
        const announceMsg = `Token number ${newServing.tokenNumber}, ${newServing.patientName}, please visit ${newServing.room}`;
        setAnnouncementText(announceMsg);
        setTimeout(() => setAnnouncementText(null), 8000);

        if (soundEnabled) {
          playHospitalChime();
          setTimeout(() => speakAnnouncement(announceMsg), 800);
        }

        // Refresh upcoming
        fetchQueueData();
      }

      if (event.type === 'appointment.created' || event.type === 'patient.checked_in') {
        fetchQueueData();
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between select-none">
      {/* Top Header Bar for Waiting Room TV */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              City Care Multi-Speciality Hospital
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              OPD Waiting Lounge & Consultation Display
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
            </span>
          </div>

          <button 
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playHospitalChime();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              soundEnabled ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Audio Chime ON' : 'Muted'}</span>
          </button>

          <div className="flex items-center gap-2 text-xl font-black font-mono bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-indigo-400">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>{currentTime || "--:--:--"}</span>
          </div>
        </div>
      </header>

      {/* Announcement Banner */}
      {announcementText && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-3 px-8 text-center text-lg font-black tracking-wide uppercase shadow-lg animate-pulse">
          📢 {announcementText}
        </div>
      )}

      {/* Main Screen Content Grid */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Col (7/12): NOW SERVING MAIN HERO DISPLAY */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 rounded-3xl border-2 border-indigo-500/30 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0" />
          
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 text-lg font-black tracking-widest uppercase">
                NOW SERVING • सध्या तपासणी
              </span>
            </div>
            <span className="bg-indigo-900/60 text-indigo-300 text-sm font-bold px-3 py-1 rounded-lg border border-indigo-700/50">
              Called at: {currentServing.calledAt}
            </span>
          </div>

          <div className="my-8 text-center z-10">
            <p className="text-slate-400 uppercase tracking-widest font-black text-sm mb-2">Token Number</p>
            <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-indigo-300 tracking-tight drop-shadow-2xl">
              #{currentServing.tokenNumber}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
              {currentServing.patientName}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 rounded-2xl p-6 border border-slate-800 z-10 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Consultant Doctor</p>
              <p className="text-xl font-black text-indigo-300 mt-1">{currentServing.doctorName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Proceed To</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{currentServing.room}</p>
            </div>
          </div>
        </div>

        {/* Right Col (5/12): UPCOMING TOKENS QUEUE */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h3 className="text-lg font-black tracking-wide text-slate-200 flex items-center gap-3 uppercase">
              <Users className="w-5 h-5 text-indigo-400" />
              Next In Queue • पुढील रांग
            </h3>
            <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
              {upcomingList.length} Waiting
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {upcomingList.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="w-14 h-14 rounded-xl bg-slate-800 text-white font-black text-xl flex items-center justify-center border border-slate-700">
                    #{item.tokenNumber}
                  </span>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-snug">{item.patientName}</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Appt: {item.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                  item.status === 'Arrived' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}

            {upcomingList.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 font-bold">
                <CheckCircle2 className="w-12 h-12 text-slate-700 mb-3" />
                No patients currently waiting in queue.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Ticker */}
      <footer className="bg-slate-900 border-t border-slate-800 px-8 py-3 flex items-center justify-between text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Please have your Aadhaar Card / Token Slip ready before entering the consulting cabin.</span>
        </div>
        <div>ClinicOS Smart Hospital Display v2.5</div>
      </footer>
    </div>
  );
}
