import {
  Button as ButtonPrimitive,
  buttonVariants,
  type ButtonProps,
} from '../primitives/button'
import { cn } from '../../utils/cn'

export type { ButtonProps } from '../primitives/button'

export const Button = ({
  className,
  variant,
  size,
  rounded,
  iconSize,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <ButtonPrimitive
      className={cn(
        'group',
        buttonVariants({
          variant,
          size,
          rounded,
          iconSize,
          disabled,
          className,
        }),
      )}
      {...props}
    />
  )
}
