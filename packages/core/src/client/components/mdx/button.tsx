import {
  Button as ButtonPrimitive,
  buttonVariants,
  type ButtonProps,
} from '@components/primitives/button'
import { cn } from '@client/utils/cn'

export type { ButtonProps } from '@components/primitives/button'

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
