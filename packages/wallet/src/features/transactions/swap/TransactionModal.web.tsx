import { FadeIn } from 'react-native-reanimated'
import { Flex } from 'ui/src'
import { AnimatedFlex } from 'ui/src/components/layout/AnimatedFlex'
import { TransactionModalContextProvider } from 'wallet/src/features/transactions/contexts/TransactionModalContext'
import {
  TransactionModalFooterContainerProps,
  TransactionModalInnerContainerProps,
  TransactionModalProps,
} from 'wallet/src/features/transactions/swap/TransactionModalProps'

export function TransactionModal({
  account,
  children,
  onClose,
  openWalletRestoreModal,
  walletNeedsRestore,
}: TransactionModalProps): JSX.Element {
  return (
    <Flex fill justifyContent="flex-end">
      <TransactionModalContextProvider
        account={account}
        bottomSheetViewStyles={{}}
        openWalletRestoreModal={openWalletRestoreModal}
        walletNeedsRestore={walletNeedsRestore}
        onClose={onClose}
      >
        {children}
      </TransactionModalContextProvider>
    </Flex>
  )
}

export function TransactionModalInnerContainer({
  fullscreen,
  children,
}: TransactionModalInnerContainerProps): JSX.Element {
  return <Flex fill={fullscreen}>{children}</Flex>
}

export function TransactionModalFooterContainer({ children }: TransactionModalFooterContainerProps): JSX.Element {
  return (
    <AnimatedFlex entering={FadeIn} position="relative" pt="$spacing24">
      {children}
    </AnimatedFlex>
  )
}
