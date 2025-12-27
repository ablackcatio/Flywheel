'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './Box.module.css';

// 动态导入以避免SSR问题
const Box3DScene = dynamic(() => import('./Box3DScene'), { ssr: false });

export default function BoxPage() {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // 检查登录状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('flywheel_user');
      if (!userInfo) {
        router.push('/');
      }
    }
  }, [router]);

  // 设置日期
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const chatDateText = document.getElementById('chat-date-text');
    if (chatDateText) {
      chatDateText.textContent = `box ${month}月${day}日`;
    }
  }, []);

  // 输入框自动调整高度
  useEffect(() => {
    const chatInput = chatInputRef.current;
    if (!chatInput) return;

    const adjustHeight = () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    };

    chatInput.addEventListener('input', adjustHeight);
    adjustHeight(); // 初始调整

    return () => {
      chatInput.removeEventListener('input', adjustHeight);
    };
  }, []);

  // 添加聊天消息
  const addChatMessage = (text: string, sender: 'user' | 'assistant', isReasoning = false, isError = false) => {
    if (!chatMessagesRef.current) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = styles.chatMessage;

    if (sender === 'user') {
      messageDiv.style.background = '#fffacd';
      messageDiv.style.textAlign = 'right';
    } else if (isReasoning) {
      messageDiv.style.background = '#fff9c4';
      messageDiv.style.fontStyle = 'italic';
      messageDiv.style.color = '#666';
      messageDiv.style.marginBottom = '6px';
    } else if (isError) {
      messageDiv.style.background = '#ffebee';
      messageDiv.style.color = '#c62828';
    } else {
      messageDiv.style.background = '#e8f4f8';
    }

    messageDiv.textContent = text;
    chatMessagesRef.current.appendChild(messageDiv);
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  };

  // 显示加载消息
  const showLoadingMessage = (): string | null => {
    if (!chatMessagesRef.current) return null;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = styles.chatMessage;
    const id = 'loading-message-' + Date.now();
    loadingDiv.id = id;
    loadingDiv.style.background = '#e8f4f8';
    loadingDiv.style.fontStyle = 'italic';
    loadingDiv.style.color = '#666';
    loadingDiv.textContent = '正在思考...';
    chatMessagesRef.current.appendChild(loadingDiv);
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    return id;
  };

  // 移除加载消息
  const removeLoadingMessage = (messageId: string | null) => {
    if (!messageId) return;
    const loadingMessage = document.getElementById(messageId);
    if (loadingMessage) loadingMessage.remove();
  };

  // 分析用户数据（首次或定期）
  const analyzeUserData = async (userId: string) => {
    try {
      const response = await fetch('/api/users/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('用户数据分析完成:', result.data);
        return result.data;
      }
    } catch (error) {
      console.error('分析用户数据失败:', error);
    }
    return null;
  };

  // 保存用户数据到服务器
  const saveUserData = async (chatHistory: Array<{ role: string; content: string }>) => {
    try {
      if (typeof window === 'undefined') return;

      const userInfoStr = localStorage.getItem('flywheel_user');
      if (!userInfoStr) return;

      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 如果没有userId，添加到userInfo中
      if (!userInfo.userId) {
        userInfo.userId = userId;
        localStorage.setItem('flywheel_user', JSON.stringify(userInfo));
      }

      // 获取当前选中的照片信息（如果有）
      const selectedPhotoNumber = (window as any).getSelectedPhotoNumber?.() || null;

      await fetch('/api/users/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userInfo,
          chatHistory,
          photoData: {
            selectedPhotoNumber,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      // 如果有足够的聊天记录（超过3条对话），触发用户数据分析
      const userMessages = chatHistory.filter((msg: any) => msg.role === 'user').length;
      if (userMessages >= 3) {
        // 检查是否已经分析过（避免重复分析）
        const lastAnalysis = localStorage.getItem(`lastAnalysis_${userId}`);
        const now = Date.now();
        // 如果距离上次分析超过1小时，或者从未分析过，则重新分析
        if (!lastAnalysis || (now - parseInt(lastAnalysis)) > 3600000) {
          await analyzeUserData(userId);
          localStorage.setItem(`lastAnalysis_${userId}`, now.toString());
        }
      }
    } catch (error) {
      console.error('保存用户数据失败:', error);
      // 不阻塞用户操作，静默失败
    }
  };

  // 发送消息到智谱AI
  const sendMessage = async (userMessage: string) => {
    if (isLoading) return;

    setIsLoading(true);
    addChatMessage(userMessage, 'user');
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);

    const loadingMessageId = showLoadingMessage();

    try {
      // 获取userId
      let userId = null;
      if (typeof window !== 'undefined') {
        const userInfoStr = localStorage.getItem('flywheel_user');
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr);
            userId = userInfo.userId;
            console.log('📤 前端发送请求，userId:', userId, 'userInfo:', {
              nickname: userInfo.nickname,
              mbti: userInfo.mbti,
              hasUserId: !!userInfo.userId,
            });
          } catch (error) {
            console.error('解析用户信息失败:', error);
          }
        } else {
          console.warn('⚠️ localStorage中未找到flywheel_user');
        }
      }

      const requestBody = {
        messages: newHistory,
        thinking: { type: 'enabled' },
        userId: userId,
      };
      
      console.log('📤 发送到/api/chat的请求体:', {
        messagesCount: newHistory.length,
        hasUserId: !!userId,
        userId: userId,
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorText = responseText || response.statusText || '未知错误';
        try {
          const errorJson = JSON.parse(responseText);
          errorText = errorJson.error || errorJson.message || errorText;
        } catch (e) {}
        throw new Error(`HTTP错误 ${response.status}: ${errorText}`);
      }

      if (!responseText || responseText.trim() === '') {
        throw new Error('响应为空');
      }

      const data = JSON.parse(responseText);
      removeLoadingMessage(loadingMessageId);

      if (data.success && data.data?.choices?.[0]?.message) {
        const assistantMessage = data.data.choices[0].message.content || '';
        const reasoning = data.data.choices[0].message.reasoning_content;

        if (reasoning) {
          addChatMessage(reasoning, 'assistant', true);
        }

        addChatMessage(assistantMessage, 'assistant');
        const finalHistory = [...newHistory, { role: 'assistant', content: assistantMessage }];
        setChatHistory(finalHistory);

        // 保存用户数据（包括聊天记录）
        await saveUserData(finalHistory);
      } else {
        throw new Error(data.error || data.message || 'API 调用失败');
      }
    } catch (error: any) {
      console.error('发送消息错误:', error);
      removeLoadingMessage(loadingMessageId);
      addChatMessage(`错误: ${error.message || '发送消息失败'}`, 'assistant', false, true);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车发送
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = chatInputRef.current?.value.trim();
      if (message && !isLoading) {
        sendMessage(message);
        if (chatInputRef.current) {
          chatInputRef.current.value = '';
          chatInputRef.current.style.height = '24px';
        }
      }
    }
  };

  // 对话框处理函数 - 暴露到window对象供app.js调用
  useEffect(() => {
    (window as any).handleDialogYes = function() {
      console.log('用户选择了"是"');
      const dialog = document.getElementById('photo-dialog');
      if (dialog) {
        (dialog as HTMLElement).style.display = 'none';
      }
      if ((window as any).collectAllPhotosAndParticles) {
        const photoNumber = (window as any).getSelectedPhotoNumber ? (window as any).getSelectedPhotoNumber() : null;
        (window as any).collectAllPhotosAndParticles(null);
        setTimeout(() => {
          if (photoNumber === 4 && (window as any).showC2_2Cube) {
            (window as any).showC2_2Cube();
          } else if (photoNumber === 6 && (window as any).showB1_2Cube) {
            (window as any).showB1_2Cube();
          }
        }, 2000);
      }
    };

    (window as any).handleDialogNo = function() {
      console.log('用户选择了"否"');
      const dialog = document.getElementById('photo-dialog');
      if (dialog) {
        (dialog as HTMLElement).style.display = 'none';
      }
      if ((window as any).deselectPhoto) {
        (window as any).deselectPhoto();
      }
    };

    (window as any).handleDialogClose = function() {
      const dialog = document.getElementById('photo-dialog');
      if (dialog) {
        (dialog as HTMLElement).style.display = 'none';
      }
      if ((window as any).deselectPhoto) {
        (window as any).deselectPhoto();
      }
    };

    return () => {
      delete (window as any).handleDialogYes;
      delete (window as any).handleDialogNo;
      delete (window as any).handleDialogClose;
    };
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* 3D Scene */}
      <Box3DScene />

      {/* 照片对话框 */}
      <div id="photo-dialog" className={styles.photoDialog} style={{ display: 'none' }}>
        <div className={styles.dialogContent}>
          <div className={styles.dialogTitleBar}>
            <span className={styles.dialogTitleText} id="dialog-title">@box</span>
          </div>
          <div className={styles.dialogMenuBar}>
            <span>文件</span>
            <span>聊天</span>
            <span>声音</span>
            <span>查看</span>
            <span>帮助</span>
          </div>
          <div className={styles.dialogMainContent}>
            {/* 左侧图片面板 */}
            <div className={styles.dialogImagePanel}>
              <div className={styles.dialogImagePlaceholder} id="dialog-image-placeholder">图片</div>
              <img id="dialog-image" src="" style={{ display: 'none' }} />
            </div>
            {/* 右侧聊天面板 */}
            <div className={styles.dialogChatPanel}>
              <div className={styles.dialogChatHeader}>
                <div className={styles.dialogChatHeaderLeft}>
                  <span id="dialog-chat-name">@box</span>
                  <span>▼</span>
                </div>
              </div>
              <div ref={chatMessagesRef} className={styles.dialogChatArea} id="chat-messages">
                <div className={styles.chatDate} id="chat-date">
                  <span>📅</span>
                  <span id="chat-date-text">box 12月27日</span>
                </div>
                <div className={`${styles.chatMessage} ${styles.welcomeMessage}`}>
                  <span>👋</span> 我是 box, 什么都可以问我!
                </div>
              </div>
              <div className={styles.chatInputArea}>
                <div className={styles.dialogButtons}>
                  <button 
                    className={styles.dialogBtn} 
                    onClick={() => {
                      if ((window as any).handleDialogYes) {
                        (window as any).handleDialogYes();
                      }
                    }}
                  >
                    是
                  </button>
                  <button 
                    className={styles.dialogBtn}
                    onClick={() => {
                      if ((window as any).handleDialogNo) {
                        (window as any).handleDialogNo();
                      }
                    }}
                  >
                    否
                  </button>
                </div>
                <div className={styles.chatInputWrapper}>
                  <textarea
                    ref={chatInputRef}
                    onKeyDown={handleKeyDown}
                    className={styles.chatInput}
                    placeholder="输入文字内容..."
                    rows={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
