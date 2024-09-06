import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, useDisclosure, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OTPModal from '../component/OTPModal';  
import ForgotPasswordModal from '../component/ForgotPasswordModal'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isNeedOtp, setIsNeedOtp] = useState(false);
  const navigate = useNavigate();

  // Chakra UI modal handling
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isForgotOpen, onOpen: onForgotOpen, onClose: onForgotClose } = useDisclosure();  

  // Submit login credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/user/login', { email, password });

    
      if (response.data.is_need_otp) {
        setIsNeedOtp(true);
        onOpen(); 
      } else {
       
        navigate('/dashboard');
      }
    } catch (error) {
      console.log('Login failed');
    }
  };

  const handleOtpSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/user/verify-otp', { email, otp });
      if (response.data.token) {
        localStorage.setItem('Token', response.data.token);
        navigate('/dashboard');
      } else {
        console.log('OTP verification failed');
      }
    } catch (error) {
      console.log('OTP verification failed', error);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt="10" p="5" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="lg" mb="6" textAlign="center">Login</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="email" mb="4" isRequired>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" mb="4" isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="blue" type="submit" width="full" mb="4">Login</Button>
      </form>

      <Text color="blue.500" onClick={onForgotOpen} cursor="pointer">
        Forgot Password?
      </Text>

     
      {isNeedOtp && (
        <OTPModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleOtpSubmit}
          otp={otp}
          setOtp={setOtp}
        />
      )}

      
      <ForgotPasswordModal isOpen={isForgotOpen} onClose={onForgotClose} />
    </Box>
  );
}

export default LoginPage;
