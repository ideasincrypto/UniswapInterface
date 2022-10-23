import React, { memo, PropsWithChildren } from 'react'
import { Box } from 'src/components/layout/Box'

const NOTIFICATION_DOT_SIZE = 14

type Props = {
  children: PropsWithChildren<any>
  showIndicator?: boolean
}

function _NotificationBadge({ children, showIndicator }: Props) {
  return (
    <Box position="relative">
      {showIndicator && (
        <Box
          backgroundColor="accentAction"
          borderColor="background0"
          borderRadius="full"
          borderWidth={2}
          height={NOTIFICATION_DOT_SIZE}
          position="absolute"
          right={-2}
          top={-4}
          width={NOTIFICATION_DOT_SIZE}
          zIndex="popover"
        />
      )}
      {children}
    </Box>
  )
}

export const NotificationBadge = memo(_NotificationBadge)
