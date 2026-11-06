import React from 'react'

const Register = () => {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Cadastro</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
        <input type="text" placeholder="Nome completo" style={{ padding: '8px' }} />
        <input type="email" placeholder="E-mail" style={{ padding: '8px' }} />
        <input type="password" placeholder="Senha" style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', background: '#ffb6c1', border: 'none', borderRadius: '4px' }}>Cadastrar</button>
      </form>
    </div>
  )
}

export default Register