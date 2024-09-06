// src/components/OTPModal.jsx
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';

const OTPModal = ({ isOpen, onClose, onSubmit, otp, setOtp }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>OTP sent to email. Enter OTP </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="otp" isRequired>
            <FormLabel>OTP</FormLabel>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onSubmit}>
            Submit OTP
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OTPModal;