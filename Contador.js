import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import './Contador.css';

const Contador = () => {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedTime, setSelectedTime] = useState(15);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(true); // Nuevo estado para controlar visibilidad

  // Autenticación y carga inicial
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserRecords(user.uid);
      } else {
        const anonUser = await signInAnonymously(auth);
        setUser(anonUser.user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cargar registros del usuario
  const loadUserRecords = async (userId) => {
    try {
      const recordsRef = collection(db, 'usuarios', userId, 'records');
      const q = query(
        recordsRef, 
        orderBy('timestamp', 'desc'), 
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      
      const userRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().timestamp?.toDate().toLocaleString()
      }));
      
      setRecords(userRecords);
    } catch (error) {
      console.error("Error al cargar registros:", error);
    }
  };

  // Temporizador
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startGame = () => {
    setCount(0);
    setTimeLeft(selectedTime);
    setIsActive(true);
    setGameStarted(true);
  };

  const handleClick = () => {
    if (!gameStarted) {
      startGame();
      setCount(1);
      return;
    }

    if (isActive) {
      setCount(prevCount => prevCount + 1);
    }
  };

  const saveResult = async () => {
    if (!user) return;

    const cps = (count / selectedTime).toFixed(2);
    const resultData = {
      clicks: count,
      time: selectedTime,
      cps: parseFloat(cps),
      timestamp: new Date()
    };

    try {
      const recordsRef = collection(db, 'usuarios', user.uid, 'records');
      await addDoc(recordsRef, resultData);
      await loadUserRecords(user.uid);
    } catch (error) {
      console.error("Error al guardar resultado:", error);
    }
  };

  const resetGame = () => {
    setCount(0);
    setTimeLeft(0);
    setIsActive(false);
    setGameStarted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="contador-container">Cargando...</div>;
  }

  return (
    <div className="contador-container">
      <h1>Contador de Clicks</h1>
      {user?.isAnonymous && <p>Modo anónimo - Tus datos se guardarán localmente</p>}

      <div className="counter-display">
        <span className="count">Clicks: {count}</span>
        {gameStarted && (
          <span className="timer">Tiempo: {formatTime(timeLeft)}</span>
        )}
      </div>

      {!gameStarted ? (
        <>
          <div className="button-group">
            {[15, 30, 60].map(time => (
              <button 
                key={time}
                className={selectedTime === time ? 'active' : ''}
                onClick={() => setSelectedTime(time)}
              >
                {time}s
              </button>
            ))}
            <button onClick={startGame} className="active">
              Comenzar
            </button>
          </div>
        </>
      ) : (
        <div className="button-group">
          <div className="click-area" onClick={handleClick}>
            <p>Haz click aquí!</p>
          </div>

          {!isActive && timeLeft === 0 && (
            <>
              <button onClick={resetGame}>Intentar de nuevo</button>
              <button onClick={() => setGameStarted(false)}>Cambiar tiempo</button>
              <button onClick={saveResult} className="active">
                Guardar resultado
              </button>
            </>
          )}
        </div>
      )}

      <div className="history-control">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="toggle-history-button"
        >
          {showHistory ? 'Ocultar historial' : 'Mostrar historial'}
        </button>
      </div>

      {showHistory && records.length > 0 && (
        <div className="records">
          <h3>Tus últimos resultados</h3>
          <ul>
            {records.map((record, index) => (
              <li key={record.id || index}>
                {record.cps} CPS ({record.clicks} clicks en {record.time}s) - {record.date}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Contador;