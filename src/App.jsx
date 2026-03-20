import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from 'firebase/auth';
import {
    Heart, Send, Plus, X, Sparkles, Camera, Music, Coffee, Star,
    Image as ImageIcon, Youtube, Upload, Smile, Sticker, Sun,
    Cloud, Flower2, Moon, Bird, Facebook, HardDrive,
    ChevronLeft, ChevronRight, Trophy, Gem, Palmtree, ExternalLink,
    Zap, Cpu, Globe, Rocket, Link as LinkIcon
} from 'lucide-react';

// --- DÁN FIREBASE CONFIG MỚI CỦA BẠN VÀO ĐÂY ---
const firebaseConfig = {
  apiKey: "AIzaSyAMgZ_a-GnbVRz2qK8e0dJaxACmzeUbwl0",
  authDomain: "byebyethinhbui.firebaseapp.com",
  projectId: "byebyethinhbui",
  storageBucket: "byebyethinhbui.firebasestorage.app",
  messagingSenderId: "889166768561",
  appId: "1:889166768561:web:52d984aa2e2d3acd1e3590",
  measurementId: "G-W598S9DBW6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const NEON_COLORS = [
    'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]',
    'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
];

const MESSAGES_PER_PAGE = 8;

const ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
};

const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
};

const App = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const fileInputRef = useRef(null);

    const [newMsg, setNewMsg] = useState({
        sender: '', content: '', colorIndex: 0, imageUrl: '',
        videoUrl: '', driveUrl: '', facebookUrl: ''
    });

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        signInAnonymously(auth).catch(err => console.error("Login Error:", err));
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const msgCollection = collection(db, 'messages'); 
        const unsubscribe = onSnapshot(msgCollection, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height, maxDim = 1000;
                if (width > height) { if (width > maxDim) { height *= maxDim / width; width = maxDim; } }
                else { if (height > maxDim) { width *= maxDim / height; height = maxDim; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                setNewMsg(prev => ({ ...prev, imageUrl: canvas.toDataURL('image/jpeg', 0.8) }));
            };
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMsg.sender.trim() || !newMsg.content.trim()) return;
        if (!user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const msgCollection = collection(db, 'messages');
            await addDoc(msgCollection, { ...newMsg, userId: user.uid, createdAt: serverTimestamp() });
            setNewMsg({
                sender: '', content: '', colorIndex: Math.floor(Math.random() * NEON_COLORS.length),
                imageUrl: '', videoUrl: '', driveUrl: '', facebookUrl: ''
            });
            setIsModalOpen(false);
            setCurrentPage(0);
        } catch (err) { 
            console.error(err);
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);
    const currentMessages = messages.slice(currentPage * MESSAGES_PER_PAGE, (currentPage + 1) * MESSAGES_PER_PAGE);

    return (
        <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 flex items-start justify-center font-['Be_Vietnam_Pro',sans-serif] overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <div className="relative w-full max-w-5xl flex flex-col items-center">
                
                {/* Header Section */}
                <header className="w-full text-center space-y-6 mb-12 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
                        <Zap size={14} /> New Journey Begins
                    </div>
                    
                    <h1 className="text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 leading-tight py-2">
                        Bye Bye <br className="md:hidden" /> Thịnh Bùi
                    </h1>
                    
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">
                        "Phía sau là kỷ niệm, phía trước là bầu trời..."
                    </p>

                    <div className="flex justify-center mt-10">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative bg-slate-900/40 backdrop-blur-xl p-2 rounded-3xl border border-white/10 flex items-center justify-center p-4">
                                <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 border-blue-500/30">
                                    <img src="/avatar.jpg" alt="Thịnh Bùi" className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-110" />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20 whitespace-nowrap">
                                THE HERO: THỊNH BÙI
                            </div>
                        </div>
                    </div>
                </header>

                {/* Controls */}
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-6">
                        <div className="text-left">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Memories</p>
                            <p className="text-3xl font-black text-white">{messages.length}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                        <div className="flex -space-x-3">
                            {Array.from({length: 4}).map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 transform transition-all active:scale-95 group">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" /> GỬI LỜI NHẮN
                    </button>
                </div>

                {/* Grid Section */}
                <div className="w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold tracking-widest">INITIALIZING MEMORIES...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {currentMessages.map((msg, idx) => (
                                <div key={msg.id} onClick={() => setSelectedMsg(msg)} className={`group relative bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border-2 transition-all hover:-translate-y-2 cursor-pointer h-full flex flex-col ${NEON_COLORS[msg.colorIndex || 0]}`}>
                                    {msg.imageUrl && (
                                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-white/10">
                                            <img src={msg.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-slate-200 text-sm leading-relaxed line-clamp-4 font-medium italic">
                                            "{msg.content}"
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-black">
                                                {msg.sender?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-white truncate max-w-[80px]">{msg.sender}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {msg.videoUrl && (
                                                getYoutubeEmbedUrl(msg.videoUrl) ? <Youtube size={14} className="text-red-500" /> : <LinkIcon size={14} className="text-cyan-400" />
                                            )}
                                            {msg.facebookUrl && <Facebook size={14} className="text-blue-500" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-16 flex items-center gap-8 mb-20">
                    <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 transition-all active:scale-90">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Page</p>
                        <p className="text-xl font-black text-white">{currentPage + 1} / {totalPages || 1}</p>
                    </div>
                    <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-20 transition-all active:scale-90">
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Footer decorations */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-12 opacity-10 pointer-events-none">
                    <Rocket size={100} /> <Cpu size={100} /> <Globe size={100} />
                </div>
            </div>

            {/* MODAL CHI TIẾT */}
            {selectedMsg && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row relative">
                        <button onClick={() => setSelectedMsg(null)} className="absolute top-6 right-6 z-50 p-3 bg-white/5 hover:bg-red-500 text-white rounded-full transition-all border border-white/10">
                            <X size={24} />
                        </button>
                        
                        {(selectedMsg.imageUrl || getYoutubeEmbedUrl(selectedMsg.videoUrl)) && (
                            <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-2">
                                {getYoutubeEmbedUrl(selectedMsg.videoUrl) ? 
                                    <iframe className="w-full aspect-video rounded-3xl" src={getYoutubeEmbedUrl(selectedMsg.videoUrl)} frameBorder="0" allowFullScreen></iframe> : 
                                    <img src={selectedMsg.imageUrl} className="max-w-full max-h-[80vh] object-contain rounded-3xl" />
                                }
                            </div>
                        )}
                        
                        <div className="flex-1 p-8 md:p-12 flex flex-col">
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest mb-6">
                                    <Star size={12} /> VERIFIED MESSAGE
                                </div>
                                <p className="text-2xl md:text-3xl text-slate-100 leading-relaxed font-bold italic">
                                    "{selectedMsg.content}"
                                </p>
                            </div>
                            
                            <div className="mt-auto pt-8 border-t border-white/5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-[1px]">
                                        <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white text-xl">
                                            {selectedMsg.sender?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-xl tracking-tight">{selectedMsg.sender}</p>
                                        <p className="text-xs text-blue-400 font-black uppercase tracking-widest">Inwave Community</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    {selectedMsg.videoUrl && (
                                        getYoutubeEmbedUrl(selectedMsg.videoUrl) ? (
                                            <a href={ensureAbsoluteUrl(selectedMsg.videoUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-red-500/10 text-red-500 px-5 py-2.5 rounded-xl text-xs font-bold border border-red-500/20">
                                                <Youtube size={16} /> Youtube Video
                                            </a>
                                        ) : (
                                            <a href={ensureAbsoluteUrl(selectedMsg.videoUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-cyan-500/10 text-cyan-500 px-5 py-2.5 rounded-xl text-xs font-bold border border-cyan-500/20">
                                                <LinkIcon size={16} /> Link đính kèm
                                            </a>
                                        )
                                    )}
                                    {selectedMsg.facebookUrl && <a href={ensureAbsoluteUrl(selectedMsg.facebookUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-5 py-2.5 rounded-xl text-xs font-bold border border-blue-100/20"><Facebook size={16} /> Facebook</a>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VIẾT CHÚC */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-slate-900 w-full max-w-lg p-8 md:p-10 shadow-3xl rounded-[2.5rem] border border-white/10 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                        
                        <div className="mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Gửi Kỷ Niệm</h3>
                            <p className="text-slate-500 text-sm">Lời chúc của bạn sẽ được lưu giữ mãi mãi.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tên của bạn</label>
                                <input required value={newMsg.sender} onChange={(e) => setNewMsg({ ...newMsg, sender: e.target.value })} placeholder="VD: Team Tech" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nội dung</label>
                                <textarea required rows="4" value={newMsg.content} onChange={(e) => setNewMsg({ ...newMsg, content: e.target.value })} placeholder="Viết điều gì đó thật Thịnh Bùi..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-medium italic resize-none"></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input value={newMsg.videoUrl} onChange={(e) => setNewMsg({ ...newMsg, videoUrl: e.target.value })} placeholder="Link đính kèm (Youtube, Tiktok, Link...)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-xs" />
                                <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-blue-400 text-xs font-bold hover:bg-white/10">
                                    <Upload size={14} /> TẢI ẢNH
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            </div>

                            <button disabled={isSubmitting} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN GỬI ❤️'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
