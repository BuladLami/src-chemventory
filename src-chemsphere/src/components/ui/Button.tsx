import RBButton from 'react-bootstrap/Button'
import type { ButtonProps as RBButtonProps } from 'react-bootstrap/Button'

type Props = RBButtonProps & {
  variant?: RBButtonProps['variant'] | 'destructive' | 'ghost'
}

export default function Button({ variant='dark', children, ...props }: Props) {
  // map our 'destructive' and 'ghost' to bootstrap variants
  const v = (variant === 'destructive' ? 'danger' : variant === 'ghost' ? 'outline-secondary' : variant) as RBButtonProps['variant']
  return <RBButton variant={v} {...props}>{children}</RBButton>
}
