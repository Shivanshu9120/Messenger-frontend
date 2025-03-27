import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields!',
        text: 'Please enter both username and password.',
      });
      return;
    }

    try {
      const endpoint = isRegistering ? '/register' : '/login';
      const res = await axios.post(`https://messenger-backend-y9he.onrender.com/api/auth${endpoint}`, {
        username,
        password,
      });

      if (isRegistering) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You can now log in.',
          timer: 2000,
          showConfirmButton: false,
        });
        setIsRegistering(false);
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back!',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate('/chat');
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: error.response?.data?.error || 'Something went wrong',
      });
    }
  };

  const toggleAuthMode = () => {
    Swal.fire({
      title: isRegistering ? 'Switch to Login?' : 'Switch to Signup?',
      text: isRegistering
        ? 'Already have an account? Log in instead.'
        : "Don't have an account? Register now.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        setIsRegistering(!isRegistering);
      }
    });
  };

  return (
    <div className='flex flex-col items-center h-screen justify-center bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6'>
      <h2 className='font-pacific font-bold text-4xl text-white'>Messenger</h2>
      <div className='border shadow p-6 w-80 bg-white rounded-md'>
        <h3 className='text-2xl font-bold mb-4'>{isRegistering ? 'Signup' : 'Login'}</h3>
        <form onSubmit={handleSubmit}>
          <div className='mb-2'>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Username'
              className='w-full p-2 border rounded'
            />
          </div>
          <div className='mb-2'>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              className='w-full p-2 border rounded'
            />
          </div>
          <div>
            <p className='text-teal-600 text-sm ml-4 cursor-pointer' onClick={toggleAuthMode}>
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </p>
          </div>
          <div className='mb-4'>
            <button className='w-full mt-2 border p-2 rounded-md bg-teal-600 text-white hover:bg-white hover:text-teal-600'>
              {isRegistering ? 'Signup' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
