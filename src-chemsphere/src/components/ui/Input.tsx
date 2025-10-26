import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export default function Input(props: InputProps) {
  // Use Bootstrap form-control class
  return (
    <input {...props} className={`form-control ${props.className||''}`} />
  )
}
