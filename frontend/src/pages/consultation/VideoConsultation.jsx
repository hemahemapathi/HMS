import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, Phone, Send, FileText } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';

const VideoConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [notes, setNotes] = useState('');
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [lastActivity, setLastActivity] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchAppointment();
    initializeSocket();
    initializeMedia();
    
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.emit('leave-consultation', appointmentId);
        socketRef.current.disconnect();
      }
    };
  }, [appointmentId]);

  const initializeSocket = () => {
    socketRef.current = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionStatus('Connected via WebSocket');
      setLastActivity('Connected to server');
      socketRef.current.emit('join-consultation', appointmentId);
    });

    socketRef.current.on('user-joined', (userId) => {
      console.log('User joined:', userId);
      setLastActivity('Another user joined the consultation');
      createOffer();
    });

    socketRef.current.on('offer', async (data) => {
      console.log('Received offer');
      setLastActivity('Received video call offer');
      await createAnswer(data.offer);
    });

    socketRef.current.on('answer', async (data) => {
      console.log('Received answer');
      setLastActivity('Video call connected');
      await peerConnectionRef.current.setRemoteDescription(data.answer);
    });

    socketRef.current.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate');
      setLastActivity('Establishing connection...');
      await peerConnectionRef.current.addIceCandidate(data.candidate);
    });

    socketRef.current.on('chat-message', (data) => {
      setLastActivity(`New message from ${data.sender}`);
      setChatMessages(prev => [...prev, data]);
      if (data.sender !== user.name) {
        showNotification(`New message from ${data.sender}`, 'info');
      }
    });

    socketRef.current.on('user-left', () => {
      console.log('User left consultation');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
  };

  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(configuration);

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          appointmentId,
          candidate: event.candidate
        });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
    }
  };

  const createOffer = async () => {
    initializePeerConnection();
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    
    socketRef.current.emit('offer', {
      appointmentId,
      offer
    });
  };

  const createAnswer = async (offer) => {
    initializePeerConnection();
    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    
    socketRef.current.emit('answer', {
      appointmentId,
      answer
    });
  };

  const fetchAppointment = async () => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      setAppointment(response.data.appointment);
      setChatMessages(response.data.appointment.chatMessages || []);
      setNotes(response.data.appointment.consultationNotes || '');
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      localStreamRef.current = stream;
      
      // Set stream for both desktop and mobile video elements
      const videoElements = document.querySelectorAll('video[data-local="true"]');
      videoElements.forEach(video => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch(console.error);
        };
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch(console.error);
        };
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      showNotification('Camera access denied. Please allow camera permissions.', 'error');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      appointmentId,
      sender: user.name,
      senderRole: user.role,
      message: chatMessage,
      timestamp: new Date()
    };

    socketRef.current.emit('chat-message', newMessage);
    
    try {
      await api.post(`/appointments/${appointmentId}/chat`, newMessage);
      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const saveNotes = async () => {
    try {
      await api.put(`/appointments/${appointmentId}/notes`, { notes });
      const saveBtn = document.querySelector('.save-notes-btn');
      if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.classList.add('btn-success');
        saveBtn.classList.remove('btn-outline-primary');
        setTimeout(() => {
          saveBtn.textContent = originalText;
          saveBtn.classList.remove('btn-success');
          saveBtn.classList.add('btn-outline-primary');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const autoSaveNotes = async () => {
    if (notes.trim() && user.role === 'doctor') {
      try {
        await api.put(`/appointments/${appointmentId}/notes`, { notes });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  const handleNotesChange = (value) => {
    setNotes(value);
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    setAutoSaveTimer(setTimeout(autoSaveNotes, 2000));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const endConsultation = async () => {
    try {
      await api.put(`/appointments/${appointmentId}/complete`, { 
        consultationNotes: notes,
        chatMessages 
      });
      
      // Create health record entry
      if (notes.trim()) {
        await api.post('/health-records', {
          appointmentId,
          patientId: appointment.patient._id,
          doctorId: appointment.doctor._id,
          consultationNotes: notes,
          date: new Date().toISOString()
        });
      }
      
      showNotification('Consultation completed successfully!', 'success');
      setTimeout(() => {
        navigate(user.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments');
      }, 2000);
    } catch (error) {
      console.error('Error ending consultation:', error);
      showNotification('Failed to complete consultation', 'error');
    }
  };

  return (
    <div className="consultation-container" style={{ height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Check if appointment is completed */}
      {appointment && appointment.status === 'completed' ? (
        <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh', background: '#f8f9fa' }}>
          <div className="text-center">
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✅</div>
            <h3 className="text-success mb-3">Consultation Completed</h3>
            <p className="text-muted mb-4">This consultation has already been completed.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(user.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments')}
            >
              Back to Appointments
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="d-md-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000' }}>
            {/* Mobile Video Full Screen */}
            <div style={{ position: 'relative', height: '100%' }}>
              <video 
                ref={remoteVideoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                autoPlay
                playsInline
              />
              
              {/* Waiting State */}
              <div className="text-center text-white" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👨⚕️</div>
                <h4>Connecting...</h4>
                <p>Dr. {appointment?.doctor?.name}</p>
              </div>
              
              {/* Top Status Bar */}
              <div className="d-flex justify-content-between align-items-center" style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                padding: '15px 20px',
                color: 'white'
              }}>
                <div>
                  <small>🔴 Live</small>
                </div>
                <div className="text-center">
                  <small>{new Date().toLocaleTimeString()}</small>
                </div>
                <div>
                  <small>🔗 Connected</small>
                </div>
              </div>
              
              {/* Mobile Local Video PIP */}
              <div style={{
                position: 'absolute',
                top: '60px',
                right: '15px',
                width: '100px',
                height: '130px',
                borderRadius: '15px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <video 
                  data-local="true"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  autoPlay
                  playsInline
                  muted
                />
                <div style={{
                  position: 'absolute',
                  bottom: '3px',
                  left: '5px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '1px 4px',
                  borderRadius: '5px',
                  fontSize: '8px'
                }}>
                  You
                </div>
              </div>
              
              {/* Bottom Controls */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
                padding: '30px 20px'
              }}>
                {/* Control Buttons */}
                <div className="d-flex justify-content-center mb-3" style={{ gap: '20px' }}>
                  <button 
                    className={`btn rounded-circle ${isVideoOn ? 'btn-light' : 'btn-danger'}`}
                    onClick={toggleVideo}
                    style={{ width: '60px', height: '60px', border: '3px solid rgba(255,255,255,0.3)' }}
                  >
                    {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                  </button>
                  
                  <button 
                    className={`btn rounded-circle ${isAudioOn ? 'btn-light' : 'btn-danger'}`}
                    onClick={toggleAudio}
                    style={{ width: '60px', height: '60px', border: '3px solid rgba(255,255,255,0.3)' }}
                  >
                    {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
                  </button>
                  
                  <button 
                    className="btn btn-danger rounded-circle"
                    onClick={endConsultation}
                    style={{ width: '60px', height: '60px', border: '3px solid rgba(255,255,255,0.3)' }}
                  >
                    <Phone size={24} />
                  </button>
                </div>
                
                {/* Chat Toggle */}
                <div className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <button 
                      className="btn btn-dark btn-sm rounded-pill px-4"
                      onClick={() => document.getElementById('mobileChat').classList.toggle('d-none')}
                      style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      💬 Chat ({chatMessages.length})
                    </button>
                    {user.role === 'doctor' && (
                      <button 
                        className="btn btn-dark btn-sm rounded-pill px-4"
                        onClick={() => document.getElementById('mobileNotes').classList.toggle('d-none')}
                        style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                      >
                        📝 Notes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Chat Overlay */}
            <div id="mobileChat" className="d-none" style={{
              position: 'fixed',
              bottom: '0',
              left: '0',
              right: '0',
              height: '50vh',
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              borderRadius: '20px 20px 0 0',
              color: 'white'
            }}>
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
                <h6 className="mb-0">💬 Messages</h6>
                <button 
                  className="btn btn-sm btn-outline-light rounded-circle"
                  onClick={() => document.getElementById('mobileChat').classList.add('d-none')}
                  style={{ width: '30px', height: '30px' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ height: 'calc(50vh - 120px)', overflowY: 'auto', padding: '15px' }}>
                {chatMessages.map((msg, index) => (
                  <div key={index} className="mb-3">
                    <div className={`p-2 rounded-3 ${msg.senderRole === user.role ? 'bg-primary ms-auto' : 'bg-secondary'}`} style={{ maxWidth: '80%', display: 'inline-block' }}>
                      <small className="fw-bold">{msg.sender}</small>
                      <div>{msg.message}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-top border-secondary">
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary me-2"
                    placeholder="Type message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Notes Overlay - Doctor Only */}
            {user.role === 'doctor' && (
              <div id="mobileNotes" className="d-none" style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                right: '0',
                height: '60vh',
                background: 'rgba(0,0,0,0.95)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                borderRadius: '20px 20px 0 0',
                color: 'white'
              }}>
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
                  <h6 className="mb-0">📝 Consultation Notes</h6>
                  <button 
                    className="btn btn-sm btn-outline-light rounded-circle"
                    onClick={() => document.getElementById('mobileNotes').classList.add('d-none')}
                    style={{ width: '30px', height: '30px' }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ height: 'calc(60vh - 120px)', padding: '15px' }}>
                  <textarea
                    className="form-control bg-dark text-white border-secondary"
                    rows="10"
                    placeholder="✍️ Add your consultation notes here..."
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      resize: 'none',
                      height: '100%'
                    }}
                  />
                </div>
                
                <div className="p-3 border-top border-secondary">
                  <button 
                    className="btn btn-warning w-100 save-notes-btn" 
                    onClick={saveNotes}
                  >
                    💾 Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="d-none d-md-block">
            {/* Top Header Bar */}
            <div className="consultation-header" style={{ 
              background: 'rgba(0,0,0,0.8)', 
              color: 'white', 
              padding: '15px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <h5 className="mb-0">🏥 HMS Video Consultation</h5>
                  <small>Dr. {appointment?.doctor?.name} & {appointment?.patient?.name}</small>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <div className="status-indicators d-flex gap-2">
                  <span className="badge bg-success px-3 py-2">
                    🔗 {connectionStatus}
                  </span>
                  <span className="badge bg-info px-3 py-2">
                    ⚡ {lastActivity || 'Ready'}
                  </span>
                </div>
                
                <div className="consultation-time">
                  <small>📅 {new Date().toLocaleTimeString()}</small>
                </div>
              </div>
            </div>

            {/* Main Video Area */}
            <div className="video-consultation-main d-flex" style={{ height: 'calc(100vh - 80px)' }}>
              
              {/* Video Section */}
              <div className="video-section" style={{ 
                width: '70%', 
                position: 'relative',
                background: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column'
              }}>
                
                {/* Remote Video - Main */}
                <div className="remote-video-container" style={{ 
                  flex: 1, 
                  position: 'relative',
                  background: 'linear-gradient(45deg, #2c3e50, #34495e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <video 
                    ref={remoteVideoRef}
                    className="remote-video"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      borderRadius: '10px',
                      margin: '10px'
                    }}
                    autoPlay
                    playsInline
                  />
                  
                  {/* Remote Video Placeholder */}
                  <div className="remote-placeholder" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👨⚕️</div>
                    <h4>Waiting for other participant...</h4>
                    <p>Share this consultation link to connect</p>
                  </div>
                </div>
                
                {/* Local Video - Picture in Picture */}
                <div className="local-video-pip" style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  width: '250px',
                  height: '180px',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  border: '3px solid #fff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                  <video 
                    ref={localVideoRef}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="pip-label" style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}>
                    You
                  </div>
                </div>
                
                {/* Desktop Video Controls */}
                <div className="video-controls" style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '15px',
                  background: 'rgba(0,0,0,0.8)',
                  padding: '15px 25px',
                  borderRadius: '50px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <button 
                    className={`btn btn-lg rounded-circle ${isVideoOn ? 'btn-light' : 'btn-danger'}`}
                    onClick={toggleVideo}
                    style={{ width: '60px', height: '60px' }}
                  >
                    {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                  </button>
                  
                  <button 
                    className={`btn btn-lg rounded-circle ${isAudioOn ? 'btn-light' : 'btn-danger'}`}
                    onClick={toggleAudio}
                    style={{ width: '60px', height: '60px' }}
                  >
                    {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
                  </button>
                  
                  <button 
                    className="btn btn-danger btn-lg rounded-circle"
                    onClick={endConsultation}
                    style={{ width: '60px', height: '60px' }}
                  >
                    <Phone size={24} />
                  </button>
                </div>
              </div>

              {/* Chat & Notes Sidebar */}
              <div className="chat-sidebar" style={{
                width: '30%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid #ddd'
              }}>
                
                {/* Sidebar Header */}
                <div className="sidebar-header" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <h6 className="mb-2">💬 Live Consultation</h6>
                  <div className="d-flex justify-content-center gap-2">
                    <span className="badge bg-light text-dark">📹 WebRTC</span>
                    <span className="badge bg-light text-dark">⚡ Real-time</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages" style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  background: '#f8f9fa'
                }}>
                  <h6 className="text-primary mb-3">💬 Chat Messages</h6>
                  <div className="messages-container">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`message mb-3 ${msg.senderRole === user.role ? 'text-end' : ''}`}>
                        <div className={`d-inline-block p-3 rounded-3 ${msg.senderRole === user.role ? 'bg-primary text-white' : 'bg-white border shadow-sm'}`} style={{ maxWidth: '80%' }}>
                          <div className="fw-bold mb-1">
                            {msg.senderRole === 'doctor' ? '👨⚕️' : '👤'} {msg.sender}
                          </div>
                          <div>{msg.message}</div>
                          <small className="opacity-75 d-block mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Input */}
                <div className="chat-input" style={{ padding: '20px', borderTop: '1px solid #ddd' }}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="💬 Type your message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      style={{ borderRadius: '25px 0 0 25px' }}
                    />
                    <button 
                      className="btn btn-primary btn-lg" 
                      onClick={sendMessage}
                      style={{ borderRadius: '0 25px 25px 0' }}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>

                {/* Notes Section - Doctor Only */}
                {user.role === 'doctor' && (
                  <div className="notes-section" style={{ padding: '20px', borderTop: '1px solid #ddd', background: '#fff3cd' }}>
                    <h6 className="text-warning mb-3">
                      <FileText size={20} className="me-2" />
                      📝 Consultation Notes
                    </h6>
                    <textarea
                      className="form-control mb-3"
                      rows="4"
                      placeholder="✍️ Add your consultation notes here..."
                      value={notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      style={{ borderRadius: '10px' }}
                    />
                    <button className="btn btn-warning w-100 save-notes-btn" onClick={saveNotes}>
                      💾 Save Notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* In-page Notification */}
      {notification.show && (
        <div className={`position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-${notification.type === 'success' ? 'success' : notification.type === 'error' ? 'danger' : 'info'} alert-dismissible shadow-lg`} style={{ zIndex: 9999, borderRadius: '15px' }}>
          <strong>{notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}</strong> {notification.message}
        </div>
      )}
    </div>
  );
};

export default VideoConsultation;