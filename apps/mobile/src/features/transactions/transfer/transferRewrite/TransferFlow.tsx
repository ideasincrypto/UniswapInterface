import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectModalState } from 'src/features/modals/selectModalState'
import { useOnCloseSendModal } from 'src/features/transactions/swap/hooks/useOnCloseSendModal'
import { TransferFormScreen } from 'src/features/transactions/transfer/transferRewrite/TransferFormScreen'
import {
  TransferScreen,
  TransferScreenContextProvider,
  useTransferScreenContext,
} from 'src/features/transactions/transfer/transferRewrite/TransferScreenContext'
import { useWalletRestore } from 'src/features/wallet/hooks'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { ModalName, SectionName } from 'uniswap/src/features/telemetry/constants'
import { TradeProtocolPreference } from 'uniswap/src/features/transactions/transactionState/types'
import { SwapFormContextProvider, SwapFormState } from 'wallet/src/features/transactions/contexts/SwapFormContext'
import { TransactionModal } from 'wallet/src/features/transactions/swap/TransactionModal'
import { getFocusOnCurrencyFieldFromInitialState } from 'wallet/src/features/transactions/swap/hooks/useSwapPrefilledState'
import { useActiveAccountWithThrow } from 'wallet/src/features/wallet/hooks'

/**
 * @todo: The screens within this flow are not implemented.
 * MOB-555 https://linear.app/uniswap/issue/MOB-555/implement-updated-send-flow
 */
export function TransferFlow(): JSX.Element {
  // We need this additional `screen` state outside of the `SwapScreenContext` because the `TransferContextProvider` needs to be inside the `BottomSheetModal`'s `Container`.
  const [screen, setScreen] = useState<TransferScreen>(TransferScreen.TransferForm)
  const fullscreen = screen === TransferScreen.TransferForm
  const onClose = useOnCloseSendModal()

  const account = useActiveAccountWithThrow()
  const { walletNeedsRestore, openWalletRestoreModal } = useWalletRestore()

  return (
    <TransactionModal
      account={account}
      fullscreen={fullscreen}
      modalName={ModalName.Send}
      openWalletRestoreModal={openWalletRestoreModal}
      walletNeedsRestore={walletNeedsRestore}
      onClose={onClose}
    >
      <TransferContextsContainer>
        <CurrentScreen screen={screen} setScreen={setScreen} />
      </TransferContextsContainer>
    </TransactionModal>
  )
}

function CurrentScreen({
  screen,
  setScreen,
}: {
  screen: TransferScreen
  setScreen: Dispatch<SetStateAction<TransferScreen>>
}): JSX.Element {
  const { screen: contextScreen, screenRef: contextScreenRef } = useTransferScreenContext()

  useEffect(() => {
    setScreen(contextScreen)
  }, [contextScreen, contextScreenRef, setScreen])

  switch (screen) {
    case TransferScreen.TransferForm:
      return (
        <Trace logImpression section={SectionName.TransferForm}>
          <TransferFormScreenDelayedRender />
        </Trace>
      )
    default:
      throw new Error(`Unknown screen: ${screen}`)
  }
}

function TransferFormScreenDelayedRender(): JSX.Element {
  const [hideContent, setHideContent] = useState(true)
  useEffect(() => {
    setTimeout(() => setHideContent(false), 25)
  }, [])
  return <TransferFormScreen hideContent={hideContent} />
}

function TransferContextsContainer({ children }: { children?: ReactNode }): JSX.Element {
  const { initialState } = useSelector(selectModalState(ModalName.Send))

  const prefilledState = useMemo(
    (): SwapFormState | undefined =>
      initialState
        ? {
            customSlippageTolerance: initialState.customSlippageTolerance,
            exactAmountFiat: initialState.exactAmountFiat,
            exactAmountToken: initialState.exactAmountToken,
            exactCurrencyField: initialState.exactCurrencyField,
            focusOnCurrencyField: getFocusOnCurrencyFieldFromInitialState(initialState),
            input: initialState.input ?? undefined,
            output: initialState.output ?? undefined,
            selectingCurrencyField: initialState.selectingCurrencyField,
            txId: initialState.txId,
            isFiatMode: false,
            isSubmitting: false,
            tradeProtocolPreference: TradeProtocolPreference.Default,
          }
        : undefined,
    [initialState],
  )

  return (
    <TransferScreenContextProvider>
      <SwapFormContextProvider prefilledState={prefilledState}>{children}</SwapFormContextProvider>
    </TransferScreenContextProvider>
  )
}
