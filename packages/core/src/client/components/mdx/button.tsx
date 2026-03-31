import { ButtonPrimitive, buttonVariants } from '@components/primitives/button'
import type { ButtonPrimitiveProps } from '@components/primitives/button'
import { cn } from '@client/utils/cn'

export const Button = ({
  className,
  variant,
  size,
  rounded,
  iconSize,
  disabled,
  ...props
}: ButtonPrimitiveProps) => {
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
