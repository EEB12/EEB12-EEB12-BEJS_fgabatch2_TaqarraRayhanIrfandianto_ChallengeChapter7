import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useLocation, useNavigate , useParams} from 'react-router-dom';

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Extract token from the URL
  const { token } = useParams()
  console.log(token)
  // Submit new password
  const handleResetPassword = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/api/v1/user/change-forgot-password?resettoken=${token}`, { password:password });

      if (response.status === 200) {
        toast({ title: 'Password reset successful', status: 'success', duration: 5000 });
        navigate('/');
      } else {
        toast({ title: 'Failed to reset password', status: 'error', duration: 5000 });
      }
    } catch (error) {
      toast({ title: `Error: ${error.message}`, status: 'error', duration: 5000 });
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt="10" p="5" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="lg" mb="6" textAlign="center">Reset Password</Heading>
      <FormControl id="password" mb="4" isRequired>
        <FormLabel>New Password</FormLabel>
        <Input
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      <Button colorScheme="blue" onClick={handleResetPassword} width="full">Reset Password</Button>
    </Box>
  );
}

export default ResetPasswordPage;