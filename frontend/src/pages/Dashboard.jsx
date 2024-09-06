import { useEffect, useState } from 'react';
import { Box, Text, Heading, Alert, AlertIcon, Button, Input, FormControl, FormLabel ,useDisclosure} from '@chakra-ui/react';
import io from 'socket.io-client';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import ChangePassword from '../component/ChangePassword';

function Dashboard() {
  const [notification, setNotification] = useState(null);
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem("Token");
  const [newPassword, setNewPassword] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (token) {
      // Decode JWT
      const decoded = jwtDecode(token);
      const { id_user } = decoded;

      const initSocket = io("http://localhost:3000", {
        query: {
          id_user,
        },
      });

      setSocket(initSocket);

      // Listen for connection
      initSocket.on("connect", () => {
        console.log("Connected to the server with socket ID:", initSocket.id);
      });

      // Listen for disconnection
      initSocket.on("disconnect", () => {
        console.log("Disconnected from the server");
      });
      initSocket.on("new-notification", (data) => {
        setNotification(data.message);
      });
      // Cleanup
      return () => {
        initSocket.disconnect();
      };

    }
  }, [token]);

  const handleChangePassword = async (newPassword) => {
    try {
      const decoded = jwtDecode(token);


      const response = await axios.post('http://localhost:3000/api/v1/user/change-password', { email:decoded.email, password:newPassword });
      
      if (response.status === 200) {
        // After password change, emit a new notification using Socket.io
        socket.emit("new-notification", {
          message: "Your password has been successfully changed!",
          recipientId: decoded.id_user
        });
      } else {
        console.log("Password change failed");
      }
     
    } catch (error) {
      console.error("Error sending reset link", error);
    }
  };
  const handleTestEmit = () => {
    console.log("tombol bisa")
    const decoded = jwtDecode(token);
    const { id_user } = decoded;

    socket.emit("new-notification", {
      message: "Hello, this is a test notification",
      recipientId: id_user
    });
  }
  return (
    <Box maxW="sm" mx="auto" mt="10" p="5" borderWidth="2px" borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="lg" mb="6" textAlign="center">Dashboard</Heading>

      {notification && (
        <Alert status="info" mt="4">
          <AlertIcon />
          {notification}
        </Alert>
      )}
      <Text mt="4">Welcome to your dashboard! You will receive notifications here.</Text>

      
      {/* Test Emit Button */}
      <Button colorScheme="teal" mt="4" onClick={() => {
        const decoded = jwtDecode(token);
        const { id_user } = decoded;
        socket.emit("new-notification", {
          message: "This is a test notification",
          recipientId: id_user
        });
      }}>
        Test Emit
      </Button>

      {/* Forgot Password Button to open modal */}
      <Button colorScheme="blue" mt="4" ms="4"  onClick={onOpen}>
        Change Password
      </Button>

      {/* Forgot Password Modal */}
      <ChangePassword
        isOpen={isOpen}
        onClose={onClose}
        handleChangePassword={handleChangePassword}
      />
    </Box>
  );
}

export default Dashboard;