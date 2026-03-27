import { useState, useEffect, useRef } from 'react';
import {
  UserCheck, ShieldAlert, Camera, ArrowRight,
  Clock, CheckCircle2, FileText, CheckSquare,
  UserPlus, Maximize, Minimize, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { cn } from '../lib/utils';

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface CheatingLog {
  time: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
}

const EXAM_QUESTIONS: ExamQuestion[] = [
  { id: 1, question: 'What is the capital of Rwanda?',                           options: ['Kigali', 'Butare', 'Gisenyi', 'Musanze'],              correct: 0 },
  { id: 2, question: 'Which of these is a famous national park in Rwanda?',      options: ['Serengeti', 'Akagera', 'Kruger', 'Maasai Mara'],       correct: 1 },
  { id: 3, question: 'What is the primary language spoken in Rwanda?',           options: ['Swahili', 'French', 'Kinyarwanda', 'English'],         correct: 2 },
  { id: 4, question: 'Rwanda is known as the land of a thousand...?',            options: ['Lakes', 'Hills', 'Rivers', 'Mountains'],               correct: 1 },
];

const ProctorAI = () => {
  const [step, setStep]                         = useState<'login' | 'setup' | 'verify' | 'exam' | 'report'>('login');
  const [user, setUser]                         = useState({ name: '', id: '' });
  const [flags, setFlags]                       = useState(0);
  const [status, setStatus]                     = useState<'green' | 'red'>('green');
  const [message, setMessage]                   = useState('System Ready. Please center your face.');
  const webcamRef                               = useRef<Webcam>(null);
  const [faceLandmarker, setFaceLandmarker]     = useState<FaceLandmarker | null>(null);
  const [referenceLandmarks, setReferenceLandmarks] = useState<any>(null);
  const [logs, setLogs]                         = useState<CheatingLog[]>([]);
  const [examTime, setExamTime]                 = useState(300);
  const [currentQuestion, setCurrentQuestion]   = useState(0);
  const [answers, setAnswers]                   = useState<Record<number, number>>({});
  const [isFullscreen, setIsFullscreen]         = useState(false);
  const [nosePos, setNosePos]                   = useState<{ x: number; y: number } | null>(null);

  const gazeTimerRef  = useRef<number | null>(null);
  const mouthTimerRef = useRef<number | null>(null);
  const requestRef    = useRef<number | null>(null);

  // Tab / Fullscreen listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && step === 'exam') { addLog('Tab Switch Detected', 'high'); setFlags(f => f + 1); }
    };
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull && step === 'exam') { addLog('Exited Fullscreen Mode', 'high'); setFlags(f => f + 1); }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [step]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  const addLog = (type: string, severity: 'low' | 'medium' | 'high') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), type, severity }, ...prev]);
  };

  // Suppress TFLite logs
  useEffect(() => {
    const orig = { info: console.info, log: console.log, warn: console.warn, error: console.error };
    const filter = (...args: any[]) => {
      const msg = args[0];
      return !(typeof msg === 'string' && (msg.includes('TensorFlow Lite XNNPACK delegate') || msg.includes('delegate for CPU') || msg.includes('INFO: Created')));
    };
    console.info  = (...a) => { if (filter(...a)) orig.info(...a); };
    console.log   = (...a) => { if (filter(...a)) orig.log(...a); };
    console.warn  = (...a) => { if (filter(...a)) orig.warn(...a); };
    console.error = (...a) => { if (filter(...a)) orig.error(...a); };
    return () => Object.assign(console, orig);
  }, []);

  // Init Mediapipe
  useEffect(() => {
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        const face = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate: 'GPU' },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 2,
        });
        setFaceLandmarker(face);
      } catch (err) {
        console.error('Failed to initialize Mediapipe:', err);
      }
    })();
  }, []);

  const processResults = (faceResult: FaceLandmarkerResult) => {
    let currentStatus: 'green' | 'red' = 'green';
    let currentMessage = 'Monitoring... All systems clear.';

    if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) {
      setNosePos(null);
      if (step === 'exam') { addLog('Student left the frame', 'medium'); setFlags(f => f + 1); }
      setStatus('red'); setMessage('No face detected!'); return;
    }
    if (faceResult.faceLandmarks.length > 1) {
      currentStatus = 'red'; currentMessage = 'Multiple people detected!';
      if (step === 'exam') { addLog('Multiple people in frame', 'high'); setFlags(f => f + 1); }
    }

    const landmarks   = faceResult.faceLandmarks[0];
    const blendshapes = faceResult.faceBlendshapes?.[0]?.categories || [];
    const noseLandmark = landmarks[1];
    setNosePos({ x: noseLandmark.x, y: noseLandmark.y });

    // Gaze tracking
    const leftEye = landmarks[33], rightEye = landmarks[263], nose = landmarks[1];
    const eyeCenter = (leftEye.x + rightEye.x) / 2;
    const horizontalOffset = Math.abs(nose.x - eyeCenter);
    const verticalOffset   = Math.abs(landmarks[1].y - (landmarks[33].y + landmarks[263].y) / 2);
    if (horizontalOffset > 0.18 || verticalOffset > 0.18) {
      if (!gazeTimerRef.current) { gazeTimerRef.current = Date.now(); }
      else if (Date.now() - gazeTimerRef.current > 3000) {
        if (step === 'exam') { addLog('Looking away from screen', 'medium'); setFlags(f => f + 1); }
        gazeTimerRef.current = null; setStatus('red'); setMessage('Please look at the screen!'); return;
      }
      currentStatus = 'red'; currentMessage = 'Looking away detected.';
    } else { gazeTimerRef.current = null; }

    // Mouth / talking
    const jawOpen = blendshapes.find(b => b.categoryName === 'jawOpen')?.score || 0;
    if (jawOpen > 0.3) {
      if (!mouthTimerRef.current) { mouthTimerRef.current = Date.now(); }
      else if (Date.now() - mouthTimerRef.current > 2000) {
        if (step === 'exam') { addLog('Talking detected', 'medium'); setFlags(f => f + 1); }
        mouthTimerRef.current = null; setStatus('red'); setMessage('Suspicious behavior: Talking detected!'); return;
      }
    } else { mouthTimerRef.current = null; }

    // Head tilt
    const headTilt = Math.abs(landmarks[1].y - (landmarks[33].y + landmarks[263].y) / 2);
    if (headTilt > 0.25) {
      if (step === 'exam') { addLog('Head tilted down (Possible phone use)', 'medium'); setFlags(f => f + 1); }
      currentStatus = 'red'; currentMessage = 'Please keep your head up!';
    }

    setStatus(currentStatus); setMessage(currentMessage);
  };

  const detect = async () => {
    if (webcamRef.current?.video?.readyState === 4 && faceLandmarker) {
      const video = webcamRef.current.video!;
      processResults(faceLandmarker.detectForVideo(video, performance.now()));
    }
    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    if (step === 'verify' || step === 'exam') { requestRef.current = requestAnimationFrame(detect); }
    else { if (requestRef.current) cancelAnimationFrame(requestRef.current); }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [step, faceLandmarker]);

  // Timer
  useEffect(() => {
    let timer: any;
    if (step === 'exam' && examTime > 0) { timer = setInterval(() => setExamTime(t => t - 1), 1000); }
    else if (examTime === 0) { setStep('report'); }
    return () => clearInterval(timer);
  }, [step, examTime]);

  const handleVerify = () => {
    if (webcamRef.current && faceLandmarker) {
      const video = webcamRef.current.video;
      if (video && video.readyState === 4) {
        const result = faceLandmarker.detectForVideo(video, performance.now());
        if (result.faceLandmarks?.length > 0) {
          setReferenceLandmarks(result.faceLandmarks[0]);
          setStep('exam');
          addLog('Identity Verified', 'low');
          if (!document.fullscreenElement) toggleFullscreen();
        } else { setMessage('Face not detected. Please center your face.'); }
      }
    }
  };

  const calculateScore = () => {
    let correct = 0;
    EXAM_QUESTIONS.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    return (correct / EXAM_QUESTIONS.length) * 100;
  };

  if (flags >= 10) {
    return (
      <div className="max-w-xl mx-auto glass p-8 md:p-12 rounded-2xl md:rounded-3xl text-center space-y-4 md:space-y-6 px-4">
        <ShieldAlert className="w-16 h-16 md:w-20 md:h-20 text-red-500 mx-auto" />
        <h2 className="text-2xl md:text-3xl font-bold text-red-500">EXAM TERMINATED</h2>
        <p className="text-white/60 text-sm md:text-base">Excessive integrity violations detected. Your session has been logged and reported.</p>
        <button onClick={() => window.location.reload()} className="bg-white/10 px-8 py-3 rounded-xl hover:bg-white/20 transition-all text-sm md:text-base">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass p-4 md:p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg"><UserCheck className="w-6 h-6 text-green-400" /></div>
          <div>
            <h2 className="text-xl font-bold">Proctor AI</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest">Secure Examination Environment</p>
          </div>
        </div>
        {step === 'exam' && (
          <div className="flex items-center gap-6">
            <button onClick={toggleFullscreen} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all" title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
              {isFullscreen ? <Minimize className="w-5 h-5 text-blue-400" /> : <Maximize className="w-5 h-5 text-blue-400" />}
            </button>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className={cn('font-mono text-xl', examTime < 60 ? 'text-red-500 animate-pulse' : 'text-white')}>
                {Math.floor(examTime / 60)}:{(examTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <ShieldAlert className={cn('w-4 h-4', flags > 0 ? 'text-red-400' : 'text-green-400')} />
              <span className="text-sm font-bold">Flags: {flags}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative aspect-square bg-black rounded-3xl overflow-hidden border-4 transition-colors duration-500"
            style={{ borderColor: status === 'green' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.5)' }}>
            {(step === 'verify' || step === 'exam') ? (
              <>
                <Webcam ref={webcamRef} className="w-full h-full object-cover" audio={false} screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }} disablePictureInPicture mirrored={false} />
                <div className="absolute inset-0 border-2 border-white/10 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={cn('w-56 h-72 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-between py-4 relative', status === 'green' ? 'border-blue-400/50' : 'border-red-500 animate-pulse')}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Keep Face Centered</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400/20 border border-blue-400/40" />
                    <div className="flex-1" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Do Not Look Away</div>
                  </div>
                  {nosePos && (
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-75"
                      style={{ left: `${nosePos.x * 100}%`, top: `${nosePos.y * 100}%`, transform: 'translate(-50%,-50%)' }} />
                  )}
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  <div className={cn('w-2 h-2 rounded-full animate-pulse', status === 'green' ? 'bg-green-500' : 'bg-red-500')} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{status === 'green' ? 'Live' : 'Alert'}</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-4 bg-white/5">
                <Camera className="w-12 h-12 text-white/10" />
                <p className="text-white/20 text-sm">Camera Offline</p>
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Integrity Logs
            </h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
              {logs.length === 0
                ? <p className="text-xs text-white/20 italic">No events logged yet.</p>
                : logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                    <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', log.severity === 'high' ? 'bg-red-500' : log.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500')} />
                    <div className="flex-1">
                      <p className="font-bold">{log.type}</p>
                      <p className="text-white/40">{log.time}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Main content column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass p-8 md:p-12 rounded-3xl space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-blue-400" /></div>
                  <h2 className="text-3xl font-bold">Student Login</h2>
                  <p className="text-white/40">Enter your credentials to access the secure exam.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Full Name</label>
                    <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} placeholder="e.g. John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Student ID</label>
                    <input type="text" value={user.id} onChange={(e) => setUser({ ...user, id: e.target.value })} placeholder="e.g. STU-12345" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </div>
                <button onClick={() => user.name && user.id && setStep('setup')} disabled={!user.name || !user.id} className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all">
                  Access Exam Portal
                </button>
              </motion.div>
            )}

            {step === 'setup' && (
              <motion.div key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass p-8 md:p-12 rounded-3xl space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Exam Readiness Check</h2>
                  <p className="text-white/60">Please ensure you are in a quiet, well-lit room.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <UserPlus className="w-6 h-6 text-blue-400" /><h4 className="font-bold">Face Verification</h4>
                    <p className="text-xs text-white/40">We will verify your identity against your registered profile.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <ShieldAlert className="w-6 h-6 text-yellow-400" /><h4 className="font-bold">Integrity Monitoring</h4>
                    <p className="text-xs text-white/40">Gaze tracking, mouth detection, and tab-locking are active.</p>
                  </div>
                </div>
                <button onClick={() => setStep('verify')} disabled={!faceLandmarker} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3">
                  {faceLandmarker ? 'Proceed to Verification' : 'Loading AI Models...'}<ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass p-8 md:p-12 rounded-3xl text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Identity Verification</h2>
                  <p className="text-white/60">Please look directly into the camera and keep your face within the guide.</p>
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center"><UserCheck className="w-12 h-12 text-blue-400" /></div>
                </div>
                <button onClick={handleVerify} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition-all">Verify & Start Exam</button>
              </motion.div>
            )}

            {step === 'exam' && (
              <motion.div key="exam" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass p-8 md:p-12 rounded-3xl space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center gap-3"><FileText className="text-blue-400" /> Rwanda General Knowledge</h2>
                  <span className="text-sm text-white/40">Question {currentQuestion + 1} of {EXAM_QUESTIONS.length}</span>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-medium">{EXAM_QUESTIONS[currentQuestion].question}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {EXAM_QUESTIONS[currentQuestion].options.map((opt, i) => (
                      <button key={i} onClick={() => setAnswers({ ...answers, [EXAM_QUESTIONS[currentQuestion].id]: i })}
                        className={cn('w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between group',
                          answers[EXAM_QUESTIONS[currentQuestion].id] === i ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 hover:bg-white/10')}>
                        <span>{opt}</span>
                        {answers[EXAM_QUESTIONS[currentQuestion].id] === i && <CheckSquare className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-8 border-t border-white/10">
                  <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(q => q - 1)} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">Previous</button>
                  {currentQuestion === EXAM_QUESTIONS.length - 1
                    ? <button onClick={() => setStep('report')} className="px-8 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold transition-all">Submit Exam</button>
                    : <button onClick={() => setCurrentQuestion(q => q + 1)} className="px-8 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all">Next</button>
                  }
                </div>
              </motion.div>
            )}

            {step === 'report' && (
              <motion.div key="report" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 md:p-12 rounded-3xl space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-400" /></div>
                  <h2 className="text-3xl font-bold">Exam Completed</h2>
                  <p className="text-white/40">Your session has been analyzed by Proctor AI.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Performance</h4>
                    <div className="flex items-end gap-2"><span className="text-4xl font-bold">{calculateScore()}%</span><span className="text-white/40 mb-1">Score</span></div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${calculateScore()}%` }} className="h-full bg-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Integrity Status</h4>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-3 h-3 rounded-full', flags < 3 ? 'bg-green-500' : flags < 6 ? 'bg-yellow-500' : 'bg-red-500')} />
                      <span className="text-xl font-bold">{flags < 3 ? 'Verified' : flags < 6 ? 'Suspicious' : 'Flagged'}</span>
                    </div>
                    <p className="text-xs text-white/40">{flags} total integrity events detected during the session.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Behavioral Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Identity Verification</span><span className="text-green-400">SUCCESS</span></div>
                    <div className="flex justify-between text-sm"><span>Eye Tracking Consistency</span><span className={flags < 3 ? 'text-green-400' : 'text-yellow-400'}>{flags < 3 ? 'HIGH' : 'MODERATE'}</span></div>
                    <div className="flex justify-between text-sm"><span>Browser Locking</span><span className={logs.some(l => l.type.includes('Tab')) ? 'text-red-400' : 'text-green-400'}>{logs.some(l => l.type.includes('Tab')) ? 'VIOLATION' : 'SECURE'}</span></div>
                  </div>
                </div>
                <button onClick={() => window.location.reload()} className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold transition-all">Finish & Close</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProctorAI;
