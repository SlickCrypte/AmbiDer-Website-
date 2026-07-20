import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './MessagingInbox.module.css';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000')
  : 'https://freelancemarketplace-backend.onrender.com';

export default function MessagingInbox({ currentUser, activeRole }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const partnerIdFromUrl = searchParams.get('partnerId');

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Mobile responsive view toggle: 'list' or 'chat'
  const [mobileView, setMobileView] = useState('list');

  const wsRef = useRef(null);
  const chatBottomRef = useRef(null);

  // 1. Fetch conversations and check for URL partner injection
  const loadConversationsList = async (selectFirst = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        
        // Group messages by partner
        const uniquePartners = {};
        data.forEach(msg => {
          const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          if (!uniquePartners[partnerId] || new Date(msg.created_at) > new Date(uniquePartners[partnerId].created_at)) {
            uniquePartners[partnerId] = msg;
          }
        });

        const partnerIds = Object.keys(uniquePartners);
        const resolved = await Promise.all(partnerIds.map(async (pId) => {
          const lastMsg = uniquePartners[pId];
          let senderName = 'User';
          let initials = 'U';
          let avatarBg = '#FF6B35';
          let isVerified = false;
          try {
            const profileRes = await fetch(`${API_BASE_URL}/users/${pId}`);
            if (profileRes.ok) {
              const profile = await profileRes.json();
              senderName = profile.full_name || profile.name || 'User';
              initials = profile.initials || senderName.split(' ').map(n => n[0]).join('').toUpperCase();
              avatarBg = profile.avatar_bg || '#FF6B35';
              isVerified = (profile.is_verified && !!profile.linkedin_id) || false;
            }
          } catch (e) {
            console.warn("Failed to fetch partner profile:", e);
          }
          return {
            id: pId,
            name: senderName,
            initials,
            avatarBg,
            isVerified,
            time: new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            snippet: lastMsg.message,
            isRead: lastMsg.is_read || lastMsg.sender_id === currentUser.id,
            rawTime: lastMsg.created_at
          };
        }));

        resolved.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));

        // Inject URL partner if not already present
        let finalConvs = resolved;
        if (partnerIdFromUrl) {
          const exists = resolved.some(c => c.id === partnerIdFromUrl);
          if (!exists) {
            try {
              const profileRes = await fetch(`${API_BASE_URL}/users/${partnerIdFromUrl}`);
              if (profileRes.ok) {
                const profile = await profileRes.json();
                const name = profile.full_name || profile.name || 'User';
                const initials = profile.initials || name.split(' ').map(n => n[0]).join('').toUpperCase();
                const avatarBg = profile.avatar_bg || '#FF6B35';
                const isVerified = (profile.is_verified && !!profile.linkedin_id) || false;

                const tempConv = {
                  id: partnerIdFromUrl,
                  name,
                  initials,
                  avatarBg,
                  isVerified,
                  time: '',
                  snippet: 'No messages yet. Send a message to start chatting!',
                  isRead: true,
                  isTemp: true
                };
                finalConvs = [tempConv, ...resolved];
                setSelectedPartner(tempConv);
                setMobileView('chat');
              }
            } catch (e) {
              console.warn("Failed to fetch profile for URL partner ID:", e);
            }
          } else {
            const found = resolved.find(c => c.id === partnerIdFromUrl);
            setSelectedPartner(found);
            setMobileView('chat');
          }
        } else if (selectFirst && resolved.length > 0 && !selectedPartner) {
          setSelectedPartner(resolved[0]);
        }

        setConversations(finalConvs);
      }
    } catch (err) {
      console.warn("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversationsList(true);
  }, [currentUser?.id, partnerIdFromUrl]);

  // 2. Fetch Chat History when active partner changes
  const fetchChatHistory = async (partnerId) => {
    if (!partnerId) return;
    setLoadingChat(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${currentUser.id}/${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
        
        // Mark as read
        await fetch(`${API_BASE_URL}/messages/read/${partnerId}/${currentUser.id}`, {
          method: 'PUT'
        });
      }
    } catch (err) {
      console.warn("Failed to fetch chat history:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (selectedPartner) {
      fetchChatHistory(selectedPartner.id);
    }
  }, [selectedPartner?.id, currentUser?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loadingChat]);

  // 3. WebSocket Real-Time Connection
  useEffect(() => {
    if (!currentUser?.id) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = API_BASE_URL.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}/messages/ws/${currentUser.id}`;

    let socket = new WebSocket(wsUrl);
    wsRef.current = socket;
    let pollInterval = null;

    socket.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data);
        
        // Append to history if relevant to selected conversation
        if (selectedPartner && (
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedPartner.id) ||
          (newMsg.sender_id === selectedPartner.id && newMsg.receiver_id === currentUser.id)
        )) {
          setChatHistory(prev => {
            // Avoid duplicate additions
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // Clear backend unread markers
          if (newMsg.receiver_id === currentUser.id) {
            fetch(`${API_BASE_URL}/messages/read/${selectedPartner.id}/${currentUser.id}`, {
              method: 'PUT'
            });
          }
        }

        // Reload conversation list to update snippets and times
        loadConversationsList(false);
      } catch (err) {
        console.error("Error parsing socket frame:", err);
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket closed. Setting up HTTP polling fallback...");
      if (!pollInterval && selectedPartner) {
        pollInterval = setInterval(() => {
          fetchChatHistory(selectedPartner.id);
        }, 4000);
      }
    };

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentUser?.id, selectedPartner?.id]);

  // 4. Send Message Handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedPartner) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    const messagePayload = {
      sender_id: currentUser.id,
      receiver_id: selectedPartner.id,
      message: textToSend,
      is_read: false
    };

    // Attempt WebSocket send
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        receiver_id: selectedPartner.id,
        message: textToSend
      }));
      setIsSending(false);
    } else {
      // HTTP POST Fallback
      try {
        const res = await fetch(`${API_BASE_URL}/messages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messagePayload)
        });
        if (res.ok) {
          const saved = await res.json();
          setChatHistory(prev => [...prev, saved]);
          loadConversationsList(false);
        }
      } catch (err) {
        console.warn("Failed to deliver message via HTTP:", err);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setMobileView('chat');
    // Clear URL parameters if changing conversations manually
    if (partnerIdFromUrl) {
      setSearchParams(params => {
        params.delete('partnerId');
        return params;
      });
    }
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  // Filter conversations based on query
  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.inboxCard}>
      {/* 2-Pane Chat Wrapper */}
      <div className={`${styles.chatWrapper} ${mobileView === 'chat' ? styles.showChatMobile : ''}`}>
        
        {/* LEFT COLUMN: CONVERSATION LIST */}
        <aside className={styles.leftPane}>
          <div className={styles.searchBarContainer}>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.conversationsList}>
            {loadingConversations ? (
              <div className={styles.centeredMsg}>Loading conversations...</div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = selectedPartner?.id === conv.id;
                return (
                  <button 
                    key={conv.id} 
                    onClick={() => handleSelectPartner(conv)}
                    className={`${styles.convItem} ${isSelected ? styles.convItemActive : ''}`}
                    type="button"
                  >
                    <div 
                      className={styles.avatar} 
                      style={{ backgroundColor: conv.avatarBg }}
                      aria-hidden="true"
                    >
                      {conv.initials}
                    </div>
                    <div className={styles.convDetails}>
                      <div className={styles.convHeaderRow}>
                        <h4 className={styles.partnerName}>
                          {conv.name}
                          {conv.isVerified && (
                            <span className={styles.verifiedIcon} title="LinkedIn Verified">✓</span>
                          )}
                        </h4>
                        <span className={styles.convTime}>{conv.time}</span>
                      </div>
                      <p className={styles.snippetText}>{conv.snippet}</p>
                    </div>
                    {!conv.isRead && <span className={styles.unreadDot} />}
                  </button>
                );
              })
            ) : (
              <div className={styles.centeredMsg}>No conversations found.</div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: ACTIVE THREAD VIEWPORT */}
        <section className={styles.rightPane}>
          {selectedPartner ? (
            <>
              {/* Header Details */}
              <div className={styles.chatHeader}>
                <button 
                  onClick={handleBackToList} 
                  className={styles.backButton}
                  type="button"
                  aria-label="Back to conversations list"
                >
                  ← Back
                </button>
                <div 
                  className={styles.headerAvatar} 
                  style={{ backgroundColor: selectedPartner.avatarBg }}
                >
                  {selectedPartner.initials}
                </div>
                <div className={styles.headerTitleCol}>
                  <h3 className={styles.headerName}>
                    {selectedPartner.name}
                    {selectedPartner.isVerified && (
                      <span className={styles.headerVerifiedBadge}>Verified</span>
                    )}
                  </h3>
                  <p className={styles.headerSubtitle}>
                    {activeRole === 'client' ? 'Freelancer Profile' : 'Client Profile'}
                  </p>
                </div>
              </div>

              {/* Scrollable Message History */}
              <div className={styles.messagesContainer}>
                {loadingChat && chatHistory.length === 0 ? (
                  <div className={styles.centeredMsg}>Loading messages...</div>
                ) : chatHistory.length > 0 ? (
                  <div className={styles.messagesList}>
                    {chatHistory.map((msg) => {
                      const isMe = msg.sender_id === currentUser.id;
                      return (
                        <div 
                          key={msg.id} 
                          className={`${styles.messageRow} ${isMe ? styles.rowMe : styles.rowPartner}`}
                        >
                          {!isMe && (
                            <div 
                              className={styles.bubbleAvatar} 
                              style={{ backgroundColor: selectedPartner.avatarBg }}
                            >
                              {selectedPartner.initials}
                            </div>
                          )}
                          <div className={styles.bubbleCol}>
                            <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubblePartner}`}>
                              <p className={styles.bubbleText}>{msg.message}</p>
                            </div>
                            <span className={styles.bubbleTime}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>
                ) : (
                  <div className={styles.centeredMsg}>
                    No messages yet. Send a message below to start your conversation.
                  </div>
                )}
              </div>

              {/* Chat Input Deck */}
              <form onSubmit={handleSendMessage} className={styles.inputDeck}>
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={styles.messageInput}
                  disabled={isSending}
                />
                <button 
                  type="submit" 
                  className={styles.sendButton}
                  disabled={isSending || !inputMessage.trim()}
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className={styles.noChatSelected}>
              <div className={styles.noChatIcon}>✉️</div>
              <h3>Your Inbox</h3>
              <p>Select a conversation from the left to read messages and reply.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
