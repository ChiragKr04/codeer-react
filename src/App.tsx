import { useEffect, useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import './App.css';

function App() {
  const [userId, setUserId] = useState<string>('');
  const [editorData, setEditorData] = useState<string | undefined>('');
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [_, setKeyPressed] = useState<string | null>(null);

  function handleCodeChange(code: string | undefined) {
    setEditorData(code);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(code || '');
    } else {
      console.error('WebSocket is not connected');
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    setKeyPressed(event.key);
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key.toLowerCase() === 'enter') {
      setEditorData(prev => prev);
    }
    setKeyPressed(null);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsWsConnected(true);
    } else {
      console.error('WebSocket is not connected');
    }
  }, [socket]);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserId(e.target?.value);
    console.log(e.target?.value);
  }

  function connectWebSocket() {
    if (userId) {
      socketMessaging();
    }
  }

  function socketMessaging() {
    const ws = new WebSocket(`ws://localhost:3000/api/v1/ws/${userId}`);

    ws.onopen = function (event) {
      console.log('WebSocket connected:', event);
      setIsWsConnected(true);
    };

    ws.onmessage = function (event) {
      setEditorData(event.data);
    };

    ws.onerror = function (error) {
      console.error('WebSocket error:', error);
    };

    ws.onclose = function (event) {
      console.log('WebSocket closed:', event);
    };

    setSocket(ws);
  }

  return (
    <>
      <div className='App'>
        <input type="text" onChange={onInputChange} />
        <button onClick={connectWebSocket}>Connect WebSocket</button>
        {/* create an error */}
        {!isWsConnected && <p>WebSocket is not connected</p>}
        <CodeEditor
          value={editorData}
          language="js"
          placeholder="// Write your code here..."
          onChange={(evn) => handleCodeChange(evn.target.value)}
          data-color-mode="dark"
          disabled={!isWsConnected}
          style={{
            fontSize: 14,
            fontFamily: 'monospace',
            border: '1px solid #ccc',
            borderRadius: '8px',
            width: '100%',
            minHeight: '300px'
          }}
        />
      </div>
    </>
  );
}

export default App;
