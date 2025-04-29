import React, { useState } from 'react';
import './Formulario.css';

const Formulario = () => {
  const [nombre, setNombre] = useState('');
  const [sobrenombre, setSobrenombre] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Formulario enviado:\nNombre: ${nombre}\nSobrenombre: ${sobrenombre}`);
  };

  return (
    <div className="formulario-container">
      <h2>Formulario</h2>
      <form onSubmit={handleSubmit} className="form">
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          className="input-field" 
          placeholder="Nombre"
        />
        <input 
          type="text" 
          value={sobrenombre} 
          onChange={(e) => setSobrenombre(e.target.value)} 
          className="input-field" 
          placeholder="Sobrenombre"
        />
        <button type="submit" className="submit-button">Enviar</button>
      </form>
    </div>
  );
};

export default Formulario;

