import React from 'react'
import { Modal, Button as RBButton } from 'react-bootstrap'

export default function Dialog({ open, onClose, children } : { open: boolean, onClose: ()=>void, children: React.ReactNode }){
  return (
    <Modal show={open} onHide={onClose} centered>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <RBButton variant="secondary" onClick={onClose}>Close</RBButton>
      </Modal.Footer>
    </Modal>
  )
}
